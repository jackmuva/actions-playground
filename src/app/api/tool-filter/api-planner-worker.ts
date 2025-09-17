import { openai } from '@ai-sdk/openai';
import { generateObject, ModelMessage, stepCountIs, streamText, tool, jsonSchema } from 'ai';
import { z } from 'zod';

export async function planWork(integrations: Array<string>, messages: Array<ModelMessage>) {
	const objectPrompt: ModelMessage = {
		role: "user",
		content: `Decide what integrations are needed to complete the task. 
			For generic requests, do not include any integrations.`
	}
	const objectMessages = [...messages, objectPrompt];
	const { object: integrationPlan } = await generateObject({
		model: openai('gpt-4o'),
		schema: z.object({
			integrations: integrations.length > 0 ? z.array(z.enum(integrations as [string, ...string[]])) : z.array(z.string()),
		}),
		system: `You have access to these integrations: ${integrations.join()}`,
		messages: objectMessages
	});
	return integrationPlan
}

export async function executeWork(
	tools: any,
	integrationPlan: { integrations: Array<string> },
	messages: Array<ModelMessage>,
	paragonUserToken: string,
) {
	if (Object.keys(tools).length === 0 || integrationPlan.integrations.length === 0) {
		const result = streamText({
			model: openai('gpt-4o'),
			system: 'you are a friendly agent',
			messages: messages
		});
		return result.toUIMessageStreamResponse();
	} else {
		let filteredTools = {};
		integrationPlan.integrations.map((integration) => {
			if (integration.toLowerCase() in tools) {
				const toolsForIntegration = Object.fromEntries(
					tools[integration.toLowerCase()]?.map((toolFunction:
						{ type: string, function: { name: string, description: string, parameters: any } }
					) => {
						return [toolFunction.function.name, tool({
							description: toolFunction.function.description,
							inputSchema: jsonSchema(toolFunction.function.parameters),
							execute: async (params: any) => {
								console.log(`EXECUTING TOOL: ${toolFunction.function.name}`);
								console.log(`Tool params:`, params);
								try {
									const response = await fetch(
										`https://actionkit.useparagon.com/projects/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}/actions`,
										{
											method: "POST",
											body: JSON.stringify({
												action: toolFunction.function.name,
												parameters: params,
											}),
											headers: {
												Authorization: `Bearer ${paragonUserToken}`,
												"Content-Type": "application/json",
											},
										}
									);
									const output = await response.json();
									if (!response.ok) {
										throw new Error(JSON.stringify(output, null, 2));
									}
									return output;
								} catch (err) {
									if (err instanceof Error) {
										return { error: { message: err.message } };
									}
									return err;
								}
							}
						})];
					})
				);
				filteredTools = { ...filteredTools, ...toolsForIntegration }
			}
		})
		const result = streamText({
			model: openai('gpt-4o'),
			system: `You MUST use the available tools to help with the user's request.
				Do not just describe what you would do - actually call the tools! Do NOT forget inputs.

				If there are no tools for the requested integration, 
				prompt user to connect integration within this application - ActionKit Playground.

				 Be as concise as possible in your answers.`,
			messages: messages,
			stopWhen: stepCountIs(5),
			tools: filteredTools,
		});
		return result.toUIMessageStreamResponse();
	}
}
