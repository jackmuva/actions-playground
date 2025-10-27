"use client";
import { useEffect, useMemo, useState } from 'react';
import { ComboboxField } from '../form/combobox-field';
import { Button } from '../ui/button';
import { Check, Info, Loader2, Play, XCircle } from 'lucide-react';
import {
	paragon,
	SidebarInputType,
	type ConnectInputValue,
	type SerializedConnectInput,
} from '@useparagon/connect';
import { SerializedConnectInputPicker } from './serialized-connect-input-picker';
import inputsMapping from '@/lib/inputsMapping.json';
import useParagon from '@/lib/hooks';
import useSWR from 'swr'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

const IntegrationTitle = ({ integration }: { integration: string | null }) => {
	const integrations = paragon.getIntegrationMetadata();

	const integrationMetadata = integrations?.find((i) => i.type === integration);
	if (!integrationMetadata) {
		return null;
	}

	return (
		<div className="flex gap-2 items-center">
			<img
				className="h-4 w-4"
				src={integrationMetadata.icon}
				alt={integrationMetadata.name}
			/>
			<p>{integrationMetadata.name}</p>
		</div>
	);
};

export type ParagonAction = {
	name: string;
	title: string;
	description?: string;
	inputs?: SerializedConnectInput[];
};

export const formatInputs = (inputValues: Record<string, ConnectInputValue>): Record<string, string> => {
	let formattedInputs: Record<string, string> = {};
	for (const input of Object.keys(inputValues)) {
		if (typeof inputValues[input] === "object") {
			//@ts-expect-error extending ConnectInputValue
			formattedInputs[input] = inputValues[input].selected;
			//@ts-expect-error extending ConnectInputValue
			formattedInputs = { ...formattedInputs, ...inputValues[input].dependents };
		} else {
			//@ts-expect-error extending ConnectInputValue
			formattedInputs[input] = inputValues[input];
		}
	}
	return formattedInputs;
}

export default function ActionTester({ session }: { session: { paragonUserToken?: string } }) {
	const { paragonConnect } = useParagon(session.paragonUserToken ?? "");
	const [integration, setIntegration] = useState<string | null>(null);
	const user = paragonConnect?.getUser();
	const integrations = paragonConnect?.getIntegrationMetadata();
	const integrationMetadata = integrations?.find((i) => i.type === integration);
	const [integrationQuery, setIntegrationQuery] = useState('');
	const [action, setAction] = useState<string | null>(null);
	const [inputValues, setInputValues] = useState<Record<string, ConnectInputValue>>({});
	const [actionQuery, setActionQuery] = useState('');
	const [isDisconnecting, setIsDisconnecting] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(true);

	useEffect(() => {
		if (sessionStorage.getItem("firstVisit")) {
			setDialogOpen(false);
		} else {
			sessionStorage.setItem("firstVisit", "true");
		}
	}, [])

	const { data: actions, isLoading: actionsIsLoading } = useSWR(`actions/${integration}`, async () => {
		//@ts-expect-error is type Authenticated Connected User
		if (!integration || !user?.integrations[integration]?.enabled) {
			return [] as ParagonAction[];
		}
		const response = await fetch(
			`https://actionkit.useparagon.com/projects/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}/actions?integrations=${integration}&format=paragon`,
			{
				headers: {
					Authorization: `Bearer ${session.paragonUserToken}`,
				},
			},
		);
		const data = await response.json();
		return ((integration && data.actions[integration]) ?? []) as ParagonAction[];
	});

	const { data: actionData, error: actionError, mutate: actionMutate, isLoading: actionIsLoading } = useSWR(`run/action`, async () => {
		if (!selectedAction) {
			throw new Error('No action selected');
		}

		const response = await fetch(
			`https://actionkit.useparagon.com/projects/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}/actions`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${session.paragonUserToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					action: selectedAction.name,
					parameters: formatInputs(inputValues),
				}),
			},
		);
		if (!response.ok) {
			const error = await response.json();
			throw error;
		}
		const data = await response.json();
		return data;
	},
		{
			revalidateOnMount: false,
			revalidateOnFocus: false,
		});


	const selectedAction: ParagonAction | null = useMemo(() => {
		return actions?.find((a) => a.name === action) ?? null;
	}, [actions, action]);

	const filteredIntegrations = useMemo(() => {
		const query = integrationQuery.trim().toLowerCase();
		if (!integrations) return [];
		if (!query) return integrations;
		return integrations.filter(
			(i) =>
				(i.name ?? '').toLowerCase().includes(query) ||
				(i.type ?? '').toLowerCase().includes(query),
		);
	}, [integrations, integrationQuery]);

	const filteredActions = useMemo(() => {
		const list = actions ?? [];
		const query = actionQuery.trim().toLowerCase();
		if (!query) return list;
		return list.filter((a) => {
			const title = (a.title ?? '').toLowerCase();
			const name = (a.name ?? '').toLowerCase();
			return title.includes(query) || name.includes(query);
		});
	}, [actions, actionQuery]);

	useEffect(() => {
		if (!selectedAction) {
			setInputValues({});
			return;
		}
		const initial: Record<string, ConnectInputValue> = {};
		for (const input of selectedAction.inputs ?? []) {
			type ExtendedSerializedConnectInput = SerializedConnectInput & {
				value?: unknown;
			};
			const withValue = input as ExtendedSerializedConnectInput;
			if (withValue.value !== undefined) {
				initial[input.id] = withValue.value as ConnectInputValue;
			}
		}
		setInputValues(initial);
	}, [selectedAction]);

	return (
		<>
			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent className='max-w-[700px] max-h-11/12 h-fit  overflow-y-auto'>
					<DialogHeader>
						<DialogTitle className='text-lg'>
							Welcome to the ActionKit Playground
						</DialogTitle>
						<div className='flex flex-col space-y-2'>
							<p>
								This playground lets you explore a handful of Paragon&apos;s 1000+ pre-built actions available in ActionKit.
							</p>
							<h2 className='font-bold'>Each action contains:</h2>
							<div className='markdown'>
								<ol>
									<li>What the action does (i.e. Get Calendar Availability)</li>
									<li>Input fields to run the action</li>
									<li>Real-time execution when you click &apos;Run&apos;</li>
								</ol>
							</div>
							<h2 className='font-bold'>Under the hood:</h2>
							<p>
								Actionkit has 2 API endpoints. The <strong>GET /actions</strong> returns a standardized format with both
								human and LLM readable descriptions.
							</p>
							<pre className="text-xs p-2 bg-neutral-100 rounded-md overflow-x-auto">
								&#123;<br />
								&nbsp;&apos;name&apos;: &apos;GOOGLE_CALENDAR_GET_AVAILABILITY&apos;,<br />
								&nbsp;&apos;description&apos;: &apos;get availability&apos;,<br />
								&nbsp;&apos;parameters&apos;: &#123;<br />
								&nbsp;&apos;type&apos;: &apos;object&apos;,<br />
								&nbsp;&apos;properties&apos;: &#123;<br />
								&nbsp;&nbsp;&apos;timeMin&apos;: &#123;<br />
								&nbsp;&nbsp;&nbsp;&apos;type&apos;: &apos;string&apos;,<br />
								&nbsp;&nbsp;&nbsp;&apos;description&apos;: &apos;The start of the interval. In ISO format&apos;,<br />
								&nbsp;&nbsp;&nbsp;&apos;format&apos;: &apos;date&apos;<br />
								&nbsp;&nbsp;&#125;,<br />
								&nbsp;&nbsp;...<br />
								&nbsp;&#125;<br />
								&#125;<br />
							</pre>
							<p>
								We use the returned schema to dynamically generate the input forms on this page
							</p>
							<p>
								When you click <strong>Run</strong>, the action is executed via <strong>POST /actions</strong>.
							</p>
							<p>
								(<em>Simple in design, these 2 Actionkit endpoints is all it takes to power use cases like <strong>tools for AI Agents</strong> and <strong>Embedded Workflow Builders</strong>)</em>
							</p>
							<h2 className='font-bold'>Try it:</h2>
							<p>
								Pick an integration, fill in the inputs, and execute an action. After you get a feel for ActionKit works, explore our use case tabs in the navbar.
							</p>
							<p>
								We selected just a few common integrations. You can check out
								the full catalog of integrations and actions in&nbsp;
								<a href="https://docs.useparagon.com/actionkit/overview"
									target="_blank"
									className="text-indigo-700 hover:text-indigo-500 font-semibold">
									our docs
								</a>.
							</p>
						</div>
					</DialogHeader>
				</DialogContent>
			</Dialog>
			<div className="flex flex-col md:flex-row gap-4 h-full relative w-full max-h-[calc(100dvh-10rem)]">
				<div className="flex-1 w-full md:w-1/2">
					<div className='flex space-x-1 items-center mb-4'>
						<h1 className="font-bold ">Actions</h1>
						<Tooltip>
							<TooltipTrigger>
								<Info size={12} />
							</TooltipTrigger>
							<TooltipContent>
								<p className="text-sm text-wrap w-96 text-center">
									Simplify common 3rd-party APIs with Actions. ActionKit provides Actions with simplified
									schemas and parameter descriptions to dynamically create UIs and tool descriptions.
								</p>
							</TooltipContent>
						</Tooltip>
					</div>
					<div className="flex flex-col gap-6 overflow-x-auto max-h-full border border-neutral-200 rounded-md p-2">
						<div className="flex flex-col gap-2 ">
							<ComboboxField
								id="integration"
								title="Integration"
								value={integration}
								placeholder="Select an integration"
								allowClear
								required
								isFetching={false}
								onSelect={(value) => {
									setIntegration(value ?? null);
								}}
								onOpenChange={(open) => {
									if (!open) {
										setIntegrationQuery('');
									}
								}}
								onDebouncedChange={setIntegrationQuery}
								renderValue={(value) => <IntegrationTitle integration={value} />}
							>
								{filteredIntegrations
									.sort((a, b) => a.name.localeCompare(b.name))
									.map((integration) => (
										<ComboboxField.Item
											key={integration.name}
											value={integration.type}
										>
											<IntegrationTitle integration={integration.type} />
										</ComboboxField.Item>
									))}
							</ComboboxField>
							{integration && (
								<div>
									{
										//@ts-expect-error is type Authenticated Connected User
										user.integrations[integration]?.enabled ? (
											<div className="flex gap-2 items-center">
												<Check className="h-4 w-4 text-green-500" />
												<p className="text-sm text-neutral-500 dark:text-neutral-400">
													Connected
												</p>
												<Button
													variant="ghost"
													className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
													onClick={() => {
														paragonConnect?.uninstallIntegration(integration).then(() => {
															setIsDisconnecting(false);
														});
														setIsDisconnecting(true);
													}}
												>
													Disconnect account{' '}
													{isDisconnecting && (
														<Loader2 className="size-4 animate-spin" />
													)}
												</Button>
											</div>
										) : (
											<div className="flex gap-4 items-center mt-2">
												<Button
													size="sm"
													className="bg-indigo-500 hover:bg-indigo-600 text-white"
													onClick={() => {
														paragonConnect?.connect(integration, {})
													}}
												>
													Connect to {integrationMetadata?.name}
												</Button>
												<p className="text-sm text-neutral-500 dark:text-neutral-400">
													Connect an account to test Actions.
												</p>
											</div>
										)}
								</div>
							)}
						</div>
						<ComboboxField
							id="action"
							title="Action"
							value={action}
							placeholder="Select an Action"
							allowClear
							required
							isFetching={actionsIsLoading}
							//@ts-expect-error is type Authenticated Connected User
							disabled={!integration || !user.integrations[integration]?.enabled}
							onSelect={(value) => setAction(value ?? null)}
							onOpenChange={(open) => {
								if (!open) {
									setActionQuery('');
								}
							}}
							onDebouncedChange={setActionQuery}
							renderValue={(value) => (
								<p>{actions?.find((a) => a.name === value)?.title}</p>
							)}
						>
							{filteredActions.map((action) => (
								<ComboboxField.Item key={action.name} value={action.name}>
									<p>{action.title}</p>
								</ComboboxField.Item>
							))}
						</ComboboxField>
						{selectedAction &&
							selectedAction.inputs?.map((input: SerializedConnectInput) => (
								<SerializedConnectInputPicker
									key={input.id}
									integration={integration!}
									field={overrideInput(integration!, input)}
									value={inputValues[input.id]}
									onChange={(v) =>
										setInputValues((prev) => ({ ...prev, [input.id]: v }))
									}
								/>
							))}
						<div>
							<Button
								className="bg-indigo-500 hover:bg-indigo-600 text-white"
								disabled={!selectedAction || actionIsLoading}
								onClick={() => {
									actionMutate(undefined, { revalidate: true });
								}}
							>
								<Play className="size-3 mr-1 fill-white" /> Run Action{' '}
								{actionIsLoading && (
									<Loader2 className="size-4 animate-spin" />
								)}
							</Button>
						</div>
					</div>
				</div>
				<div className="w-full md:w-1/2">
					<div className="flex flex-col justify-between items-start mb-4">
						<div className='mb-4 flex space-x-1 items-center'>
							<h1 className="font-bold">API Call</h1>
							<Tooltip>
								<TooltipTrigger>
									<Info size={12} />
								</TooltipTrigger>
								<TooltipContent>
									<p className="text-sm text-wrap text-center">
										Behind the scenes, Actions go through the ActionKit API.
										<br />
										Just provide the action name, input parameters, and user token.
									</p>
								</TooltipContent>
							</Tooltip>
						</div>
						<div className="w-full flex flex-col gap-2 h-full">
							{actionData || actionError || actionIsLoading ? (
								<div className="flex flex-col gap-2 h-full">
									<pre className="text-xs p-2 bg-neutral-100 rounded-md overflow-x-auto">
										POST https://actionkit.useparagon.com/projects/PARAGON_PROJECT_ID/actions,<br />
										headers: &#123;<br />
										&nbsp;Authorization: &apos;Bearer PARAGON_SIGNED_TOKEN&apos;,<br />
										&nbsp;Content-Type: &apos;application/json&apos;,<br />
										&#125;,<br />
										body: &#123;<br />
										&nbsp;action: {selectedAction?.name},<br />
										&nbsp;parameters: {JSON.stringify(formatInputs(inputValues))},<br />
										&#125;
									</pre>
								</div>
							) : (
								<div className="flex flex-col gap-2 border border-neutral-200 rounded-md p-4">
									<p className="text-center text-neutral-500 dark:text-neutral-400 text-sm">
										Run an Action to see the API call.
									</p>
								</div>
							)}
						</div>

					</div>
					<div className="flex justify-between items-center mb-4">
						<h1 className="font-bold">Output</h1>
						<div className="flex gap-2 items-center">
							{!actionIsLoading && !actionError && <Check className="size-5 text-green-600" />}
							{actionError && (
								<XCircle className="size-5 fill-red-500 text-white" />
							)}
							{actionIsLoading && <Loader2 className="size-4 animate-spin" />}
							<p className="text-sm font-semibold text-neutral-600">
								{!actionIsLoading && !actionError
									? 'Success'
									: actionError
										? 'Error'
										: actionIsLoading
											? 'Running...'
											: ''}
							</p>
						</div>
					</div>
					{actionData || actionError ? (
						<div className="flex flex-col gap-2 h-full">
							<pre className="text-xs p-2 bg-neutral-100 rounded-md overflow-x-auto">
								{actionData
									? JSON.stringify(actionData, null, 2)
									: actionError
										? JSON.stringify(actionError, null, 2)
										: ''}
							</pre>
						</div>
					) : (
						<div className="flex flex-col gap-2 border border-neutral-200 rounded-md p-4">
							<p className="text-center text-neutral-500 dark:text-neutral-400 text-sm">
								{actionIsLoading
									? 'Running...'
									: 'Run an Action to see the output here.'}
							</p>
						</div>
					)}
				</div>
			</div>
		</>
	);
}

export function overrideInput(
	integration: string,
	input: SerializedConnectInput,
) {
	const mapping =
		(inputsMapping as unknown as Record<string, Record<string, string>>) ||
		({} as Record<string, Record<string, string>>);
	const sourceType = mapping[integration]?.[input.id as string];
	if (sourceType) {
		return {
			...(input as SerializedConnectInput<SidebarInputType.DynamicEnum>),
			type: SidebarInputType.DynamicEnum,
			sourceType,
		} as SerializedConnectInput;
	}
	return input;
}
