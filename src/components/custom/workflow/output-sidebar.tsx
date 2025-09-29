"use client";
import { Button } from "@/components/ui/button";
import { useWorkflowStore } from "@/store/workflowStore";
import { Box, CircleChevronRight, ClipboardCopy, Waypoints } from "lucide-react";
import { OutputTile } from "./output-tile";

export const OutputSidebar = () => {
	const {
		outputSidebar,
		setOutputSidebar,
		nodes,
	} = useWorkflowStore((state) => state);

	return (
		<div className="w-fit max-h-full overflow-y-auto absolute top-24 right-0 z-40 px-2
			flex flex-col items-end">
			<div className="flex gap-2 mb-2 pt-2">
				<Button size={"sm"} variant={"outline"} className="">
					<Waypoints size={12} />
					Test Workflow
				</Button>
				<Button size={"sm"} variant={"outline"} className="">
					<Box size={12} />
					Deploy
				</Button>
				<Button variant={"outline"} size={"sm"}
					onClick={() => setOutputSidebar(!outputSidebar)} >
					{outputSidebar ? <CircleChevronRight size={20} /> : <ClipboardCopy size={20} />}
					{outputSidebar ? "Collapse" : "Output"}
				</Button>
			</div>
			{outputSidebar && <div className="w-96 max-h-full overflow-y-auto flex flex-col relative">
				<div className="w-full flex justify-between items-center">
					<h1 className="font-semibold ">
						Workflow Outputs
					</h1>
				</div>
				{nodes.map((node) => {
					if (!node.data.icon) return;
					return (
						<OutputTile node={node} key={node.id} />
					);
				})}
			</div>}
		</div>
	);
}
