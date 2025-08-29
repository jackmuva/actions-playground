import { openai } from '@ai-sdk/openai';
import { AsyncIterableStream, generateObject, InferUIMessageChunk, jsonSchema, ModelMessage, stepCountIs, streamText, tool, UIMessage } from 'ai';
import { z } from 'zod';

type WorkerResponse = {
	streamResult: AsyncIterableStream<InferUIMessageChunk<UIMessage>>;
}

export async function planWork(integrations: Array<string>, prompt: string,
	tools: any, messages: Array<ModelMessage>, paragonUserToken: string) {
	console.log("AVAILABLE TOOL INTEGRATIONS: ", Object.keys(tools));
	const { object: integrationPlan } = await generateObject({
		model: openai('gpt-5-nano'),
		schema: z.object({
			integrations: integrations.length > 0 ? z.array(z.enum(integrations as [string, ...string[]])) : z.array(z.string()),
			integrationSpecificPrompt: z.array(z.string()),
		}),
		system: `You have access to these integrations: ${integrations.join()}`,
		prompt: `Based off this request: "${prompt}", decide if an integration is needed 
			and if needed, what integrations are involved to complete the task. 
			In the integrationSpecificPrompt, reword the request to only have 
			information that is relevant to the specific integration`,
	});
	console.log("THE PLAN: ", integrationPlan);

	let defaultResponse: Array<WorkerResponse> = [];
	if (integrationPlan.integrations.length === 0) {
		const result = streamText({
			model: openai('gpt-4.1-nano'),
			system: 'you are a friendly agent',
			messages: messages
		});
		defaultResponse = [{
			streamResult: result.toUIMessageStream()
		}];
	}

	const workerResponses: Array<WorkerResponse> = await Promise.all(
		integrationPlan.integrations.map(async (integration, i) => {
			const toolsForIntegration = Object.fromEntries(
				tools[integration.toLowerCase()]?.map((toolFunction:
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
			console.log("Prompt Revision: ", integrationPlan.integrationSpecificPrompt[i]);

			const result = streamText({
				model: openai('gpt-5-nano'),
				system: `You are an agent for ${integration}. You have access to these tools: ${Object.keys(toolsForIntegration).join(', ')}.
					IMPORTANT: You MUST use the available tools to help with the user's request.
					Do not just describe what you would do - actually call the tools! Do NOT forget inputs`,
				messages: revisedMessages,
				stopWhen: stepCountIs(5),
				tools: toolsForIntegration,
			});
			return {
				streamResult: result.toUIMessageStream()
			}
		}),
	);

	return {
		plan: integrationPlan,
		workerResponses: integrationPlan.integrations.length === 0 ?
			defaultResponse : workerResponses,
	};
}
