"use client";

import { IntegrationTile } from "./integration-tile";
import useParagon from "@/lib/hooks";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";


export default function IntegrationsSidebar({ session }: { session: { paragonUserToken?: string } }) {
	const { user, paragonConnect, } = useParagon(session.paragonUserToken ?? "");
	const integrations = paragonConnect?.getIntegrationMetadata() ?? [];

	return (
		<div className="w-96 mr-2 max-h-full overflow-y-scroll">
			<div className="flex flex-col space-y-0 items-start w-full mb-4">
				<div className="flex space-x-1 items-center">
					<h1 className="font-semibold ">
						Sources
					</h1>
					<Tooltip>
						<TooltipTrigger>
							<Info size={12} />
						</TooltipTrigger>
						<TooltipContent>
							<p className="text-sm text-wrap">
								Paragon fully manages integration auth for your end-users.
							</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
			<div className="flex flex-wrap">
				{user?.authenticated ? (
					integrations
						.sort((a, b) => {
							if (
								user.integrations?.[a.type]?.enabled &&
								!user?.integrations?.[b.type]?.enabled
							) {
								return -1;
							}
							if (
								user.integrations?.[b.type]?.enabled &&
								!user?.integrations?.[a.type]?.enabled
							) {
								return 1;
							}
							return a.type < b.type ? -1 : 1;
						})
						.map((integration) => (
							<IntegrationTile
								integration={integration}
								onConnect={() => paragonConnect!.connect(integration.type, {})}
								integrationEnabled={
									user?.authenticated &&
									user?.integrations?.[integration.type]?.enabled
								}
								key={integration.type}
							/>
						))
				) : (
					<LoadingSkeleton />
				)}
			</div>
			<p className="text-sm text-neutral-500 text-wrap text-center">
				Visit our docs for our full list of supported ActionKit integrations
			</p>
		</div>
	);
}

export const LoadingSkeleton = () => {
	return Array(5)
		.fill(null)
		.map((_, i) => (
			<div
				className={`w-full mb-2 mr-2 rounded-lg cursor-pointer animate-pulse`}
				key={i}
			>
				<div className="border border-slate-300 dark:border-slate-700 rounded p-4">
					<div className="flex items-center mb-1">
						<div className="inline w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-500 mr-2" />
						<div className="inline rounded-full w-48 h-2 bg-slate-200 dark:bg-slate-500" />
					</div>
				</div>
			</div>
		));
};
