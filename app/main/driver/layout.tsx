import type { Viewport } from "next";

import { PortalToolbar, RobotNotice } from "@/components/robot";
import { Workspace } from "@/components/workspace";
import { getCopyright } from "@/lib/content";
import "@/app/main/common.css";
import "@/app/main/driver/driver.css";

export const viewport: Viewport = {
  themeColor: "#f5f5f5",
};

export default function DriverLayout({
  children,
}: LayoutProps<"/main/driver">) {
  return (
    <div className="adminApp driverApp">
      <header className="adminHeader">
        <PortalToolbar displayName="Driver" chatMode="icon" />
        <nav className="adminBreadcrumb" aria-label="Breadcrumb">
          <strong>Home</strong>
        </nav>
      </header>

      <main className="adminMain driverMain"><Workspace role="driver">{children}</Workspace></main>

      <footer className="adminFooter">
        <RobotNotice
          message="You have a new driver notification."
          role="driver"
        />
        <small>{getCopyright()}</small>
      </footer>
    </div>
  );
}
