import { UIMessage } from "ai";
import { useState } from "react";
import Markdown from 'react-markdown';

export const ChatMessage = ({ message, part }:
	{ message: UIMessage, part: any }) => {
	const [expand, setExpand] = useState(false);
	const toggleExpand = () => {
		setExpand((prev) => !prev);
	}
	if (part.type === "text") {
		return (
			<div className={`w-fit p-2 m-1 rounded-md min-w-16 
					max-w-3/4 text-left
					${message.role === 'user' ?
					"place-self-end bg-foreground-muted/20" :
					""}`}>
				<Markdown>
					{part.text}
				</Markdown>
			</div>
		);
	} else if (part.type.substring(0, 4) === 'tool') {
		return (
			<div className={`p-2 m-1 rounded-md min-w-16 max-w-3/4 
				flex flex-col cursor-pointer 
				${expand ? "max-h-96" : "max-h-28"}`}
				onClick={toggleExpand}>
				<div className="font-semibold">calling tool...</div>
				<pre className={`p-2 rounded-sm text-sm bg-background-muted/20 
						font-mono ${expand ? "overflow-auto" :
						"overflow-hidden"}`}>
					{JSON.stringify(part, null, 2)}
				</pre>
			</div>
		);
	}
}
