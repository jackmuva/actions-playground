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

	const workerActions = await Promise.all(
		integrationPlan.integrations.map(async integration => {
			const { text, toolCalls, toolResults } = await generateText({
				model: openai('gpt-4o'),
				system: `You are an agent equipped with tools on ${integration}. Explain what tools you used and why`,
				messages: messages,
				stopWhen: stepCountIs(5),
				tools: Object.fromEntries(
					tools[integration].map((toolFunction: { name: string, title: string, parameters: any }) => {
						return [toolFunction.name,
						tool({
							description: toolFunction.title,
							inputSchema: jsonSchema(toolFunction.parameters),
							execute: async (params: any, { toolCallId }) => {
								try {
									const response = await fetch(
										`https://actionkit.useparagon.com/projects/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}/actions`,
										{
											method: "POST",
											body: JSON.stringify({
												action: toolFunction.name,
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
						})]
					})),
			});
			console.log("text: ", text);
			console.log("tool calls: ", toolCalls);
			console.log("tool results: ", toolResults);

			return {
				text: text,
			};
		}),
	);

	return {
		plan: integrationPlan,
		workerActions: workerActions,
	};
}
