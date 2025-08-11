import IntegrationsSidebar from "@/components/custom/integrations-sidebar";
import { userWithToken } from "@/lib/auth";

export default async function Actions() {
  const session = await userWithToken();
  return (
    <div className="min-h-dvh w-dvw flex">
      <IntegrationsSidebar session={session} />

    </div>
  )
}
