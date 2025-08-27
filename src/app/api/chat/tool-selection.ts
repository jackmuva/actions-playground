import { openai } from '@ai-sdk/openai';
import { generateObject, generateText, jsonSchema, ModelMessage, stepCountIs, tool } from 'ai';
import { z } from 'zod';

export async function decideActions(integrations: Array<string>, prompt: string,
	tools: any, messages: Array<ModelMessage>, paragonUserToken: string) {
	const { object: integrationPlan } = await generateObject({
		model: openai('o3-mini'),
		schema: z.object({
			integrations: z.array(z.string()),
			explanation: z.string(),
		}),
		system: `You have access to these integrations: ${integrations.join()}`,
		prompt: `Based off this request: "${prompt}", decide what integrations are involved
			to complete the task`,
	});

	console.log("messages: ", messages);
	const workerActions = await Promise.all(
		integrationPlan.integrations.map(async integration => {
			const toolsForIntegration = Object.fromEntries(
				tools[integration].map((toolFunction:
					{ type: string, function: { name: string, title: string, inputs: any } }
				) => {
					return [toolFunction.function.name, tool({
						description: toolFunction.function.title,
						inputSchema: jsonSchema(toolFunction.function.inputs),
						execute: async (params: any, { toolCallId }) => {
							console.log(`🔧 EXECUTING TOOL: ${toolFunction.function.name}`);
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

			const result = await generateText({
				model: openai('gpt-4o'),
				system: `You are an agent for ${integration}. You have access to these tools: ${Object.keys(toolsForIntegration).join(', ')}.

					IMPORTANT: You MUST use the available tools to help with the user's request.
					Do not just describe what you would do - actually call the tools!`,
				messages: messages,
				stopWhen: stepCountIs(5),
				tools: toolsForIntegration,
			});

			console.log(`\n=== Results for ${integration} ===`);
			console.log(`Text: ${result.text}`);
			console.log(`Tool calls count: ${result.toolCalls.length}`);
			console.log(`Tool results count: ${result.toolResults.length}`);
			console.log(`Finish reason: ${result.finishReason}`);

			if (result.toolCalls.length > 0) {
				console.log(`Tool calls:`, result.toolCalls);
			}
			if (result.toolResults.length > 0) {
				console.log(`Tool results:`, result.toolResults);
			}

			return {
				text: result.text,
				toolCalls: result.toolCalls,
				toolResults: result.toolResults,
			};
		}),
	);

	return {
		plan: integrationPlan,
		workerActions: workerActions,
	};
}
