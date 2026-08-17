import type { Viewport } from "next";

import { PortalToolbar, RobotNotice } from "@/components/robot";
import { getCopyright } from "@/lib/content";
import { identityDispatcher } from "@/lib/identity";
import "@/app/main/common.css";
import "@/app/main/partner/partner.css";

export const viewport: Viewport = {
  themeColor: "#f7f7f7",
};

export default async function PartnerLayout({
  children,
}: LayoutProps<"/main/partner">) {
  const appConfig = await identityDispatcher({ action: "get_app_config" });
  return (
    <div className="adminApp partnerApp">
      <header className="adminHeader">
        <PortalToolbar displayName="Partner" chatMode="icon" />
        <nav className="adminBreadcrumb" aria-label="Breadcrumb">
          <strong>Home</strong>
        </nav>
      </header>

      <main className="adminMain partnerMain">{children}</main>

      <footer className="adminFooter">
        <RobotNotice
          role="partner"
        />
        <small>{getCopyright(appConfig.copyright, appConfig.company.name, "ja", "corporate")}</small>
      </footer>
    </div>
  );
}
