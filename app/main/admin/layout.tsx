import type { Viewport } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { PortalToolbar, RobotNotice } from "@/components/robot";
import { getCopyright } from "@/lib/content";
import { identityDispatcher, SESSION_COOKIE_NAME } from "@/lib/identity";
import "@/app/main/common.css";
import "@/app/main/admin/admin.css";

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default async function AdminLayout({
  children,
}: LayoutProps<"/main/admin">) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionToken
    ? await identityDispatcher({
        action: "resolve_session",
        sessionToken,
      })
    : null;

  if (!session || session.role !== "admin") {
    const hostname = (await headers()).get("host")?.split(":")[0];
    redirect(
      hostname === "localhost" || hostname === "127.0.0.1" ? "/main" : "/",
    );
  }

  return (
    <div className="adminApp">
      <header className="adminHeader">
        <PortalToolbar displayName={session.displayName} chatMode="toggle" />
        <nav className="adminBreadcrumb" aria-label="Breadcrumb">
          <strong>Home</strong>
        </nav>
      </header>

      <main className="adminMain">{children}</main>

      <footer className="adminFooter">
        <RobotNotice
          message="There are items requiring administrator review."
          role="admin"
          tier={session.tier}
        />
        <small>{getCopyright()}</small>
      </footer>
    </div>
  );
}
