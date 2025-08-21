"use client";
import { useEffect, useMemo, useState } from 'react';
import { ComboboxField } from '../form/combobox-field';
import { Button } from '../ui/button';
import { Check, Loader2, Play, XCircle } from 'lucide-react';
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

type ParagonAction = {
  name: string;
  title: string;
  description?: string;
  inputs?: SerializedConnectInput[];
};

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
          parameters: inputValues,
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
      revalidateOnMount: false, // Don't run on mount
      revalidateOnFocus: false, // Don't run on focus
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
    <div className="flex flex-col md:flex-row gap-4 h-full relative w-full max-h-[calc(100dvh-10rem)]">
      <div className="flex-1 w-full md:w-1/2">
        <h1 className="font-bold mb-4">Actions</h1>
        <div className="flex flex-col gap-6 overflow-x-scroll max-h-full border border-neutral-200 rounded-md p-2">
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
        <div className="flex flex-col space-y-2 justify-between items-start mb-4">
          <h1 className="font-bold">API Call</h1>
          <div className="w-full flex flex-col gap-2 h-full">
            {actionData || actionError || actionIsLoading ? (
              <div className="flex flex-col gap-2 h-full">
                <pre className="text-xs p-2 bg-neutral-100 rounded-md overflow-x-scroll">
                  POST https://actionkit.useparagon.com/projects/PARAGON_PROJECT_ID/actions,<br />
                  headers: &#123;<br />
                  &nbsp;Authorization: 'Bearer PARAGON_SIGNED_TOKEN',<br />
                  &nbsp;Content-Type: 'application/json',<br />
                  &#125;,<br />
                  body: &#123;<br />
                  &nbsp;action: {selectedAction?.name},<br />
                  &nbsp;parameters: {JSON.stringify(inputValues)},<br />
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
            <pre className="text-xs p-2 bg-neutral-100 rounded-md overflow-x-scroll">
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
  );
}

function overrideInput(
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
