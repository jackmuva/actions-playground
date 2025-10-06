import { Zap } from "lucide-react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { TriggerNodeType, useWorkflowStore } from "@/store/workflowStore";

export function TriggerNode({ id, data }: NodeProps<TriggerNodeType>) {
	const { setSelectedNode } = useWorkflowStore((state) => state);

	return (
		<div className="border w-52 h-16 flex p-1 justify-center items-center 
			rounded-sm bg-background-muted/10 hover:bg-background-muted/30
			cursor-pointer space-x-1 shadow-lg relative"
			onClick={() => setSelectedNode(id)}>
			{data.trigger ? (
				<>
					<img alt="integration icon"
						src={data.icon}
						className="w-5 h-5 mr-1" />
					<p className="font-bold italic text-indigo-700">
						{data.trigger.title}
					</p>

				</>
			) : (
				<>
					<Zap color="#4338ca" size={20} />
					<p className="font-bold italic text-indigo-700">
						Add Trigger
					</p>
				</>
			)}
			<Handle type="source" position={Position.Bottom} />
		</div>
	);
}
