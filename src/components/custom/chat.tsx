'use client';
import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { ChatIntro } from './chat-intro';
import { ChatMessage } from './chat-message';

export default function Chat() {
	const [input, setInput] = useState('');
	const { messages, sendMessage } = useChat();

	return (
		<div className="relative flex flex-col w-full min-h-full">
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
			<form onSubmit={e => {
				e.preventDefault();
				sendMessage({ text: input });
				setInput('');
			}} >
				<input className="absolute bottom-0 w-full p-4 border rounded-md
					 bg-background-muted/50 outline-none"
					value={input}
					placeholder="Try prompting for an action..."
					onChange={e => setInput(e.currentTarget.value)} />
			</form>
		</div>
	);
}
