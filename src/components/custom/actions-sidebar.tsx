"use client";
import useParagon from "@/lib/hooks";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import useSWR from "swr";
import { ActionsSidebarTile } from "./actions-sidebar-tile";

export default function ActionsSidebar({ session }: { session: { paragonUserToken?: string } }) {
	const { paragonConnect } = useParagon(session.paragonUserToken ?? "");
	const integrations = paragonConnect?.getIntegrationMetadata();

	const { data: user, isLoading: userIsLoading } = useSWR(`user`, async () => {
		const response = await fetch(
			`https://api.useparagon.com/projects/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}/sdk/me`,
			{
				headers: {
					Authorization: `Bearer ${session.paragonUserToken}`,
				},
			},
		);
		const data = await response.json();
		return data;
	});

	const { data: actions, isLoading: actionsIsLoading } = useSWR(`agent/actions`, async () => {
		const response = await fetch(
			`https://actionkit.useparagon.com/projects/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}/actions?format=paragon`,
			{
				headers: {
					Authorization: `Bearer ${session.paragonUserToken}`,
				},
			},
		);
		const data = await response.json();
		return data.actions;
	});

	return (
		<div className="w-96 max-h-full overflow-y-auto">
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
				{user?.authenticated && !userIsLoading && !actionsIsLoading && integrations ? (
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
							<ActionsSidebarTile
								integration={integration}
								onConnect={() => paragonConnect!.connect(integration.type, {})}
								integrationEnabled={
									user?.authenticated &&
									user?.integrations?.[integration.type]?.enabled
								}
								actions={actions[integration.type]}
								key={integration.type}
							/>
						))
				) : (
					<LoadingSkeleton />
				)}
			</div>
			<p className="text-sm text-neutral-500 text-wrap text-center">
				Visit&nbsp;
				<a href="https://docs.useparagon.com/actionkit/overview"
					target="_blank"
					className="text-indigo-700 hover:text-indigo-500 font-semibold">
					our docs
				</a>
				&nbsp;for our full list of supported ActionKit integrations
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
