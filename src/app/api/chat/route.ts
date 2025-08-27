import { userWithToken } from '@/lib/auth';
import { openai } from '@ai-sdk/openai';
import { UIMessage, convertToModelMessages } from 'ai';
import { NextResponse } from 'next/server';
import z from 'zod/v3';
import { decideActions } from './tool-selection';

export const maxDuration = 30;

export async function POST(req: Request) {
	const { messages }: { messages: UIMessage[] } = await req.json();
	console.log("UI MESSAGES: ", messages);
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
	const { plan, workerResponses } = await decideActions(metadata.integrations, lastUserMessage?.parts[0].text, metadata.tools, modelMessages, paragonUserToken);
	console.log("THE PLAN: ", plan);

	// const seenToolCallIds = new Set<string>();
	// let allWorkerMessages: Array<ModelMessage> = [];
	// let filteredMessages: Array<ModelMessage> = [];
	// for (const workerAction of workerActions) {
	// 	filteredMessages = [...filteredMessages, ...workerAction.messages];
	// 	allWorkerMessages = [...allWorkerMessages, ...filteredMessages];
	// }
	//
	// console.log("MESSAGES=============");
	// for (const msg of modelMessages) {
	// 	console.log("Full Message: ", msg);
	// }
	//
	// console.log("WORKER MESSAGES=============");
	// for (const msg of allWorkerMessages) {
	// 	console.log("ROLE: ", msg.role);
	// 	for (const chunk of msg.content) {
	// 		console.log("Content: ", chunk);
	// 	}
	// }

	return workerResponses[0].streamResult.toUIMessageStreamResponse();
}
