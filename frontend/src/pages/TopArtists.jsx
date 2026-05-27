import { useState, useEffect } from "react";
import axios from "axios";
import ArtistAvatar from "../components/top-artists/ArtistAvatar";
import { useSpotify } from "../context/SpotifyContext";
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
  }, [accessToken]);

  const artists = term === "short_term" ? short : term === "medium_term" ? medium : long;
  const top = artists[0];
  const rest = artists.slice(1, 21); // Grabs exactly the next 18 artists (indexes 1 to 18)

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
      <p className="text-[var(--accent-secondary)]">Loading your top artists...</p>
    </div>
  );

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-primary)",
          padding: "28px 24px 60px",
          color: "var(--text-primary)",
          transition: "background-color 0.3s ease, color 0.3s ease",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1 }}>
              Top Artists
            </h1>

          {/* Dropdown */}
          <div style={{ position: "relative" }}>
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              style={{
                background: "var(--bg-surface, rgba(255,255,255,0.06))",
                border: "1px solid var(--brand-color)",
                color: "var(--text-primary)",
                fontSize: 13,
                padding: "8px 36px 8px 14px",
                borderRadius: 20,
                outline: "none",
                cursor: "pointer",
                appearance: "none",
                WebkitAppearance: "none",
              }}
            >
              {Object.entries(TERM_LABELS).map(([key, label]) => (
                <option key={key} value={key} style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
                  {label}
                </option>
              ))}
            </select>
            <span
              style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                pointerEvents: "none", color: "var(--brand-color)", fontSize: 10,
              }}
            >
              ▾
            </span>
          </div>
        </div>

        {/* Top Artist */}
        {top && (
          <div
            style={{
              textAlign: "center",
              marginBottom: 36,
              padding: "8px 0 28px",
              borderBottom: "1px solid var(--brand-color)",
            }}
          >
            <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent-primary)", marginBottom: 16 }}>
              #1 this period
            </p>
            <div style={{ display: "inline-block", position: "relative", marginBottom: 16 }}>
              <ArtistAvatar
                artist={top}
                size={120}
                style={{
                  boxShadow: `0 0 0 3px var(--bg-primary), 0 0 0 5px var(--brand-color), 0 12px 40px rgba(0,0,0,0.15)`,
                }}
              />
              <div
                style={{
                  position: "absolute", bottom: 0, right: 0,
                  background: "var(--brand-color)", color: "var(--text-on-brand)",
                  width: 24, height: 24, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 600, border: "2px solid var(--bg-primary)",
                }}
              >
                1
              </div>
            </div>
            <h2
              style={{
                fontSize: 28, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6,
              }}
            >
              {top.name}
            </h2>
            <a href={top.external_urls.spotify} target="_blank" style={{ fontSize: 12, color: "var(--text-muted, #6b6580)", textTransform: "capitalize", letterSpacing: "0.04em" }}>
              Listen on Spotify
            </a>
          </div>
        )}

        <div className="grid grid-cols-4 grid-rows-5 gap-10">
          {rest.map((artist, i) => (
            <div
              key={artist.id ?? artist.name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: 8,
                padding: "16px 12px",
                borderRadius: 12,
                cursor: "default",
                transition: "background 0.15s, transform 0.15s",
                border: "1px solid transparent"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--brand-color)10";
                e.currentTarget.style.borderColor = "var(--brand-color)30";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              <div style={{ position: "relative" }}>
                <ArtistAvatar artist={artist} size={80} />
                <p style={{
                  position: "absolute",
                  top: -1,
                  left: -1,
                  fontSize: 10,
                  color: "var(--text-on-brand)",
                  background: "var(--brand-color)",
                  fontWeight: 600,
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {i + 2}
                </p>
              </div>

              <div style={{ width: "100%", minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {artist.name}
                </p>
                <a href={artist.external_urls.spotify} target="_blank" style={{ fontSize: 11, color: "var(--text-muted, #5a5272)", textTransform: "capitalize", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Listen on Spotify
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}