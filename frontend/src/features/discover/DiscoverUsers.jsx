import { Link } from "react-router-dom";

export default function DiscoverUsers({ filteredUsers, searchText, setSearchText, status }) {
  return (
          <main className="discover-main-panel">
            <h2 className="discover-panel-title-lg">
              <strong>Discover Users</strong>
            </h2>

            <p className="discover-user-count">
              {filteredUsers.length} public profile
              {filteredUsers.length === 1 ? "" : "s"}
            </p>

            <input
              type="text"
              placeholder="Search users by name or bio..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="discover-input"
            />

            {status && <p className="discover-status-text">{status}</p>}

            {!status && filteredUsers.length === 0 && (
              <p className="discover-status-text">No public users found.</p>
            )}

            <div className="discover-flex-list">
              {filteredUsers.map((user) => {
                const name =
                  user.displayName || user.name || user.username || "Spotify User";
                const bio = user.bio || "Music listener";
                const image = user.profileImage || user.image || user.photoURL;

                return (
                  <div key={user.id} className="discover-user-row">
                    {image ? (
                      <img src={image} alt={name} className="discover-avatar" />
                    ) : (
                      <div className="discover-empty-avatar">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <Link
                        to={`/user/${user.id}`}
                        className="discover-name-button"
                        style={{ textDecoration: "none", display: "inline-block" }}
                      >
                        {name}
                      </Link>
                      <p className="discover-user-bio">{bio}</p>
                    </div>

                    <Link
                      to={`/user/${user.id}`}
                      className="discover-small-button"
                      style={{ textDecoration: "none", textAlign: "center", display: "inline-block" }}
                    >
                      View
                    </Link>
                  </div>
                );
              })}
            </div>
          </main>
  );
}
