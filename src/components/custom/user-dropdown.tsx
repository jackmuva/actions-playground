"use client";
import { Button } from "../ui/button";
import { User } from "lucide-react";
import { useState } from "react";
import { signOutAction } from "./sign-out";

export function UserDropdown({ user }: any) {
	const [logoutPanel, setLogoutPanel] = useState<boolean>(false);

	const toggleLogout = () => {
		setLogoutPanel((prev) => !prev);
	};

	return (
		<>
			<Button variant={"outline"} onClick={toggleLogout} >
				<User size={20} />
				<div>
					{user?.firstName}
				</div>
			</Button>
			{logoutPanel && (
				<div className="absolute top-full right-0 mt-1 w-48 bg-white border rounded-md shadow-lg py-2 z-50">
					<div className="px-4 py-2 border-b">
						<div className="text-sm">
							{user?.firstName} {user?.lastName}
						</div>
						<div className="text-sm overflow-hidden text-ellipsis whitespace-nowrap">
							{user?.email}
						</div>
					</div>
					<div className="px-2 py-1">
						<Button
							variant="ghost"
							onClick={() => signOutAction()}
							className="w-full justify-start hover:text-gray-900 hover:bg-gray-100"
						>
							Sign out
						</Button>
					</div>
				</div>
			)}
		</>
	);
}
