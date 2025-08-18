import { Button } from "@/components/ui/button";
import { withAuth, getSignInUrl } from "@workos-inc/authkit-nextjs";
import { redirect, RedirectType } from "next/navigation";

export default async function Welcome() {
  const signUpUrl = await getSignInUrl();
  const { user } = await withAuth();

  if (user) {
    redirect('/actions', RedirectType.replace)
  }

  return (
    <div className="min-h-dvh w-dvw flex flex-col items-center pt-40 space-y-6 bg-radial">
      <h1 className="font-bold text-5xl">
        ActionKit Playground
      </h1>
      <h2 className="text-foreground-muted text-2xl max-w-[450px] text-center">
        One API/MCP to equip your AI agent product with 1000+ integration actions
      </h2>
      <div className="flex space-x-5 w-64 justify-center">
        <Button size={"lg"} variant={"indigo"} className="p-0 basis-1/2">
          <a href={signUpUrl} target="_self"
            className="w-full h-full flex items-center justify-center">
            Try Now
          </a>
        </Button>
        <Button size={"lg"} variant={"indigo"} className="p-0 basis-1/2">
          <a href="https://docs.useparagon.com/actionkit/overview" target="_blank"
            className="w-full h-full flex items-center justify-center">
            Read Docs
          </a>
        </Button>
      </div>
    </div>
  );
}
