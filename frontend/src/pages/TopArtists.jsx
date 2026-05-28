import { useState, useEffect } from "react";
import axios from "axios";
import ArtistAvatar from "../components/top-artists/ArtistAvatar";
import { useSpotify } from "../context/SpotifyContext";
import "../styling/TopArtists.css"; 

const api = axios.create({ baseURL: "http://127.0.0.1:5001/api" });

const TERM_LABELS = {
  short_term: "Last 4 weeks",
  medium_term: "Last 6 months",
  long_term: "All time",
};

export default function TopArtists() {
  const { accessToken } = useSpotify();
  const [short, setShort] = useState([]);
  const [medium, setMedium] = useState([]);
  const [long, setLong] = useState([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState("short_term");

  useEffect(() => {
    if (!accessToken) return;
    api.get("/spotify/user/top-artists", {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
      .then(res => {
        setShort(res.data.short_term ?? []);
        setMedium(res.data.medium_term ?? []);
        setLong(res.data.long_term ?? []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching top artists:", err);
        setLoading(false);
      });
      {!loading && artists.length === 0 && (
        <div className="text-center mt-12">
          <p className="text-[var(--accent-secondary)]">No top artists found for this time period.</p>
          <p className="text-sm text-[var(--text-light)] mt-2">Go listen to some music on Spotify and come back!</p>
        </div>
      )}
  }, [accessToken]);

  const artists = term === "short_term" ? short : term === "medium_term" ? medium : long;
  const top = artists[0];
  const rest = artists.slice(1, 21);

  if (loading) return (
    <div className="loading-container">
      <p className="loading-text">Loading your top artists...</p>
    </div>
  );

  return (
    <div className="top-artists-container">
      <div className="header-container">
        <h1 className="header-title">Top Artists</h1>
        
        <div className="select-wrapper">
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="term-select"
          >
            {Object.entries(TERM_LABELS).map(([key, label]) => (
              <option key={key} value={key} className="term-option">
                {label}
              </option>
            ))}
          </select>
          <span className="select-arrow">▾</span>
        </div>
      </div>

      {top && (
        <div className="featured-artist">
          <p className="featured-badge">#1 this period</p>
          
          <div className="featured-avatar-ring">
            <ArtistAvatar
              artist={top}
              size={120}
            />
            <div className="featured-rank-badge">1</div>
          </div>
          
          <h2 className="featured-name">{top.name}</h2>
          <a href={top.external_urls.spotify} target="_blank" rel="noreferrer" className="spotify-link-muted">
            Listen on Spotify
          </a>
        </div>
      )}

      <div className="artists-grid">
        {rest.map((artist, i) => (
          <div key={artist.id ?? artist.name} className="artist-card">
            <div className="avatar-wrapper">
              <ArtistAvatar artist={artist} size={80} />
              <p className="rank-badge">{i + 2}</p>
            </div>

            <div className="artist-info">
              <p className="artist-name">{artist.name}</p>
              <a href={artist.external_urls.spotify} target="_blank" rel="noreferrer" className="spotify-link-grid">
                Listen on Spotify
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}