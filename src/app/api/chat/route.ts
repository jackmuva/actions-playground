import { userWithToken } from '@/lib/auth';
import { UIMessage, convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { NextResponse } from 'next/server';
import { planWork } from './planner-worker';

export const maxDuration = 180;

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
	const { plan, workerResponses } = await planWork(metadata.integrations, lastUserMessage?.parts[0].text, metadata.tools, modelMessages, paragonUserToken);

	const response = createUIMessageStreamResponse({
		status: 200,
		statusText: "OK",
		stream: createUIMessageStream({
			execute({ writer }) {
				for (const workerResponse of workerResponses) {
					writer.merge(workerResponse.streamResult.toUIMessageStream());
					break;
				}
			},
			onError: (error: unknown) => {
				//@ts-expect-error from ai-sdk docs
				return `Custom error: ${error.message}`
			},
			originalMessages: messages,
			onFinish: ({ messages }) => {
				console.log('Stream finished with messages:', messages);
			},
		})

	});
	return response;
}
