import { AppFooter } from "@/components/footer";
import { AppHeader } from "@/components/header";
import "../main.css";

export default function UserLayout({ children }: LayoutProps<"/main">) {
  return (
    <div className="mainApp">
      <AppHeader />
      <main className="mainContent" aria-label="Main content">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
