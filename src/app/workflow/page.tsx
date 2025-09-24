import { userWithToken } from "@/lib/auth";
import { Navbar } from "@/components/custom/navbar";

export default async function WorkflowPage() {
	const session = await userWithToken();

	return (
		<div className="h-dvh w-dvw flex flex-col md:flex-row px-2 md:px-4 pt-28 pb-12">
			<Navbar session={session} />
		</div>
	);
}
