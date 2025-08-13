import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

type IntegrationTileProps = {
	integration: {
		icon: string;
		name: string;
		type: string;
	};
	integrationEnabled?: boolean;
	onConnect: () => void;
};

export function IntegrationTile({
	integration,
	integrationEnabled,
	onConnect,
}: IntegrationTileProps) {
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
						<img src={integration.icon} className="w-4 h-4 mr-2" />
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
					<div className="border-slate-300 dark:border-slate-700 p-4 pt-2">
						<div className="flex flex-col space-y-2 items-start">
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


