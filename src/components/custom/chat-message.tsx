import { UIMessage } from "ai";

export const ChatMessage = ({ message, part }:
	{ message: UIMessage, part: any }) => {

	if (part.type === "text") {
		return (
			<div >
				{message.role === 'user' ? 'User: ' : 'Agent: '}
				{part.text}
			</div>
		);
	}
}
