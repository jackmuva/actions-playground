import { userWithToken } from "@/lib/auth";
import { Navbar } from "@/components/custom/navbar";
import ActionTester from "@/components/feature/action-tester";
import ActionsSidebar from "@/components/custom/action/actions-sidebar";

export default async function Actions() {
	const session = await userWithToken();

	return (
		<div className="min-h-dvh w-dvw flex flex-col justify-center items-center 
      md:items-start md:flex-row md:space-x-2 px-2 md:px-4 pt-28">
			<Navbar session={session} />
			<ActionsSidebar session={session} />
			<ActionTester session={session} />
		</div>
	)
}
