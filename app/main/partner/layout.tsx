import type { Viewport } from "next";

import { PortalToolbar, RobotNotice } from "@/components/robot";
import { getCopyright } from "@/lib/content";
import "@/app/main/common.css";
import "@/app/main/partner/partner.css";

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function PartnerLayout({
  children,
}: LayoutProps<"/main/partner">) {
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
          message="You have a new partner notification."
          role="partner"
        />
        <small>{getCopyright()}</small>
      </footer>
    </div>
  );
}
