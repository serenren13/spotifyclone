import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../lib/config";
import "../styling/Discover.css";
import { useSpotify } from "../context/SpotifyContext";

export default function Discover() {
  const { userProfile } = useSpotify();
  const [users, setUsers] = useState([]);
  const [forums, setForums] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState("Loading discover page...");

  useEffect(() => {
    async function fetchData() {
      try {
        const usersResponse = await fetch(`${API_URL}/users/discover`);
        const usersData = await usersResponse.json();

        const forumsResponse = await fetch(`${API_URL}/forums`);
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
    // Hide the logged-in user from the Discover list
    if (userProfile?.id && user.id === userProfile.id) {
      return false;
    }

    const name = user.displayName || user.name || user.username || "";
    const bio = user.bio || "";

    return (
      name.toLowerCase().includes(searchText.toLowerCase()) ||
      bio.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  return (
    <div className="discover-page">
      <div className="discover-container">
        <div className="discover-header">
          <h1 className="discover-title">
            <strong>Discover</strong>
          </h1>
          <p className="discover-subtitle">
            Explore <strong>public profiles</strong>, discover new music tastes,
            and jump into <strong>featured forums</strong>.
          </p>
        </div>

        <div className="discover-layout">
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
        </div>
      </div>
    </div>
  );
}