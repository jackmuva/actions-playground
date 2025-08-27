import { userWithToken } from '@/lib/auth';
import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages, stepCountIs, tool, AssistantModelMessage, ModelMessage } from 'ai';
import { NextResponse } from 'next/server';
import z from 'zod/v3';
import { decideActions } from './tool-selection';

export const maxDuration = 30;

export async function POST(req: Request) {
	const { messages }: { messages: UIMessage[] } = await req.json();
	const { user, paragonUserToken } = await userWithToken();
	if (!user) {
		return NextResponse.json({
			status: 401, message: "Unauthenticated user"
		});
	}

	const modelMessages = convertToModelMessages(messages);
	const lastUserMessage = messages.filter(m => m.role === 'user').pop();
	const metadata = lastUserMessage?.metadata as any;

	//@ts-expect-error text does exist
	const { plan, workerActions } = await decideActions(metadata.integrations, lastUserMessage?.parts[0].text, metadata.tools, modelMessages, paragonUserToken);
	// const workerMessages: Array<AssistantModelMessage> = workerActions.map((workerRes) => {
	// 	return {
	// 		role: "assistant",
	// 		content: workerRes.text,
	// 	}
	// });
	// workerMessages.unshift({
	// 	role: "assistant",
	// 	content: plan.explanation
	// });
	const seenToolCallIds = new Set<string>();
	let allWorkerMessages: Array<ModelMessage> = [];
	let filteredMessages: Array<ModelMessage> = [];
	for (const workerAction of workerActions) {
		filteredMessages = workerAction.messages.filter(msg => {
			if (msg.content && typeof msg.content === 'object' && !Array.isArray(msg.content)) {
				const content = msg.content as any;
				if (content.type === 'tool-result' && content.toolCallId && typeof content.toolCallId === 'string') {
					if (seenToolCallIds.has(content.toolCallId)) {
						return false;
					} else {
						seenToolCallIds.add(content.toolCallId);
						return true;
					}
				}
			}
			return true;
		});
		allWorkerMessages = [...filteredMessages, ...allWorkerMessages];
	}

	console.log("MESSAGES=============");
	for (const msg of modelMessages) {
		console.log("Full Message: ", msg);
	}

	console.log("WORKER MESSAGES=============");
	for (const msg of allWorkerMessages) {
		console.log("Full Message: ", msg);
	}

	const result = streamText({
		model: openai('gpt-4o'),
		messages: [...allWorkerMessages],
		// stopWhen: stepCountIs(5),
		// tools: {
		// 	weather: tool({
		// 		description: 'Get the weather in a location (fahrenheit)',
		// 		inputSchema: z.object({
		// 			location: z.string().describe('The location to get the weather for'),
		// 		}),
		// 		execute: async ({ location }) => {
		// 			const temperature = Math.round(Math.random() * (90 - 32) + 32);
		// 			return {
		// 				location,
		// 				temperature,
		// 			};
		// 		},
		// 	}),
		// },
	});

	return result.toUIMessageStreamResponse();
}
