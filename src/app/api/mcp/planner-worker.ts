import { openai } from '@ai-sdk/openai';
import { experimental_createMCPClient, AsyncIterableStream, generateObject, InferUIMessageChunk, ModelMessage, stepCountIs, streamText, UIMessage } from 'ai';
import { z } from 'zod';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

type WorkerResponse = {
	streamResult: AsyncIterableStream<InferUIMessageChunk<UIMessage>>;
}

export async function planWork(integrations: Array<string>, messages: Array<ModelMessage>) {
	const objectPrompt: ModelMessage = {
		role: "user",
		content: `You are a task planning assistant. Analyze the user's request and determine which integrations (if any) are needed to complete the task.

TASK ANALYSIS:
1. Read the user's request carefully
2. Identify what the user wants to accomplish
3. Determine if any of the available integrations can help with this task
4. If integrations are needed, select the most relevant ones
5. Create specific, focused prompts for each selected integration

INTEGRATION SELECTION RULES:
- Only select integrations that are directly relevant to the user's request
- If no integrations are needed, return an empty array
- Prefer fewer, more targeted integrations over many generic ones
- Each integration should serve a distinct purpose in completing the task

PROMPT CREATION RULES:
- Create one integrationSpecificPrompt for each selected integration
- Each prompt should contain ONLY the information relevant to that specific integration
- Remove any context that doesn't apply to the integration
- Make the prompt clear and actionable for the integration
- Use the same language and tone as the original request

EXAMPLE:
User: "Send a message to John on Slack and create a calendar event for our meeting tomorrow"
- integrations: ["slack", "calendar"]
- integrationSpecificPrompt: ["Send a message to John on Slack", "Create a calendar event for our meeting tomorrow"]

Return your analysis in the required JSON format.`

	}
	const objectMessages = [...messages, objectPrompt];
	const { object: integrationPlan } = await generateObject({
		model: openai('gpt-5-nano'),
		schema: z.object({
			integrations: integrations.length > 0 
				? z.array(z.enum(integrations as [string, ...string[]])).min(0).max(5).describe("Array of integration names needed for the task")
				: z.array(z.string()).min(0).max(5).describe("Array of integration names needed for the task"),
			integrationSpecificPrompt: z.array(z.string())
				.min(0)
				.max(5)
				.describe("Array of specific prompts for each integration, one per integration")
				.refine((prompts) => prompts.length === 0 || prompts.every(prompt => prompt.trim().length > 0), {
					message: "All integration-specific prompts must be non-empty strings"
				}),
		}),
		system: `You are an expert task planner that analyzes user requests and determines which integrations are needed to complete them.

AVAILABLE INTEGRATIONS: ${integrations.join(', ')}

Your job is to:
1. Understand what the user wants to accomplish
2. Identify which integrations can help achieve their goal
3. Create focused, integration-specific prompts that contain only relevant information

Be precise and selective - only recommend integrations that directly contribute to completing the user's request.`,
		messages: objectMessages
	});
	return integrationPlan
}

export async function executeWork(
	integrationPlan: { integrations: Array<string>, integrationSpecificPrompt: Array<string> },
	userId: string,
	messages: Array<ModelMessage>,
) {
	console.log("executing work...");
	const sseTransport = new SSEClientTransport(
		new URL(`${process.env.MCP_SERVER!}/sse?user=${userId}`),
	);
	console.log("SSE_TRANSPORT...", sseTransport);
	const mcpClient = await experimental_createMCPClient({
		transport: sseTransport,
	});
	console.log("MCP CLIENT...", mcpClient);

	const tools = await mcpClient.tools();
	console.log("RECEIVED TOOLS");

	let workerResponses: Array<WorkerResponse> = [];
	if (Object.keys(tools).length === 0 || integrationPlan.integrations.length === 0) {
		const result = streamText({
			model: openai('gpt-4.1-nano'),
			system: 'you are a friendly agent',
			messages: messages
		});
		workerResponses = [{
			streamResult: result.toUIMessageStream()
		}];
	} else {
		workerResponses = await Promise.all(
			integrationPlan.integrations.map(async (integration, i) => {
				const toolsForIntegration = Object.fromEntries(
					Object.keys(tools)
						.filter((tool) => integration === tool.split("_")[0].toLowerCase())
						.map((tool) => [tool, tools[tool]])
				);

				const revisedMessages: Array<ModelMessage> = [...messages];
				revisedMessages.pop();
				revisedMessages.push({
					role: 'user',
					content: [
						{
							type: "text",
							text: integrationPlan.integrationSpecificPrompt[i],
						}
					]
				});

				const result = streamText({
					model: openai('gpt-5-nano'),
					system: `You are an agent for ${integration}. You have access to these tools: ${Object.keys(toolsForIntegration).join(', ')}.
					IMPORTANT: You MUST use the available tools to help with the user's request.
					Do not just describe what you would do - actually call the tools! Do NOT forget inputs.

					If the latest tool output directs user to enable the integration via a setup link, 
					return the setup link in markdown format. Once an integration is setup, return tool 
					outputs and not the setup link.

					Be as concise as possible in your answers.`,
					messages: revisedMessages,
					stopWhen: stepCountIs(5),
					tools: toolsForIntegration,
				});
				return {
					streamResult: result.toUIMessageStream()
				}
			}),
		);
	}

	return {
		workerResponses: workerResponses
	};
}
