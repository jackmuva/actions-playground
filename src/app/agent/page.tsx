import IntegrationsSidebar from "@/components/custom/integrations-sidebar";
import { userWithToken } from "@/lib/auth";
import { Navbar } from "@/components/custom/navbar";

export default async function Agent() {
  const session = await userWithToken();

  return (
    <div className="min-h-dvh w-dvw flex flex-col md:flex-row px-2 md:px-8 pt-28">
      <Navbar session={session} />
      <IntegrationsSidebar session={session} />
    </div>
  )
}
