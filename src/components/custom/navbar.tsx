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
			<div className="flex items-center space-x-1 border-2 rounded-sm py-1 px-2 cursor-pointer static"
				onClick={toggleLogout}>
				<User size={20} />
				<div>
					{user?.user?.firstName}
				</div>
				{logoutPanel && <div className="absolute -bottom-6 right-4">
					<Button variant={"outline"} onClick={() => signOut()}>
						Sign out
					</Button>
				</div>}
			</div>
		</div>
	)
}

