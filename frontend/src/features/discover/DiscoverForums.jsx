import { Link } from "react-router-dom";

export default function DiscoverForums({ forums }) {
  return (
          <aside className="discover-forum-panel">
            <h2 className="discover-panel-title-md">
              <strong>Featured Forums</strong>
            </h2>

            <div className="discover-flex-list">
              {forums.map((forum) => (
                <Link key={forum.id} to="/forums" className="discover-forum-card">
                  💬 {forum.title || "Forum Post"}
                </Link>
              ))}

              {forums.length === 0 && (
                <p className="discover-status-text">No forums yet.</p>
              )}
            </div>
          </aside>
  );
}
