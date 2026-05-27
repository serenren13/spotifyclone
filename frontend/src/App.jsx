import { Outlet, Link, useLocation } from "react-router-dom";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  const location = useLocation();
  const isLandingPage = location.pathname === "/";

  return (
    <>
      <nav>
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

      <Outlet />
    </>
  );
}