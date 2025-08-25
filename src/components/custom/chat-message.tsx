import { UIMessage } from "ai";

export const ChatMessage = ({ message, part }:
	{ message: UIMessage, part: any }) => {

	if (part.type === "text") {
		return (
			<div className={`w-fit p-2 m-1 rounded-md min-w-16 
					max-w-3/4
					${message.role === 'user' ?
					"text-center place-self-end bg-foreground-muted/20" :
					"text-left"}`}>
				<div>
					{part.text}
				</div>
			</div>
		);
	} else if (part.type.substring(0, 4) === 'tool') {
		return (
			<div className="p-2 m-1 rounded-md min-w-16 max-w-3/4 max-h-1/2 
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
