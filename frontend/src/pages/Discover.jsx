import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Discover() {
  const [users, setUsers] = useState([]);
  const [forums, setForums] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState("Loading discover page...");

  useEffect(() => {
    async function fetchData() {
      try {
        const usersResponse = await fetch("http://localhost:5001/api/users/discover");
        const usersData = await usersResponse.json();

        const forumsResponse = await fetch("http://localhost:5001/api/forums");
        const forumsData = await forumsResponse.json();

        setUsers(usersData);
        setForums(forumsData.slice(0, 4));
        setStatus("");
      } catch (error) {
        console.log(error);
        setStatus("Could not load discover page.");
      }
    }

    fetchData();
  }, []);

  const filteredUsers = users.filter((user) => {
    const name = user.displayName || user.name || user.username || "";
    const bio = user.bio || "";

    return (
      name.toLowerCase().includes(searchText.toLowerCase()) ||
      bio.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  return (
    <div style={pageStyle}>
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "2.75rem", margin: 0 }}>
            <strong>Discover</strong>
          </h1>

          <p style={{ color: "var(--text-muted, #667085)", marginTop: "0.5rem" }}>
            Explore <strong>public profiles</strong>, discover new music tastes,
            and jump into <strong>featured forums</strong>.
          </p>
        </div>

        <div style={layoutStyle}>
          <aside style={sidePanelStyle}>
            <h2 style={{ fontSize: "1.05rem", margin: "0 0 0.5rem" }}>
              Browse
            </h2>

            <Link to="/liked-songs" style={navCardStyle}>
              <span style={iconStyle}>💚</span> Liked Songs
            </Link>

            <Link to="/top-artists" style={navCardStyle}>
              <span style={iconStyle}>🎤</span> Top Artists
            </Link>

            <Link to="/top-songs" style={navCardStyle}>
              <span style={iconStyle}>🎧</span> Top Songs
            </Link>

            <Link to="/forums" style={navCardStyle}>
              <span style={iconStyle}>💬</span> Forums
            </Link>
          </aside>

          <main style={mainPanelStyle}>
            <h2 style={{ fontSize: "1.75rem", margin: 0 }}>
              <strong>Discover Users</strong>
            </h2>

            <p
              style={{
                color: "var(--text-muted, #667085)",
                margin: "0.35rem 0 1.25rem",
              }}
            >
              {filteredUsers.length} public profile
              {filteredUsers.length === 1 ? "" : "s"}
            </p>

            <input
              type="text"
              placeholder="Search users by name or bio..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={inputStyle}
            />

            {status && (
              <p style={{ color: "var(--text-muted, #667085)" }}>
                {status}
              </p>
            )}

            {!status && filteredUsers.length === 0 && (
              <p style={{ color: "var(--text-muted, #667085)" }}>
                No public users found.
              </p>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.9rem",
              }}
            >
              {filteredUsers.map((user) => {
                const name =
                  user.displayName ||
                  user.name ||
                  user.username ||
                  "Spotify User";

                const bio = user.bio || "Music listener";

                const image =
                  user.profileImage ||
                  user.image ||
                  user.photoURL;

                return (
                  <div key={user.id} style={userRowStyle}>
                    {image ? (
                      <img src={image} alt={name} style={avatarStyle} />
                    ) : (
                      <div style={emptyAvatarStyle}>
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div>
                      <Link
                        to={`/user/${user.id}`}
                        style={{ ...nameButtonStyle, textDecoration: "none", display: "inline-block" }}
                      >
                        {name}
                      </Link>

                      <p
                        style={{
                          color: "var(--text-muted, #667085)",
                          margin: "0.3rem 0 0",
                        }}
                      >
                        {bio}
                      </p>
                    </div>

                    <Link
                      to={`/user/${user.id}`}
                      style={{ ...smallButtonStyle, textDecoration: "none", textAlign: "center", display: "inline-block" }}
                    >
                      View
                    </Link>
                  </div>
                );
              })}
            </div>
          </main>

          <aside style={forumPanelStyle}>
            <h2 style={{ fontSize: "1.35rem", margin: "0 0 1.25rem" }}>
              <strong>Featured Forums</strong>
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.9rem",
              }}
            >
              {forums.map((forum) => (
                <Link key={forum.id} to="/forums" style={forumCardStyle}>
                  💬 {forum.title || "Forum Post"}
                </Link>
              ))}

              {forums.length === 0 && (
                <p style={{ color: "var(--text-muted, #667085)" }}>
                  No forums yet.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "var(--background, #eaf8f0)",
  color: "var(--text-light, #101828)",
  padding: "2.5rem",
};

const layoutStyle = {
  background: "var(--card-bg, #ffffff)",
  border: "1px solid var(--border-color, #d0d5dd)",
  borderRadius: "30px",
  padding: "2rem",
  display: "grid",
  gridTemplateColumns: "185px 1fr 275px",
  gap: "2rem",
  boxShadow: "0 24px 60px var(--shadow-color, rgba(16, 24, 40, 0.12))",
};

const sidePanelStyle = {
  background: "var(--surface-secondary, #f4faf6)",
  borderRadius: "24px",
  padding: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.85rem",
};

const mainPanelStyle = {
  background: "var(--surface-primary, #dceee6)",
  borderRadius: "24px",
  padding: "1.75rem",
};

const forumPanelStyle = {
  background: "var(--surface-primary, #dceee6)",
  borderRadius: "24px",
  padding: "1.5rem",
};

const inputStyle = {
  width: "100%",
  padding: "1rem",
  borderRadius: "16px",
  border: "1px solid var(--border-color, #d0d5dd)",
  background: "var(--input-bg, #ffffff)",
  color: "var(--text-light, #101828)",
  marginBottom: "1.25rem",
  outline: "none",
  fontSize: "1rem",
};

const userRowStyle = {
  display: "grid",
  gridTemplateColumns: "54px 1fr auto",
  alignItems: "center",
  gap: "1rem",
  background: "var(--card-bg, #ffffff)",
  borderRadius: "18px",
  padding: "1rem",
  border: "1px solid var(--border-color, #e4e7ec)",
};

const avatarStyle = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  objectFit: "cover",
};

const emptyAvatarStyle = {
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  background: "var(--surface-secondary, #f4faf6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "800",
};

const nameButtonStyle = {
  background: "transparent",
  border: "none",
  color: "var(--text-light, #101828)",
  fontSize: "1rem",
  fontWeight: "700",
  cursor: "pointer",
  padding: 0,
};

const navCardStyle = {
  color: "var(--text-light, #101828)",
  textDecoration: "none",
  padding: "0.9rem 1rem",
  borderRadius: "14px",
  background: "var(--card-bg, #ffffff)",
  fontWeight: "700",
  border: "1px solid var(--border-color, #e4e7ec)",
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
};

const iconStyle = {
  fontSize: "1.1rem",
};

const forumCardStyle = {
  background: "var(--card-bg, #ffffff)",
  color: "var(--text-light, #101828)",
  padding: "1rem",
  borderRadius: "16px",
  textDecoration: "none",
  fontWeight: "700",
  border: "1px solid var(--border-color, #e4e7ec)",
};

const smallButtonStyle = {
  padding: "0.7rem 1rem",
  borderRadius: "12px",
  border: "none",
  background: "var(--primary, #1db954)",
  color: "var(--text-dark, #101828)",
  fontWeight: "700",
  cursor: "pointer",
};
