import { AppFooter } from "@/components/footer";
import { AppHeader } from "@/components/header";
import { LineProvider } from "@/components/line";
import "../main.css";

export default function UserLayout({ children }: LayoutProps<"/main">) {
  return (
    <LineProvider>
      <div className="mainApp">
        <AppHeader />
        <main className="mainContent" aria-label="Main content">
          {children}
        </main>
        <AppFooter />
      </div>
    </LineProvider>
  );
}
