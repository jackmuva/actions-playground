'use client';
import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef } from 'react';
import { ChatIntro } from './chat-intro';
import { ChatMessage } from './chat-message';
import useParagon from '@/lib/hooks';

export default function Chat({ session }: { session: { paragonUserToken?: string } }) {
	const { user } = useParagon(session.paragonUserToken ?? "");
	const [input, setInput] = useState('');
	const { messages, sendMessage } = useChat();
	const messageWindowRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (messageWindowRef.current) {
			messageWindowRef.current.scrollTop = messageWindowRef.current.scrollHeight;
		}
	}, [messages]);

	return (
		<div className='w-full flex justify-center min-h-full max-h-full'>
			<div className="relative flex flex-col w-full max-w-[800px] h-full 
				 min-h-full">
				<div ref={messageWindowRef}
					id='message-window'
					className='h-full mb-16 overflow-y-scroll no-scrollbar'>
					{messages.length === 0 ? (
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
						},
					});
					setInput('');
				}} >
					<input className="absolute bottom-0 w-full p-4 border rounded-md
					 bg-background-muted outline-none"
						value={input}
						placeholder="Try prompting for an action..."
						onChange={e => setInput(e.currentTarget.value)} />
				</form>
			</div >
		</div >
	);
}
