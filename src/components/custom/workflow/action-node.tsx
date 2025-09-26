import { Position, Handle, NodeProps } from "@xyflow/react";
import { Plug } from "lucide-react";
import { ActionNodeType, useWorkflowStore } from "@/store/workflowStore";

export function ActionNode({ id, data }: NodeProps<ActionNodeType>) {
	const setSelectedNode = useWorkflowStore((state) => state.setSelectedNode);
	return (
		<div className="border w-52 h-16 flex p-1 justify-center items-center 
			rounded-sm bg-background-muted/10 hover:bg-background-muted/30
			cursor-pointer space-x-1 shadow-lg relative"
			onClick={() => setSelectedNode(id)}>
			<Handle type="target" position={Position.Top} />
			<Plug className="absolute -top-3" size={20} />
			<div className="flex items-center overflow-hidden">
				<img alt="integration icon" src={data.icon} className="w-4 h-4 mr-1" />
				{data.action.title}
			</div>
			<Plug className="absolute -bottom-3 rotate-180" size={20} />
			<Handle type="source" position={Position.Bottom} />
		</div>
	);
}
