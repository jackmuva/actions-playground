import { useQuery } from '@tanstack/react-query';
import { paragon } from '@useparagon/connect';
import ConnectSDK from "@useparagon/connect/ConnectSDK";
import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    paragon: typeof paragon;
  }
}

let paragonConnect: ConnectSDK | undefined;
export default function useParagon(paragonUserToken: string) {
  useEffect(() => {
    if (typeof window !== "undefined" && typeof paragonConnect === "undefined") {
      paragonConnect = new ConnectSDK();
    }

    if (!window.paragon) {
      window.paragon = paragon;
      paragon.setHeadless(true);
    }
  }, []);

  const [user, setUser] = useState(paragonConnect ? paragonConnect.getUser() : null);
  const [error, setError] = useState();

  const updateUser = useCallback(async () => {
    if (!paragonConnect) {
      return;
    }
    const authedUser = paragonConnect.getUser();
    if (authedUser.authenticated) {
      setUser({ ...authedUser });
    }
  }, []);

  // Listen for account state changes
  useEffect(() => {
    // @ts-ignore
    paragonConnect.subscribe("onIntegrationInstall", updateUser);
    // @ts-ignore
    paragonConnect.subscribe("onIntegrationUninstall", updateUser);
    return () => {
      // @ts-ignore
      paragonConnect.unsubscribe("onIntegrationInstall", updateUser);
      // @ts-ignore
      paragonConnect.unsubscribe("onIntegrationUninstall", updateUser);
    };
  }, []);

  useEffect(() => {
    if (!error) {
      paragon.authenticate(
        process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID!,
        paragonUserToken
      ).then(() => {
        if (paragonConnect) {
          paragonConnect.authenticate(
            process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID!,
            paragonUserToken
          )
            .then(updateUser)
            .catch(setError);
        }
      }).catch(setError);
    }
  }, [error, paragonUserToken]);

  return {
    paragonConnect,
    user,
    error,
    updateUser,
  };
}

export function useIntegrationMetadata() {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: () => {
      return paragon.getIntegrationMetadata();
    },
  });
}

export function useIntegrationConfig(type: string) {
  return useQuery({
    queryKey: ['integrationConfig', type],
    queryFn: () => {
      return paragon.getIntegrationConfig(type);
    },
  });
}

export function useAuthenticatedUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => {
      const user = paragon.getUser();
      if (!user.authenticated) {
        throw new Error('User is not authenticated');
      }

      return user;
    },
  });
}

type FieldOptionsResponse = Awaited<ReturnType<typeof paragon.getFieldOptions>>;

const fieldOptionsInitialData: FieldOptionsResponse = {
  data: [],
  nestedData: [],
  nextPageCursor: null,
};

export function useFieldOptions({
  integration,
  sourceType,
  search,
  cursor,
  parameters = [],
  enabled = true,
}: {
  integration: string;
  sourceType: string;
  search?: string;
  cursor?: string | number | false;
  parameters?: { cacheKey: string; value: string | undefined }[];
  enabled?: boolean;
}) {
  return useQuery({
    enabled: enabled,
    queryKey: ['fieldOptions', integration, sourceType, search, parameters],
    queryFn: () => {
      if (sourceType) {
        return paragon.getFieldOptions({
          integration,
          action: sourceType,
          search,
          cursor,
          parameters: parameters.map((parameter) => {
            return {
              key: parameter.cacheKey,
              source: {
                type: 'VALUE',
                value: parameter.value,
              },
            };
          }),
        });
      }
      return fieldOptionsInitialData;
    },
    initialData: fieldOptionsInitialData,
  });
}

export function useDataSourceOptions<T>(
  integration: string,
  sourceType: string
) {
  return useQuery({
    queryKey: ['comboInputOptions', integration, sourceType],
    queryFn: () => {
      return paragon.getDataSourceOptions(integration, sourceType) as T;
    },
  });
}
