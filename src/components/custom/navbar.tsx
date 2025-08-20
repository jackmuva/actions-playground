"use client";
import Image from "next/image";
import { UserDropdown } from "@/components/custom/user-dropdown";
import { HatGlasses, WandSparkles } from "lucide-react";
import { usePathname } from "next/navigation";

export function Navbar({ session }: { session: { user: any, paragonUserToken?: string } }) {
	const user = session?.user;
	const pathname = usePathname();

	return (
		<div className="absolute top-0 right-0 z-30 border-b h-24 w-full flex flex-col px-4 pt-4">
			<div className="flex justify-between items-center h-1/2">
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
			<div className="flex space-x-6 pl-10 h-1/2 items-end pb-1" >
				<a href="/actions" className={`${pathname === "/actions" ? "font-semibold underline" : ""}
						 flex items-center space-x-1 hover:underline`}>
					<WandSparkles size={18} />
					<p>Actions</p>
				</a>
				<a href="/agent" className={`${pathname === "/agent" ? "font-semibold underline" : ""} 
						 flex items-center space-x-1 hover:underline`}>
					<HatGlasses size={18} />
					<p>Agent</p>
				</a>
			</div>
		</div >
	)
}

