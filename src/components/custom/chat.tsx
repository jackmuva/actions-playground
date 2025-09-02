'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useEffect, useRef } from 'react';
import { ChatIntro } from './chat-intro';
import { ChatMessage } from './chat-message';
import useParagon from '@/lib/hooks';
import useSWR from 'swr';

export default function Chat({ session }: { session: { paragonUserToken?: string } }) {
	const { user } = useParagon(session.paragonUserToken ?? "");
	const [input, setInput] = useState('');
	const { messages, sendMessage, status } = useChat({
		transport: new DefaultChatTransport({
			api: '/api/mcp',
		}),
	});
	const messageWindowRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (messageWindowRef.current) {
			messageWindowRef.current.scrollTop = messageWindowRef.current.scrollHeight;
		}
	}, [messages]);

	const { data: tools, isLoading: toolsAreLoading } = useSWR(`tools`, async () => {
		const response = await fetch(
			`https://actionkit.useparagon.com/projects/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}/actions`,
			{
				headers: {
					Authorization: `Bearer ${session.paragonUserToken}`,
				},
			},
		);
		const data = await response.json();
		return data.actions;
	});

	return (
		<div className='w-full flex justify-center min-h-full max-h-full'>
			<div className="relative flex flex-col w-full max-w-[800px] h-full 
				 min-h-full">
				<div ref={messageWindowRef}
					id='message-window'
					className='h-full mb-16 overflow-y-scroll no-scrollbar'>
					{toolsAreLoading ? (
						<div className='h-full w-full flex flex-col items-center justify-center space-y-2'>
							<h2 className='font-mono text-xl text-center'>
								Preparing Agent...
							</h2>
						</div>
					) : (
						messages.length === 0 ? (
							<ChatIntro />
						) : (
							messages.map(message => (
								<div key={message.id} className="whitespace-pre-wrap">
									{message.parts.map((part, i) => {
										return <ChatMessage key={`${message.id}-${i}`}
											message={message}
											part={part} />
									})}
								</div>
							))
						))}
					{status === 'submitted' ? (
						<div className='animate-pulse'>
							hang on a sec, agent is thinking...
						</div>
					) : (
						status === 'streaming' ? (
							<div className='animate-pulse'>
								agent is cooking...
							</div>
						) : (
							status === 'error' ? (
								<div className='text-red-600 font-semibold'>
									something went wrong; try a different request
								</div>
							) : <></>
						)
					)}
				</div>
				<form onSubmit={e => {
					e.preventDefault();
					sendMessage({
						text: input,
						metadata: {
							integrations: user?.authenticated ?
								Object.keys(user?.integrations).filter((type) =>
									user.integrations[type]?.enabled
								)
								: [],
							tools: tools
						},
					});
					setInput('');
				}} >
					<input className="absolute bottom-0 w-full p-4 border rounded-md
					 bg-background-muted outline-none"
						disabled={toolsAreLoading}
						value={input}
						placeholder="Try prompting for an action..."
						onChange={e => setInput(e.currentTarget.value)} />
				</form>
			</div>
		</div>
	);
}
