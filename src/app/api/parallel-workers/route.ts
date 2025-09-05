import { userWithToken } from '@/lib/auth';
import { UIMessage, convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse } from 'ai';
import { NextResponse } from 'next/server';
import { planWork, executeWork } from './api-planner-worker';

export const maxDuration = 180;

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


	const response = createUIMessageStreamResponse({
		status: 200,
		statusText: "OK",
		stream: createUIMessageStream({
			execute({ writer }) {
				return (async () => {
					const integrationPlan = await planWork(metadata.integrations, modelMessages);
					console.log("THE PLAN: ", integrationPlan);
					const { workerResponses } = await executeWork(metadata.tools, integrationPlan, modelMessages, paragonUserToken);
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

