import { Position, Handle, NodeProps } from "@xyflow/react";
import { ActionNodeType, useWorkflowStore } from "@/store/workflowStore";

export function ActionNode({ id, data }: NodeProps<ActionNodeType>) {
	const setSelectedNode = useWorkflowStore((state) => state.setSelectedNode);
	return (
		<div className="border w-52 h-16 flex p-1 justify-center items-center 
			rounded-sm bg-background-muted/10 hover:bg-background-muted/30
			cursor-pointer space-x-1 shadow-lg relative"
			onClick={() => setSelectedNode(id)}>
			<Handle type="target" position={Position.Top} />
			<div className="flex items-center overflow-hidden">
				<img alt="integration icon" src={data.icon} className="w-4 h-4 mr-1" />
				{data.action.title}
			</div>
			<Handle type="source" position={Position.Bottom} />
		</div>
	);
}
