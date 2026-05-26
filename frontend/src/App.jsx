import { Outlet, Link } from "react-router-dom";

export default function App() {
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

      <Outlet />
    </>
  );
}