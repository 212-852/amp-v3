import { Bell, Globe2, UserRound } from "lucide-react";

export function AppHeader() {
  return (
    <header className="appHeader">
      <div className="headerContent">
        <div className="headerBrand">
          <strong className="headerLogo">PET TAXI</strong>
          <span className="headerPageName">Home</span>
        </div>

        <div className="headerAccount">
          <nav className="headerActions" aria-label="Account navigation">
            <button
              className="headerIconButton headerLoginButton"
              type="button"
              aria-label="Log in with LINE"
            >
              <span className="japaneseText">ログイン</span>
            </button>
            <button
              className="headerIconButton"
              type="button"
              aria-label="Notifications"
            >
              <Bell aria-hidden="true" />
            </button>
            <button className="headerPill headerLanguage" type="button">
              <Globe2 aria-hidden="true" />
              <span>EN</span>
            </button>
          </nav>

          <div className="headerProfile">
            <div className="headerAvatar" aria-label="Guest avatar">
              <UserRound aria-hidden="true" />
            </div>
            <strong>Guest</strong>
          </div>
        </div>
      </div>

      <svg
        className="headerWave"
        viewBox="0 0 1440 150"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 102C195 42 334 13 514 40c199 30 278 101 493 94 161-5 269-43 433-58v74H0Z" />
      </svg>
    </header>
  );
}
