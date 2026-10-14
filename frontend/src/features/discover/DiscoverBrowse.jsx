import { Link } from "react-router-dom";

export default function DiscoverBrowse() {
  return (
          <aside className="discover-side-panel">
            <h2 className="discover-panel-title-sm">Browse</h2>

            <Link to="/liked-songs" className="discover-nav-card">
              <span className="discover-icon">💚</span> Liked Songs
            </Link>

            <Link to="/top-artists" className="discover-nav-card">
              <span className="discover-icon">🎤</span> Top Artists
            </Link>

            <Link to="/top-songs" className="discover-nav-card">
              <span className="discover-icon">🎧</span> Top Songs
            </Link>

            <Link to="/forums" className="discover-nav-card">
              <span className="discover-icon">💬</span> Forums
            </Link>
          </aside>
  );
}
