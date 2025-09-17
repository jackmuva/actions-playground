import { userWithToken } from '@/lib/auth';
import { UIMessage, convertToModelMessages, stepCountIs, streamText, tool, jsonSchema } from 'ai';
import { NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';

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

	if (Object.keys(metadata.tools).length === 0) {
		const result = streamText({
			model: openai('gpt-4o'),
			system: 'you are a friendly agent',
			messages: modelMessages
		});
		return result.toUIMessageStreamResponse();
	} else {
		const tools = Object.fromEntries(
			Object.keys(metadata.tools).flatMap((integration) => {
				return metadata.tools[integration]?.map((toolFunction:
					{ type: string, function: { name: string, description: string, parameters: any } }
				) => {
					return [toolFunction.function.name, tool({
						description: toolFunction.function.description,
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
				}) || []
			})
		)

		const result = streamText({
			model: openai('gpt-4o'),
			system: `You are an agent with 3rd-party tools 

				IMPORTANT: You MUST use the available tools to help with the user's request.
				Do not just describe what you would do - actually call the tools! Do NOT forget inputs.

				If there are no tools for the requested integration, 
				prompt user to connect integration within this application - ActionKit Playground.

				Be as concise as possible in your answers.`,
			messages: modelMessages,
			stopWhen: stepCountIs(5),
			tools: tools,
		});
		return result.toUIMessageStreamResponse();
	}
}


