import { ActionNodeType, useWorkflowStore } from "@/store/workflowStore";
import { ParagonAction } from "../../feature/action-tester";
import { Button } from "../../ui/button";
import { CirclePlus } from "lucide-react";
import { v4 } from "uuid";
import { Edge } from "@xyflow/react";


export const WorkflowActionTile = ({
	action,
	icon,
	integration,
}: {
	action: ParagonAction,
	icon: string,
	integration: string,
}) => {
	const { nodes, edges, setNodes, setEdges } = useWorkflowStore((state) => state);

	const addNode = () => {
		const nodeId: string = v4();
		const node: ActionNodeType = {
			id: nodeId,
			type: "actionNode",
			position: { x: 120, y: (120 * (1 + nodes.length)) },
			data: {
				icon: icon,
				action: action,
				integration: integration,
				inputValues: {},
			},
		}
		setNodes([...nodes, node]);
		const lastNodeId: string | undefined = nodes.pop()?.id;
		if (lastNodeId === undefined) return;

		const edge: Edge = {
			source: lastNodeId,
			target: node.id,
			id: `xy-edge__${lastNodeId}-${node.id}`,
		}
		setEdges([...edges, edge]);
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
