import type { Viewport } from "next";

import { PortalToolbar, RobotNotice } from "@/components/robot";
import { getCopyright } from "@/lib/content";
import { identityDispatcher } from "@/lib/identity";
import "@/app/main/common.css";
import "@/app/main/driver/driver.css";

export const viewport: Viewport = {
  themeColor: "#f5f5f5",
};

export default async function DriverLayout({
  children,
}: LayoutProps<"/main/driver">) {
  const appConfig = await identityDispatcher({ action: "get_app_config" });
  return (
    <div className="adminApp driverApp">
      <header className="adminHeader">
        <PortalToolbar displayName="Driver" chatMode="icon" />
        <nav className="adminBreadcrumb" aria-label="Breadcrumb">
          <strong>Home</strong>
        </nav>
      </header>

      <main className="adminMain driverMain">{children}</main>

      <footer className="adminFooter">
        <RobotNotice
          message=""
          role="driver"
        />
        <small>{getCopyright(appConfig.copyright, appConfig.company.name, "ja", "corporate")}</small>
      </footer>
    </div>
  );
}
