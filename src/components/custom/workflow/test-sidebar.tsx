import { WorkflowNode } from "@/store/workflowStore";
import { OutputTile } from "./output-tile";

export const TestSidebar = ({
	title,
	nodes,
}: {
	title: string,
	nodes: WorkflowNode[],
}) => {
	return (
		<div className="w-96 max-h-full overflow-y-auto flex flex-col relative">
			<div className="w-full flex justify-between items-center">
				<h1 className="font-semibold ">
					{title}
				</h1>
			</div>
			{nodes.map((node) => {
				if (!node.data.icon) return;
				return (
					<OutputTile node={node} key={node.id} />
				);
			})}
		</div>
	);
}
