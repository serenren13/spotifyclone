import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useSpotify } from "../context/SpotifyContext";
import { API_URL } from "../lib/config";

const api = axios.create({ baseURL: API_URL });

const POLL_INTERVAL_MS = 8000;   // re-fetch from Spotify every 8s
const TICK_INTERVAL_MS = 500;    // local progress tick every 500ms

const formatTime = (ms) => {
  if (!ms && ms !== 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  return `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, "0")}`;
};

export default function NowPlayingBar() {
  const { accessToken } = useSpotify();

  const [track, setTrack]           = useState(null);   // null = nothing playing → bar hidden
  const [isPlaying, setIsPlaying]   = useState(false);
  const [progressMs, setProgressMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [visible, setVisible]       = useState(false);  // drives CSS slide-in/out

  const tickRef    = useRef(null);
  const pollRef    = useRef(null);
  const lastFetchRef = useRef(0);

  const fetchNowPlaying = useCallback(async () => {
    if (!accessToken) return;
    try {
      const res = await api.get("/spotify/user/currently-playing", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // 204 = nothing playing
      if (res.status === 204 || !res.data) {
        setTrack(null);
        setVisible(false);
        return;
      }

      const { track: t, is_playing, progress_ms } = res.data;
      lastFetchRef.current = Date.now();

      setTrack(t);
      setIsPlaying(is_playing);
      setProgressMs(progress_ms);
      setDurationMs(t.duration_ms);
      setVisible(true);
    } catch (err) {
      // 401 = token expired, 204 swallowed by axios interceptor → treat both as nothing playing
      if (err.response?.status === 401 || err.response?.status === 204) {
        setTrack(null);
        setVisible(false);
      }
    }
  }, [accessToken]);

  // poll Spotify every 8 seconds
  useEffect(() => {
    if (!accessToken) return;
    fetchNowPlaying();
    pollRef.current = setInterval(fetchNowPlaying, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [accessToken, fetchNowPlaying]);

  // local progress ticker — increments every 500ms when playing
  // avoids the progress bar looking frozen between polls
  useEffect(() => {
    clearInterval(tickRef.current);
    if (!isPlaying) return;

    tickRef.current = setInterval(() => {
      setProgressMs(prev => {
        const next = prev + TICK_INTERVAL_MS;
        // don't tick past duration — next poll will correct the state
        return next >= durationMs ? durationMs : next;
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(tickRef.current);
  }, [isPlaying, durationMs]);

  if (!track) return null;

  const progressPct = durationMs > 0 ? (progressMs / durationMs) * 100 : 0;

  return (
    <>
      {/* ─── Mobile bar ────────────────────────────────────────────────
          Sits above the bottom nav (bottom: 64px to clear the 4rem nav).
          Hidden on md+ via Tailwind. */}
      <div
        className={`
          fixed left-3 right-3 z-50 md:hidden
          transition-all duration-300 ease-in-out
          ${visible ? "bottom-[68px] opacity-100" : "-bottom-24 opacity-0"}
        `}
        style={{
          background: "var(--bg-surface, rgba(255,255,255,0.95))",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--accent-secondary, rgba(107,101,128,0.3))",
          borderRadius: "14px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
        }}
      >
        {/* progress line along bottom edge */}
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "3px",
          background: "var(--accent-secondary, rgba(107,101,128,0.2))",
          borderRadius: "0 0 14px 14px",
          overflow: "hidden",
        }}>
          <div style={{
            width: `${progressPct}%`,
            height: "100%",
            background: "var(--accent-primary, #7f77dd)",
            transition: "width 0.5s linear",
          }} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px 14px" }}>
          {/* album art */}
          {track.album.image && (
            <img
              src={track.album.image}
              alt={track.album.name}
              style={{ width: "38px", height: "38px", borderRadius: "8px", flexShrink: 0 }}
            />
          )}

          {/* track info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <a
              href={track.spotify_url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "500",
                color: "var(--text-primary)",
                textDecoration: "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {track.name}
            </a>
            <p style={{
              fontSize: "11px",
              color: "var(--accent-secondary)",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {track.artists.map(a => a.name).join(", ")}
            </p>
          </div>

          {/* play state indicator — just a pause/play icon, no actual control */}
          <div style={{
            flexShrink: 0,
            width: "28px",
            height: "28px",
            borderRadius: "50%",
            border: "1px solid var(--accent-secondary, rgba(107,101,128,0.4))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            {isPlaying ? (
              /* pause bars */
              <svg width="11" height="11" viewBox="0 0 11 11" fill="var(--text-primary)">
                <rect x="1" y="1" width="3" height="9" rx="1" />
                <rect x="7" y="1" width="3" height="9" rx="1" />
              </svg>
            ) : (
              /* play triangle */
              <svg width="11" height="11" viewBox="0 0 11 11" fill="var(--text-primary)">
                <polygon points="2,1 10,5.5 2,10" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* ─── Desktop bar ───────────────────────────────────────────────
          Pinned to the bottom of the viewport, left offset matches
          the collapsed sidebar width (64px = 4rem = md:pl-16).
          Hidden on mobile via Tailwind. */}
      <div
        className={`
          hidden md:flex
          fixed bottom-0 right-0 z-50
          transition-all duration-300 ease-in-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"}
        `}
        style={{
          left: "64px", // matches collapsed sidebar width
          height: "72px",
          background: "var(--bg-surface, rgba(255,255,255,0.97))",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: "1px solid var(--accent-secondary, rgba(107,101,128,0.2))",
          alignItems: "center",
          padding: "0 24px",
          gap: "20px",
        }}
      >
        {/* thin progress line along the very top edge */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "2px",
          background: "var(--accent-secondary, rgba(107,101,128,0.15))",
          overflow: "hidden",
        }}>
          <div style={{
            width: `${progressPct}%`,
            height: "100%",
            background: "var(--accent-primary, #7f77dd)",
            transition: "width 0.5s linear",
          }} />
        </div>

        {/* left: album art + track info */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "220px", flexShrink: 0 }}>
          {track.album.image && (
            <img
              src={track.album.image}
              alt={track.album.name}
              style={{ width: "44px", height: "44px", borderRadius: "8px", flexShrink: 0 }}
            />
          )}
          <div style={{ minWidth: 0 }}>
            <a
              href={track.spotify_url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "500",
                color: "var(--text-primary)",
                textDecoration: "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { e.currentTarget.style.textDecoration = "underline"; }}
              onMouseLeave={e => { e.currentTarget.style.textDecoration = "none"; }}
            >
              {track.name}
            </a>
            <p style={{
              fontSize: "12px",
              color: "var(--accent-secondary)",
              margin: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {track.artists.map(a => a.name).join(", ")}
            </p>
          </div>
        </div>

        {/* center: timestamps + progress scrubber */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <span style={{ fontSize: "11px", color: "var(--accent-secondary)", flexShrink: 0 }}>
            {formatTime(progressMs)}
          </span>

          {/* scrubber track — display only, not interactive (no playback SDK) */}
          <div style={{
            flex: 1,
            height: "4px",
            background: "var(--accent-secondary, rgba(107,101,128,0.2))",
            borderRadius: "2px",
            overflow: "hidden",
            cursor: "default",
          }}>
            <div style={{
              width: `${progressPct}%`,
              height: "100%",
              background: "var(--accent-primary, #7f77dd)",
              transition: "width 0.5s linear",
            }} />
          </div>

          <span style={{ fontSize: "11px", color: "var(--accent-secondary)", flexShrink: 0 }}>
            {formatTime(durationMs)}
          </span>
        </div>

        {/* right: now playing label + play state dot */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
          {isPlaying && (
            <span style={{
              fontSize: "11px",
              color: "var(--accent-primary, #7f77dd)",
              fontWeight: "500",
              letterSpacing: "0.04em",
            }}>
              now playing
            </span>
          )}
          {!isPlaying && (
            <span style={{
              fontSize: "11px",
              color: "var(--accent-secondary)",
            }}>
              paused
            </span>
          )}
          <div style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: isPlaying ? "var(--accent-primary, #7f77dd)" : "var(--accent-secondary)",
            opacity: isPlaying ? 1 : 0.5,
          }} />
        </div>
      </div>

      {/* Desktop spacer — pushes page content up so nothing hides behind the bar */}
      <div className="hidden md:block" style={{ height: "72px" }} />
    </>
  );
}