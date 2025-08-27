import { openai } from '@ai-sdk/openai';
import { generateObject, generateText, jsonSchema, ModelMessage, stepCountIs, streamText, tool } from 'ai';
import { z } from 'zod';

export async function decideActions(integrations: Array<string>, prompt: string,
	tools: any, messages: Array<ModelMessage>, paragonUserToken: string) {
	const { object: integrationPlan } = await generateObject({
		model: openai('o3-mini'),
		schema: z.object({
			integrations: integrations.length > 0 ? z.array(z.enum(integrations as [string, ...string[]])) : z.array(z.string()),
			explanation: z.string(),
		}),
		system: `You have access to these integrations: ${integrations.join()}`,
		prompt: `Based off this request: "${prompt}", decide what integrations are involved
			to complete the task`,
	});

	const workerResponses = await Promise.all(
		integrationPlan.integrations.map(async integration => {
			const toolsForIntegration = Object.fromEntries(
				tools[integration].map((toolFunction:
					{ type: string, function: { name: string, title: string, inputs: any } }
				) => {
					return [toolFunction.function.name, tool({
						description: toolFunction.function.title,
						inputSchema: jsonSchema(toolFunction.function.inputs),
						execute: async (params: any, { toolCallId }) => {
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

			const result = streamText({
				model: openai('gpt-4o'),
				system: `You are an agent for ${integration}. You have access to these tools: ${Object.keys(toolsForIntegration).join(', ')}.
					IMPORTANT: You MUST use the available tools to help with the user's request.
					Do not just describe what you would do - actually call the tools!`,
				messages: messages,
				stopWhen: stepCountIs(5),
				tools: toolsForIntegration,
			});
			return {
				streamResult: result
			}

			// let fullMessages: Array<ModelMessage> = [];
			// for (const step of result.steps) {
			// 	fullMessages = [...fullMessages, ...step.response.messages];
			// }
			// console.log("full message of tool call agent: ", fullMessages);
			// console.log("tool call text: ", result.text);
			// return {
			// 	text: result.text,
			// 	messages: fullMessages,
			// };
		}),
	);

	return {
		plan: integrationPlan,
		workerResponses: workerResponses,
	};
}
