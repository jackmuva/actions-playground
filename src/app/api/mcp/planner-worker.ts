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
		content: `Decide if an integration is needed and if needed, 
			what integrations are involved to complete the task. 

			In the integrationSpecificPrompt, reword the request to only have 
			information that is relevant to the specific integration. One 
			integrationSpecificPrompt per integration.`

	}
	const objectMessages = [...messages, objectPrompt];
	const { object: integrationPlan } = await generateObject({
		model: openai('gpt-5-nano'),
		schema: z.object({
			integrations: integrations.length > 0 ? z.array(z.enum(integrations as [string, ...string[]])) : z.array(z.string()),
			integrationSpecificPrompt: z.array(z.string()),
		}),
		system: `You have access to these integrations: ${integrations.join()}`,
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
