"use client";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip";
import useSWR from "swr";
import { ActionsSidebarTile } from "./actions-sidebar-tile";
import { SidebarLoading } from "../sidebar-loading";
import useParagon from "@/lib/hooks";
import { IIntegrationMetadata } from "@useparagon/connect";

export default function ActionsSidebar({ session }: { session: { paragonUserToken?: string } }) {
	const { paragonConnect } = useParagon(session.paragonUserToken ?? "");

	const { data: integrations } = useSWR<IIntegrationMetadata[]>(`integrations`, async () => {
		const response = await fetch(
			`https://api.useparagon.com/projects/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}/sdk/metadata`,
			{
				headers: {
					Authorization: `Bearer ${session.paragonUserToken}`,
					"Content-type": "application/json",
				},
			},
		);
		const data = await response.json();
		return data;
	});

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
	console.log(integrations);
	console.log(user);

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
							<p className="text-sm text-wrap text-center">
								Paragon fully manages integration auth for your end-users.
								<br />
								(We do not store or use data from connected sources. <br />
								This playground is purely used for demonstration purposes)
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
					<SidebarLoading />
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


