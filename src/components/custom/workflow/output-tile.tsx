import { useWorkflowStore, WorkflowNode } from "@/store/workflowStore";
import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

export const OutputTile = ({
	node,
}: {
	node: WorkflowNode
}) => {
	const [expanded, setExpanded] = useState(false);
	const { setSelectedNode } = useWorkflowStore((state) => state);

	return (
		<div className="cursor-pointer border-b py-4 flex flex-col gap-2" key={node.id}
			onClick={() => node.data.output ? setExpanded((prev) => (!prev)) : setSelectedNode(node.id)}>
			<div className="flex items-center justify-between">
				<div className="flex justify-start items-center">
					<img alt="integration icon"
						src={node.data.icon}
						className="w-5 h-5 mr-1" />
					<div>
						{node.data.action ? (
							node.data.action.title) : (
							node.data.trigger?.title
						)}
					</div>
				</div>
				<div className={`rounded mr-2 p-1 px-2 inline-flex items-center 
						${node.data.output ? "bg-blue-400/30 dark:bg-blue-400/30"
						: "bg-slate-200/30 dark:bg-slate-400/30"}`} >
					<div className={`w-20 flex items-center justify-between text-center text-xs font-semibold 
							${node.data.output ? "text-blue-500 dark:text-blue-500" :
							"text-slate-500 dark:text-slate-500"}`}>
						{node.data.output ? "Output" : "Not run yet"}
						{node.data.output ? (
							<div className={expanded ? "text-muted-foreground justify-center items-center rotate-180"
								: "text-muted-foreground justify-center items-center"}>
								<ChevronDownIcon size={15} className="text-blue-700" />
							</div>
						) : null}
					</div>
				</div>
			</div>
			{expanded &&
				<pre className="max-h-96 overflow-y-auto text-xs p-2 bg-neutral-100 rounded-md overflow-x-auto">
					{node.data.output}
				</pre>
			}
		</div>

	);
}
