"use client";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { useWorkflowStore } from "@/store/workflowStore";
import OptionsSidebar from "./options-sidebar";
import ActionInputSidebar from "./action-input-sidebar";
import TriggerInputSidebar from "./trigger-input-sidebar";

export default function WorkflowSidebar({ session }: { session: { paragonUserToken?: string } }) {
	const selectedNode = useWorkflowStore((state) => state.selectedNode);

	return (
		<div className="max-w-[500px] max-h-full overflow-y-auto">
			<div className="flex flex-col space-y-0 items-start w-full mb-4">
				<div className="flex space-x-1 items-center">
					<h1 className="font-semibold ">
						Integration Nodes
					</h1>
					<Tooltip>
						<TooltipTrigger>
							<Info size={12} />
						</TooltipTrigger>
						<TooltipContent>
							<p className="text-sm text-wrap">
								ActionKit provides nodes and descriptions for popular actions per integration
							</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
			{!selectedNode ? <OptionsSidebar session={session} /> :
				selectedNode.id === 'trigger' ? <TriggerInputSidebar /> :
					<ActionInputSidebar />}
			<p className="mt-4 text-sm text-neutral-500 text-wrap text-center">
				Visit&nbsp;
				<a href="https://docs.useparagon.com/actionkit/overview"
					target="_blank"
					className="text-indigo-700 hover:text-indigo-500 font-semibold">
					our docs
				</a>
				&nbsp;for our full list of supported Actions for Workflow Builders
			</p>
		</div>
	);
}
