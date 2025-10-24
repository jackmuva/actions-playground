import { useWorkflowStore, WorkflowNode } from "@/store/workflowStore";
import { OutputTile } from "./output-tile";
import { Button } from "@/components/ui/button";
import { CircleChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

export const TestSidebar = ({
	title,
	nodes,
	back,
}: {
	title: string,
	nodes: WorkflowNode[],
	back: () => void,
}) => {
	const { testOutput, retrigger } = useWorkflowStore((state) => state);
	const [load, setLoad] = useState(false);

	useEffect(() => {
		if (!testOutput) return;
		setLoad(true);
		setTimeout(() => {
			setLoad(false);
		}, 1000)
	}, [retrigger, testOutput])

	return (
		<div className="w-96 max-h-full overflow-y-auto flex flex-col relative">
			{load ? (
				<div className="mt-4 animate-pulse">
					Running...
				</div>
			) : (<>
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
				</div >
				{
					nodes.map((node) => {
						if (!node.data.icon) return;
						return (
							<OutputTile node={node} key={node.id} />
						);
					})
				}
			</>)}
		</div>
	);
}
