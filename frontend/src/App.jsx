import { Outlet, Link, useLocation } from "react-router-dom";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <div className="flex flex-col h-screen">
      <nav className="shrink-0 sticky top-0 z-10 bg-[var(--bg-primary)] border-b border-[var(--accent-secondary)]/30 px-4 py-2 flex items-center gap-2 text-sm">
        <Link to="/">Home</Link>{" | "}
        <Link to="/liked-songs">Liked Songs</Link>{" | "}
        <Link to="/top-artists">Top Artists</Link>{" | "}
        <Link to="/top-songs">Top Songs</Link>{" | "}
        <Link to="/profile">Profile</Link>{" | "}
        <Link to="/discover">Discover</Link>{" | "}
        <Link to="/inbox">Inbox</Link>{" | "}
        <Link to="/forums">Forums</Link>{" | "}
        <Link to="/spotify-test">Spotify Test</Link>
      </nav>

      {!isLandingPage && (
        <div style={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 1000
        }}>
          <ThemeToggle />
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}