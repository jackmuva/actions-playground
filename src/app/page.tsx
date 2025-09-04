import { Button } from "@/components/ui/button";
import { withAuth, getSignInUrl } from "@workos-inc/authkit-nextjs";
import { redirect, RedirectType } from "next/navigation";
import Image from "next/image";

export default async function Welcome() {
	const signUpUrl = await getSignInUrl();
	const { user } = await withAuth();

	if (user) {
		redirect('/actions', RedirectType.replace)
	}

	return (
		<div className="min-h-dvh w-dvw flex flex-col items-center justify-center relative">
			<Image src="/playground.png" alt="test" width={1000000} height={1000000}
				className="min-h-dvh left-0 top-0 absolute blur-xs brightness-75" />
			<div className="w-fit flex flex-col items-center p-20 space-y-6 rounded-sm 
				border bg-radial z-20 shadow-xl">
				<h1 className="font-bold text-5xl">
					ActionKit Playground
				</h1>
				<h2 className="text-foreground-muted text-2xl max-w-[500px] text-center">
					One API/MCP to equip your AI agent product with 1000+ integration actions
				</h2>
				<p className="text-foreground-muted max-w-[850px] text-xl text-center">
					Explore <strong>how actions work</strong> and check out a
					few <strong>popular implementations</strong> of ActionKit
				</p>
				<div className="flex space-x-5 w-64 justify-center">
					<Button size={"lg"} variant={"indigo"} className="p-6">
						<a href={signUpUrl} target="_self"
							className="w-full h-full flex items-center justify-center text-2xl">
							Try Now
						</a>
					</Button>
				</div>
			</div>
		</div>
	);
}
