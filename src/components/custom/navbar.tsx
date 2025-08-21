"use client";
import Image from "next/image";
import { UserDropdown } from "@/components/custom/user-dropdown";
import { BookOpen, ClipboardPen, HatGlasses, WandSparkles } from "lucide-react";
import { usePathname } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";

export function Navbar({ session }: { session: { user: any, paragonUserToken?: string } }) {
	const user = session?.user;
	const pathname = usePathname();

	return (
		<div className="absolute top-0 right-0 z-30 border-b h-24 w-full flex flex-col px-4 pt-4">
			<div className="flex justify-between items-center h-1/2">
				<a href="/" target="_self"
					className="flex space-x-1">
					<Image src={"./paragon-no-text.svg"} alt="Paragon logo" height={20} width={20} />
					<h1 className="font-semibold text-xl">
						Actionkit Playground
					</h1>
				</a>
				<div className="flex space-x-2 items-center">
					<Button size={"default"} variant={"indigo"} className="">
						<a href="https://docs.useparagon.com/actionkit/overview" target="_blank"
							className="space-x-2 w-full h-full flex items-center justify-center">
							<ClipboardPen size={20} />
							<p>Book a demo</p>
						</a>
					</Button>
					<Button size={"default"} variant={"outline"} className="">
						<a href="https://docs.useparagon.com/actionkit/overview" target="_blank"
							className="space-x-2 w-full h-full flex items-center justify-center">
							<BookOpen size={20} />
							<p>Read Docs</p>
						</a>
					</Button>
					<div className="relative h-full">
						<UserDropdown user={user} />
					</div>
				</div>
			</div>
			<div className="flex space-x-6 pl-10 h-1/2 items-end pb-1" >
				<Tooltip>
					<TooltipTrigger>
						<a href="/actions" className={`${pathname === "/actions" ? "font-semibold underline" : ""}
						 flex items-center space-x-1 hover:underline`}>
							<WandSparkles size={18} />
							<p>Actions</p>
						</a>
					</TooltipTrigger>
					<TooltipContent>
						<p className="text-wrap text-center max-w-48">
							Connect your integrations and see how easy it is to run 3rd-party actions
						</p>
					</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger>
						<a href="/agent" className={`${pathname === "/agent" ? "font-semibold underline" : ""} 
						 flex items-center space-x-1 hover:underline`}>
							<HatGlasses size={18} />
							<p>Agent</p>
						</a>
					</TooltipTrigger>

					<TooltipContent>
						<p className="text-wrap text-center max-w-48">
							Example implementation of ActionKit: the agent tools use case
						</p>
					</TooltipContent>
				</Tooltip>
			</div>
		</div >
	)
}

