"use server";

import { handleSignOut } from "@/lib/auth";

export async function signOutAction() {
	await handleSignOut();
}
