import { openai } from '@ai-sdk/openai';
import { generateObject, jsonSchema, ModelMessage, stepCountIs, streamText, tool } from 'ai';
import { z } from 'zod';

type WorkerResponse = {
	streamResult: any;
}

export async function planWork(integrations: Array<string>, prompt: string,
	tools: any, messages: Array<ModelMessage>, paragonUserToken: string) {
	const { object: integrationPlan } = await generateObject({
		model: openai('gpt-5-nano'),
		schema: z.object({
			integrations: integrations.length > 0 ? z.array(z.enum(integrations as [string, ...string[]])) : z.array(z.string()),
			explanation: z.string(),
		}),
		system: `You have access to these integrations: ${integrations.join()}`,
		prompt: `Based off this request: "${prompt}", decide if an integration is needed 
			and if needed, what integrations are involved to complete the task. 
			Be extremely concise - one sentence - for the explanation`,
	});

	let defaultResponse: Array<WorkerResponse> = [];
	if (integrationPlan.integrations.length === 0) {
		const result = streamText({
			model: openai('gpt-4.1-nano'),
			system: 'you are a friendly agent',
			messages: messages
		});
		defaultResponse = [{
			streamResult: result
		}];
	}

	const workerResponses = await Promise.all(
		integrationPlan.integrations.map(async integration => {
			const toolsForIntegration = Object.fromEntries(
				tools[integration].map((toolFunction:
					{ type: string, function: { name: string, title: string, parameters: any } }
				) => {
					return [toolFunction.function.name, tool({
						description: toolFunction.function.title,
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

			const result = streamText({
				model: openai('gpt-5-nano'),
				system: `You are an agent for ${integration}. You have access to these tools: ${Object.keys(toolsForIntegration).join(', ')}.
					IMPORTANT: You MUST use the available tools to help with the user's request.
					Do not just describe what you would do - actually call the tools! Do NOT forget inputs`,
				messages: messages,
				stopWhen: stepCountIs(5),
				tools: toolsForIntegration,
			});
			return {
				streamResult: result
			}
		}),
	);

	return {
		plan: integrationPlan,
		workerResponses: integrationPlan.integrations.length === 0 ?
			defaultResponse : workerResponses,
	};
}
