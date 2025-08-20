'use client';
import { ParagonProvider } from "@/lib/providers";
import { ReactNode } from "react";

interface ParagonProviderWrapperProps {
	children: ReactNode;
	paragonUserToken?: string;
}

export function ParagonProviderWrapper({
	children,
	paragonUserToken,
}: ParagonProviderWrapperProps) {
	return (
		<ParagonProvider paragonUserToken={paragonUserToken}>
			{children}
		</ParagonProvider>
	);
} 
