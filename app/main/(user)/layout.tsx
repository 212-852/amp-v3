import { AppFooter } from "@/components/footer";
import { AppHeader } from "@/components/header";
import { LanguageProvider } from "@/components/language";
import { LineProvider } from "@/components/line";
import "../main.css";

export default function UserLayout({ children }: LayoutProps<"/main">) {
  return (
    <LanguageProvider>
      <LineProvider>
        <div className="mainApp">
          <AppHeader />
          <main className="mainContent" aria-label="Main content">
            {children}
          </main>
          <AppFooter />
        </div>
      </LineProvider>
    </LanguageProvider>
  );
}
