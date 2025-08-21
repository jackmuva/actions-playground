import { UIMessage } from "ai";

export const ChatMessage = ({ message, part }:
	{ message: UIMessage, part: any }) => {

	if (part.type === "text") {
		return (
			<div className={`w-fit border p-2 m-1 rounded-md min-w-16 text-center 
					${message.role === 'user' ? "place-self-end bg-background-muted/30" :
					""}`}>
				<div className="font-semibold place-self-start">
					{message.role === 'user' ? '' : 'Agent: '}
				</div>
				<div>
					{part.text}
				</div>
			</div>
		);
	}
}
