import { ParagonAction } from "../feature/action-tester";
import { Button } from "../ui/button";
import { CirclePlus } from "lucide-react";


export const WorkflowActionTile = ({
	action,
	icon,
}: {
	action: ParagonAction,
	icon: string,
}) => {
	console.log(action);
	return (
		<div className="p-1 flex justify-between items-center">
			<div className="flex items-center overflow-hidden">
				<img alt="integration icon" src={icon} className="w-4 h-4 mr-1" />
				{action.title}
			</div>
			<Button variant={"outline"} size={"sm"} className="h-fit py-1">
				<CirclePlus size={15} />Node
			</Button>
		</div>
	);
}
