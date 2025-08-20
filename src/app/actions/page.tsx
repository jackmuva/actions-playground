import IntegrationsSidebar from "@/components/custom/integrations-sidebar";
import { userWithToken } from "@/lib/auth";
import { Navbar } from "@/components/custom/navbar";
import ActionTester from "@/components/feature/action-tester";
import { ParagonProviderWrapper } from "@/components/custom/paragon-provider-wrapper";

export default async function Actions() {
  const session = await userWithToken();

  return (
    <div className="min-h-dvh w-dvw flex flex-col md:flex-row px-2 md:px-8 pt-18">
      <ParagonProviderWrapper paragonUserToken={session?.paragonUserToken}>
        <Navbar />
        <IntegrationsSidebar session={session} />
        <ActionTester session={session} />
      </ParagonProviderWrapper>
    </div>
  )
}
