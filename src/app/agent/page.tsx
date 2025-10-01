import { userWithToken } from "@/lib/auth";
import { Navbar } from "@/components/custom/navbar";
import Chat from "@/components/custom/chat/chat";
import ActionsSidebar from "@/components/custom/action/actions-sidebar";

export default async function Agent() {
	const session = await userWithToken();

	return (
		<div className="h-dvh w-dvw flex flex-col md:flex-row px-2 md:px-4 pt-28 pb-12">
			<Navbar session={session} />
			<ActionsSidebar session={session} />
			<Chat session={session} />
		</div>
	)
}
