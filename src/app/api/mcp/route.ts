import { userWithToken } from '@/lib/auth';
import { experimental_createMCPClient, UIMessage, convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, stepCountIs, streamText } from 'ai';
import { NextResponse } from 'next/server';
import { planWork } from './planner-worker';

export const maxDuration = 180;

export async function POST(req: Request) {
	const { messages }: { messages: UIMessage[] } = await req.json();
	console.log("UI MESSAGES: ", messages);
	const { user } = await userWithToken();
	if (!user) {
		return NextResponse.json({
			status: 401, message: "Unauthenticated user"
		});
	}

	const modelMessages = convertToModelMessages(messages);
	const lastUserMessage = messages.filter(m => m.role === 'user').pop();
	const metadata = lastUserMessage?.metadata as any;

	const { workerResponses } = await planWork(metadata.integrations, modelMessages, user.id);

	const response = createUIMessageStreamResponse({
		status: 200,
		statusText: "OK",
		stream: createUIMessageStream({
			execute({ writer }) {
				return (async () => {
					try {
						for (const workerResponse of workerResponses) {
							for await (const chunk of workerResponse.streamResult) {
								writer.write(chunk);
							}
						}
					} catch (error) {
						console.error('Error processing worker streams:', error);
						writer.write({
							type: 'text-delta',
							delta: `Error processing streams: ${error instanceof Error ? error.message : 'Unknown error'}`,
							id: 'error-message'
						});
					}
				})();
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

