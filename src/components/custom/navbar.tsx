"use client";
import { Button } from "../ui/button";
import { NoUserInfo, signOut, UserInfo, withAuth } from "@workos-inc/authkit-nextjs";
import { User } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export function Navbar() {
	const [user, setUser] = useState<UserInfo | NoUserInfo | null>(null);
	const [logoutPanel, setLogoutPanel] = useState<boolean>(false);

	useEffect(() => {
		withAuth().then((user) => {
			setUser(user);
		});
	}, []);

	const toggleLogout = () => {
		setLogoutPanel((prev) => !prev);
	}

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
				<div className="flex items-center space-x-2 border-2 rounded-sm py-1 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
					onClick={toggleLogout}>
					<User size={20} />
					<div>
						{user?.user?.firstName}
					</div>
				</div>
				{logoutPanel && (
					<div className="absolute top-full right-0 mt-1 w-48 bg-white border border-neutral-100 rounded-md shadow-lg py-2 z-50">
						<div className="px-4 py-2 border-b border-neutral-100">
							<div className="text-sm">
								{user?.user?.firstName} {user?.user?.lastName}
							</div>
							<div className="text-sm overflow-hidden text-ellipsis whitespace-nowrap">
								{user?.user?.email}
							</div>
						</div>
						<div className="px-2 py-1">
							<Button 
								variant="ghost" 
								onClick={() => signOut()}
								className="w-full justify-start hover:text-gray-900 hover:bg-gray-100"
							>
								Sign out
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

