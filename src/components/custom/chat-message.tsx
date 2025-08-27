import { UIMessage } from "ai";
import { marked } from 'marked';
import { useEffect } from "react";

export const ChatMessage = ({ message, part }:
	{ message: UIMessage, part: any }) => {
	useEffect(() => {
		const mdMessage = document.getElementById(`md-message-${message.id}`);
		mdMessage.innerHTML = marked.parse(part.text).then(() => {

		});;
	}, [message, part]);

	if (part.type === "text") {
		return (
			<div className={`w-fit p-2 m-1 rounded-md min-w-16 
					max-w-3/4 text-left
					${message.role === 'user' ?
					"place-self-end bg-foreground-muted/20" :
					""}`}>
				<div id={`md-message-${message.id}`}>
					{part.text}
				</div>
			</div>
		);
	} else if (part.type.substring(0, 4) === 'tool') {
		return (
			<div className="p-2 m-1 rounded-md min-w-16 max-w-3/4 max-h-96 
				overflow-auto flex flex-col">
				<div className="font-semibold">calling tool...</div>
				<pre className={`p-2 rounded-sm text-sm bg-background-muted/20 
						font-mono overflow-auto`}>
					{JSON.stringify(part, null, 2)}
				</pre>
			</div>
		);
	}
}
