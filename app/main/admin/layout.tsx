import { PortalToolbar, RobotNotice } from "@/components/robot";
import { getCopyright } from "@/lib/content";
import "@/app/main/common.css";
import "@/app/main/admin/admin.css";

export default function AdminLayout({ children }: LayoutProps<"/main/admin">) {
  return (
    <div className="adminApp">
      <header className="adminHeader">
        <PortalToolbar displayName="Administrator" chatMode="toggle" />
        <nav className="adminBreadcrumb" aria-label="Breadcrumb">
          <strong>Home</strong>
        </nav>
      </header>

      <main className="adminMain">{children}</main>

      <footer className="adminFooter">
        <RobotNotice message="There are items requiring administrator review." />
        <small>{getCopyright()}</small>
      </footer>
    </div>
  );
}
