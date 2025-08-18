import Image from "next/image";
import { userWithToken } from "@/lib/auth";
import { UserDropdown } from "@/components/custom/user-dropdown";

export async function Navbar() {
	const session = await userWithToken();
	const user = session?.user;

	return (
		<div className="absolute top-0 right-0 z-30 border-b h-14 w-full 
			flex justify-between px-4 items-center">
			<div className="flex space-x-1">
				<Image src={"./paragon-no-text.svg"} alt="Paragon logo" height={20} width={20} />
				<h1 className="font-semibold">
					Actionkit Playground
				</h1>
			</div>
			<div className="relative">
				<UserDropdown user={user} />
			</div>
		</div>
	)
}

