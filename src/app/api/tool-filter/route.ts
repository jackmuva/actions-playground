import { userWithToken } from '@/lib/auth';
import { UIMessage, convertToModelMessages } from 'ai';
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

	const plan = await planWork(metadata.integrations, modelMessages);
	return executeWork(metadata.tools, plan, modelMessages, paragonUserToken);
}

