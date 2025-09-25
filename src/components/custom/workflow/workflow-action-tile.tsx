import { ActionNodeType, useWorkflowStore } from "@/store/workflowStore";
import { ParagonAction } from "../../feature/action-tester";
import { Button } from "../../ui/button";
import { CirclePlus } from "lucide-react";
import { type Node } from "@xyflow/react";
import { v4 } from "uuid";


export const WorkflowActionTile = ({
	action,
	icon,
}: {
	action: ParagonAction,
	icon: string,
}) => {
	const { nodes, setNodes } = useWorkflowStore((state) => state);

	const addNode = () => {
		const node: ActionNodeType = {
			id: v4(),
			type: "actionNode",
			position: { x: 120, y: (120 * (1 + nodes.length)) },
			data: {
				icon: icon,
				action: action
			},
		}
		setNodes([...nodes, node]);
	};

	return (
		<div className="p-1 flex justify-between items-center">
			<div className="flex items-center overflow-hidden">
				<img alt="integration icon" src={icon} className="w-4 h-4 mr-1" />
				{action.title}
			</div>
			<Button variant={"outline"} size={"sm"}
				className="h-fit py-1"
				onClick={addNode}>
				<CirclePlus size={15} />Node
			</Button>
		</div>
	);
}
