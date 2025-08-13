"use client";

import { IntegrationTile } from "./integration-tile";
import useParagon from "@/lib/hooks";


export default function IntegrationsSidebar({ session }: { session: { paragonUserToken?: string } }) {
	const { user, paragonConnect, } = useParagon(session.paragonUserToken ?? "");
	const integrations = paragonConnect?.getIntegrationMetadata() ?? [];

	return (
		<div className="w-72">
			<div className="flex items-center justify-between w-full">
				<h1 className="font-semibold text-sm mt-2 mb-2">Sources</h1>
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
