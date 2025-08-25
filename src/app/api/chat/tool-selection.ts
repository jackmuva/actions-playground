import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export async function decideAction(integrations: Array<string>, prompt: string) {
	const IntegrationEnum = z.enum(integrations as [string, ...string[]]);
	const { object: integrationPlan } = await generateObject({
		model: openai('o3-mini'),
		schema: z.object({
			integrations: z.array(IntegrationEnum),
		}),
		system: `You have access to these integrations: ${integrations}`,
		prompt: `Based off this request: "${prompt}", decide what integrations are involved
			to complete the task`,
	});

	const actions = await Promise.all(
		integrationPlan.integrations.map(async integration => {
			const { object: actions } = await generateObject({
				model: openai('gpt-4o'),
				schema: z.object({
					tools: z.array(z.string()),
					explanation: z.string(),
				}),
				system: `You are an agent equipped with tools on ${integration}.
					Decide what tools would be useful to this task.`,
				prompt: prompt,
			});

			return {
				integration,
				actions: actions,
			};
		}),
	);

	return {
		plan: integrationPlan,
		actions: actions,
	};
}
