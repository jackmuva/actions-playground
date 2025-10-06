import { WorkflowNode } from "@/store/workflowStore";
import { OutputTile } from "./output-tile";
import { Button } from "@/components/ui/button";
import { CircleChevronLeft } from "lucide-react";

export const TestSidebar = ({
	title,
	nodes,
	back,
}: {
	title: string,
	nodes: WorkflowNode[],
	back: () => void,
}) => {
	return (
		<div className="w-96 max-h-full overflow-y-auto flex flex-col relative">
			<div className="flex justify-between items-center">
				<Button variant={"outline"} size={"sm"}
					className="w-fit"
					onClick={() => back()}>
					<CircleChevronLeft size={12} />
					Back
				</Button>
				<h1 className="font-semibold ">
					{title}
				</h1>
			</div>
			{
				nodes.map((node) => {
					if (!node.data.icon) return;
					return (
						<OutputTile node={node} key={node.id} />
					);
				})
			}
		</div >
	);
}
