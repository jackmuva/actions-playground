import { userWithToken } from "@/lib/auth";
import { ParagonProvider } from "@/lib/providers";
import { ReactNode } from "react";

export async function ParagonProviderWrapper({
	children,
}: {
	children: ReactNode;
}) {
	const session = await userWithToken();

	return (
		<ParagonProvider paragonUserToken={session?.paragonUserToken}>
			{children}
		</ParagonProvider>
	);
} 
