import { userWithToken } from '@/lib/auth';
import { experimental_createMCPClient, UIMessage, convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, stepCountIs, streamText } from 'ai';
import { NextResponse } from 'next/server';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';
import { openai } from '@ai-sdk/openai';

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
	const sseTransport = new SSEClientTransport(
		new URL(process.env.MCP_SERVER!),
	);
	const clientThree = await experimental_createMCPClient({
		transport: sseTransport,
	});

	try {
		const tools = await clientThree.tools();

		const response = streamText({
			model: openai('gpt-5-nano'),
			tools,
			stopWhen: stepCountIs(5),
			messages: modelMessages,
		});

		return response.toUIMessageStreamResponse();
	} catch (error) {
		console.error(error);
	} finally {
		await Promise.all([
			clientThree.close(),
		]);
	}
}
