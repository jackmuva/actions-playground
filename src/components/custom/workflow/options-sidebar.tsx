import useSWR from "swr";
import { SidebarLoading } from "../sidebar-loading";
import { WorkflowSidebarTile } from "./workflow-sidebar-tile";
import useParagon from "@/lib/hooks";
import { IIntegrationMetadata } from "@useparagon/connect";

export default function OptionsSidebar({
	session,
}: {
	session: { paragonUserToken?: string }
}) {
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

	return (
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
						<WorkflowSidebarTile
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
	)
}
