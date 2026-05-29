import { useState, useEffect } from "react";
import axios from "axios";
import { useSpotify } from "../context/SpotifyContext";
import { API_URL } from "../lib/config";
import "../styling/TopArtists.css";

const api = axios.create({ baseURL: API_URL });

const TERM_LABELS = {
    long_term: "All time",
    medium_term: "Last year",
    short_term: "Last month",
};

const formatDuration = (ms) =>
    `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

export default function TopSongs() {
    const { accessToken } = useSpotify();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("long_term");

    useEffect(() => {
        if (!accessToken) return;
        setLoading(true);
        api.get(`/spotify/top-tracks?time_range=${timeRange}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        .then(res => {
            const rawItems = res.data?.items || (Array.isArray(res.data) ? res.data : []);
            setSongs(rawItems);
            setLoading(false);
        })
        .catch(err => {
            console.error("Error fetching top songs:", err);
            setLoading(false);
        });
    }, [accessToken, timeRange]);

    const top = songs[0];
    const rest = songs.slice(1);

    if (loading) return (
        <div className="loading-container">
            <p className="loading-text">Loading your top songs...</p>
        </div>
    );

    return (
        <div className="top-artists-container">
            <div className="header-container">
                <h1 className="header-title">Top Songs</h1>
                <div className="select-wrapper">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
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

            {songs.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--accent-secondary)', marginTop: '48px' }}>
                    No top songs found for this time range.
                </p>
            ) : (
                <>
                    {/* Featured #1 song */}
                    {top && (
                        <div className="featured-artist">
                            <p className="featured-badge">#1 this period</p>
                            <div className="featured-avatar-ring" style={{ borderRadius: '12px' }}>
                                <img
                                    src={top.album?.images?.[1]?.url || top.album?.images?.[0]?.url}
                                    alt={top.album?.name}
                                    style={{ width: '120px', height: '120px', borderRadius: '10px', display: 'block' }}
                                />
                                <div className="featured-rank-badge">1</div>
                            </div>
                            <h2 className="featured-name">
                                <a
                                    href={top.external_urls?.spotify}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: 'inherit', textDecoration: 'none' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.textDecoration = 'underline'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'inherit'; e.currentTarget.style.textDecoration = 'none'; }}
                                >
                                    {top.name}
                                </a>
                                {top.explicit && (
                                    <span style={{ fontSize: '10px', background: 'var(--accent-secondary)', color: 'var(--bg-primary)', padding: '2px 5px', borderRadius: '3px', fontWeight: 700, marginLeft: '8px', verticalAlign: 'middle' }}>E</span>
                                )}
                            </h2>
                            <p style={{ color: 'var(--accent-secondary)', fontSize: '14px', marginBottom: '4px' }}>
                                {top.artists?.map((a, i) => (
                                    <span key={a.id}>
                                        <a
                                            href={a.external_urls?.spotify}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="spotify-link-muted"
                                        >
                                            {a.name}
                                        </a>
                                        {i < top.artists.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                            </p>
                            <a
                                href={top.external_urls?.spotify}
                                target="_blank"
                                rel="noreferrer"
                                className="spotify-link-muted"
                            >
                                Listen on Spotify · {formatDuration(top.duration_ms)}
                            </a>
                        </div>
                    )}

                    {/* Rest of the songs grid */}
                    <div className="artists-grid">
                        {rest.map((track, i) => (
                            <div key={track.id} className="artist-card">
                                <div className="avatar-wrapper">
                                    <img
                                        src={track.album?.images?.[1]?.url || track.album?.images?.[0]?.url}
                                        alt={track.album?.name}
                                        style={{ width: '80px', height: '80px', borderRadius: '8px', display: 'block' }}
                                    />
                                    <p className="rank-badge">{i + 2}</p>
                                </div>
                                <div className="artist-info">
                                    <p className="artist-name">
                                        <a
                                            href={track.external_urls?.spotify}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ color: 'inherit', textDecoration: 'none' }}
                                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.textDecoration = 'underline'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'inherit'; e.currentTarget.style.textDecoration = 'none'; }}
                                        >
                                            {track.name}
                                        </a>
                                        {track.explicit && (
                                            <span style={{ fontSize: '9px', background: 'var(--accent-secondary)', color: 'var(--bg-primary)', padding: '1px 4px', borderRadius: '3px', fontWeight: 700, marginLeft: '6px', verticalAlign: 'middle' }}>E</span>
                                        )}
                                    </p>
                                    <a
                                        href={track.artists?.[0]?.external_urls?.spotify}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="spotify-link-grid"
                                    >
                                        {track.artists?.map(a => a.name).join(", ")}
                                    </a>
                                    <span className="spotify-link-grid" style={{ marginTop: '2px' }}>
                                        {formatDuration(track.duration_ms)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}