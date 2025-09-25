import { ChevronDownIcon, Info } from "lucide-react";
import { useState } from "react";
import { Button } from "../../ui/button";
import { ParagonAction } from "../../feature/action-tester";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import { WorkflowActionTile } from "./workflow-action-tile";

type TileProps = {
	integration: {
		icon: string;
		name: string;
		type: string;
	};
	integrationEnabled?: boolean;
	onConnect: () => void;
	actions: Array<ParagonAction>
};

export function WorkflowSidebarTile({
	integration,
	integrationEnabled,
	onConnect,
	actions,
}: TileProps) {
	const [expanded, setExpanded] = useState(false);

	const handleClick = () => {
		if (integrationEnabled) {
			setExpanded((prev) => !prev);
		} else {
			onConnect();
		}
	};

	return (
		<div className="w-full mb-2 mr-2 rounded-lg" key={integration.type}>
			<div className="border border-slate-300 dark:border-slate-700 rounded">
				<div className="p-4 flex items-center rounded rounded-br-none rounded-bl-none justify-between 
          hover:bg-gray-100 dark:hover:bg-secondary cursor-pointer"
					onClick={handleClick}>
					<div className="flex items-center">
						<img alt="integration icon" src={integration.icon} className="w-4 h-4 mr-2" />
						<p className="text-sm font-semibold">{integration.name}</p>
					</div>
					<div className="flex items-center">

						<div
							className={`rounded mr-2 p-1 px-2 inline-flex items-center ${integrationEnabled
								? "bg-green-400/30 dark:bg-green-400/30"
								: "bg-slate-200/30 dark:bg-slate-400/30"
								}`}
						>
							<div
								className={`rounded-full h-2 w-2 ${integrationEnabled ? "bg-green-500" : "bg-slate-300"
									} mr-1`}
							/>
							<div className={`w-20 flex items-center justify-between text-center text-xs font-semibold ${integrationEnabled ? "text-green-500 dark:text-green-500"
								: "text-slate-500 dark:text-slate-500"
								}`}
							>
								{integrationEnabled ? "Connected" : "Unconnected"}
								{integrationEnabled ? (
									<div className={expanded ? "text-muted-foreground justify-center items-center rotate-180" : "text-muted-foreground justify-center items-center"} onClick={handleClick}>
										<ChevronDownIcon size={15} className="text-green-700" />
									</div>
								) : null}

							</div>
						</div>
					</div>
				</div>
				{expanded ? (
					<div className="border-slate-300 dark:border-slate-700 p-4 pt-0">
						<div className="flex space-x-1 items-center">
							<h2 className="font-semibold text-sm mb-2">
								Available Workflow Actions
							</h2>
							<Tooltip>
								<TooltipTrigger>
									<Info size={12} />
								</TooltipTrigger>
								<TooltipContent>
									<p className="text-sm text-wrap text-center">
										ActionKit provides integration actions with inputs
										<br />
										and descriptions out-of-the-box
									</p>
								</TooltipContent>
							</Tooltip>

						</div>
						<div className={`flex flex-col space-y-1 text-sm font-semibold italic`}>
							{actions?.map((action) => {
								return <WorkflowActionTile key={action.name}
									icon={integration.icon}
									action={action} />
							})
							}
						</div>
						<div className="pt-2 flex flex-col space-y-2 items-start">
							<Button variant={"outline"} onClick={() => onConnect()}
							>
								Configure
							</Button>
						</div>
					</div>
				) : null}
			</div>
		</div >
	);
}


