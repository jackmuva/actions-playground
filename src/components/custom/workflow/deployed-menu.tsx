import { Button } from "@/components/ui/button";
import { useWorkflowStore } from "@/store/workflowStore";
import { Box, Logs, UndoDot } from "lucide-react";
import { useState } from "react";

enum DeployState {
	PENDING = "Pending",
	FAILED = "Failed",
	SUCCESS = "Deployed",
	NORMAL = "Re-deploy",
};

export const DeployedMenu = () => {
	const { nodes, edges, setDeployed, setRunSidebar } = useWorkflowStore((state) => state);

	const [menu, setMenu] = useState<boolean>(false);
	const [deployState, setDeployState] = useState<DeployState>(DeployState.NORMAL);

	const toggleMenu = () => {
		setMenu((prev) => !prev);
	};

	const deployWf = async () => {
		setDeployState(DeployState.PENDING);
		const res = await fetch(
			`${window.document.location.origin}/api/workflow/deploy`,
			{
				method: "POST",
				body: JSON.stringify({
					nodes: nodes,
					edges: edges
				}),
			}
		);
		if (!res.ok) {
			setDeployed(false);
			setDeployState(DeployState.FAILED);
			throw Error(await res.json());
		} else {
			setDeployState(DeployState.SUCCESS);
		}
		setTimeout(() => {
			setDeployState(DeployState.NORMAL);
		}, 5000);
	}


	return (
		<div className="relative">
			<Button size={"sm"} variant={"outline"}
				className="text-green-500 bg-green-400/30 font-semibold"
				onClick={() => toggleMenu()}>
				<Box size={12} />
				Deploy Actions
			</Button>
			{menu && (
				<div className="absolute top-full right-0 mt-1 w-48 bg-white border 
					text-sm rounded-md shadow-lg py-2 px-1 z-20">
					<button className={`px-2 py-1 hover:bg-input/50 w-full
						rounded-sm cursor-pointer flex items-center 
						gap-1 justify-center 
						${deployState === DeployState.PENDING ? "animate-pulse" :
							deployState === DeployState.FAILED ? "bg-red-400/30" :
								deployState === DeployState.SUCCESS ? "bg-green-400/30" : ""}`}
						onClick={() => deployWf()}>
						<UndoDot size={12} />
						<div>{deployState}</div>
					</button>
					<button className="px-2 py-1 hover:bg-input/50 w-full 
						rounded-sm cursor-pointer flex items-center 
						gap-1 justify-center"
						onClick={() => {
							setRunSidebar(true);
							toggleMenu();
						}}>
						<Logs size={12} />
						<div>Workflow Runs</div>
					</button>
				</div>
			)}

		</div>
	);
}
