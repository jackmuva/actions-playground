import { Box, CirclePlus, TestTubeDiagonal } from "lucide-react";
import { Handle, NodeProps, Position } from "@xyflow/react";
import { TriggerNodeType, useWorkflowStore } from "@/store/workflowStore";

export function TriggerNode({ id, data }: NodeProps<TriggerNodeType>) {
	const { setSelectedNode } = useWorkflowStore((state) => state);

	return (
		<div className={`${!data.trigger ? "w-[500px] h-fit" : "w-52 h-16"} 
			border flex p-1 justify-center items-center 
			rounded-sm bg-background-muted/10 hover:bg-background-muted/30
			cursor-pointer space-x-1 shadow-lg relative`}
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
				<div className="flex flex-col w-full items-center py-2 gap-4">
					<div>
						<h2 className="font-semibold text-xl text-center">
							ActionKit-Powered Workflow Builder
						</h2>
						<h3 className='text-sm text-center'>
							An example of ActionKit in action to give your workflow builder <br />access to 1000+ pre-built workflow steps
						</h3>
					</div>
					<div className="w-full flex flex-col gap-1 items-center">
						<p className="flex items-center gap-1">
							<TestTubeDiagonal size={15} />
							Add and test integration steps on the <strong>left</strong> <br />

						</p>
						<p className="flex items-center gap-1">
							<Box size={15} />
							Deploy your workflow to see live triggers on the <strong>right</strong>
						</p>
					</div>
					<div className="flex gap-1 text-center items-center 
							text-indigo-700 font-semibold">
						<CirclePlus size={15} />
						Add a trigger and get started
					</div>
				</div>
			)}
			<Handle type="source" position={Position.Bottom} />
		</div>
	);
}
