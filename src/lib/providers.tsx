'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ConnectSDK, { ExternalFilePicker } from "@useparagon/connect/ConnectSDK";
import type {
  AuthenticatedConnectUser,
  FilePickerOptions,
  IConnectSDK,
  IFilePicker,
} from "@useparagon/connect";
import {
  useState,
  ReactNode,
  useCallback,
  useEffect,
  createContext,
  useMemo,
} from "react";


export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          mutations: {
            retry: false,
          },
          queries: {
            refetchOnWindowFocus: false,
            retry: false,
          },
        },
      })
  );


  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}


interface ExternalFilePickerConstruct {
  new(action: string, options: FilePickerOptions): IFilePicker;
  (action: string, options: FilePickerOptions): IFilePicker;
}

interface ParagonContextType {
  paragon: IConnectSDK & {
    ExternalFilePicker: ExternalFilePickerConstruct;
  };
  user: AuthenticatedConnectUser | null;
  error: any;
  updateUser: () => Promise<void>;
}

export const ParagonContext = createContext<ParagonContextType | undefined>(
  undefined
);

export function ParagonProvider({
  children,
  paragonUserToken,
}: {
  children: ReactNode;
  paragonUserToken?: string;
}) {
  const paragon = useMemo<
    IConnectSDK & {
      ExternalFilePicker?: ParagonContextType["paragon"]["ExternalFilePicker"];
    }
  >(
    () =>
      new ConnectSDK(undefined, {
        skipBootstrapWithLastKnownState: true,
      }),
    []
  );

  const filePickerClass = useMemo<
    ParagonContextType["paragon"]["ExternalFilePicker"]
  >(
    () =>
      function WrappedExternalFilePicker(
        action: string,
        options: FilePickerOptions
      ): IFilePicker {
        return new ExternalFilePicker(action, options, paragon as ConnectSDK);
      } as ExternalFilePickerConstruct,
    [paragon]
  );
  const [user, setUser] = useState<AuthenticatedConnectUser | null>(null);
  const [error, setError] = useState();
  const [mounted, setMounted] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setMounted(true);
  }, []);

  const updateUser = useCallback(async () => {
    if (!paragon) {
      return;
    }
    const authedUser = { ...paragon.getUser() };

    console.log('updating user');
    if (authedUser.authenticated) {
      setUser(authedUser as AuthenticatedConnectUser);
    }
  }, []);

  // Listen for account state changes
  useEffect(() => {
    if (!mounted) return;
    
    // @ts-ignore
    window.paragon = paragon;
    // @ts-ignore
    paragon.subscribe("onIntegrationInstall", updateUser);
    // @ts-ignore
    paragon.subscribe("onIntegrationUninstall", updateUser);
    return () => {
      // @ts-ignore
      paragon.unsubscribe("onIntegrationInstall", updateUser);
      // @ts-ignore
      paragon.unsubscribe("onIntegrationUninstall", updateUser);
    };
  }, [updateUser, mounted]);

  useEffect(() => {
    // Only authenticate after component has mounted on client side
    if (!mounted) return;
    
    // If:
    // - There is no error
    // - The user is null or not authenticated
    // - There is a token available
    console.log('authenticating');
    if (!error && !user?.authenticated && paragonUserToken) {
      paragon
        .authenticate(
          process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID!,
          paragonUserToken
        )
        .then(updateUser)
        .catch(setError);
    }
  }, [error, paragonUserToken, user, updateUser, mounted]);

  paragon.ExternalFilePicker = filePickerClass;

  console.log('returning new paragon instance');
  return (
    <ParagonContext.Provider
      value={{
        paragon: paragon as ParagonContextType["paragon"],
        user: user?.authenticated ? user : null,
        error,
        updateUser,
      }}
    >
      {children}
    </ParagonContext.Provider>
  );
}
