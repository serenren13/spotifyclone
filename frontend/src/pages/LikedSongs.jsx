import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useSpotify } from "../context/SpotifyContext";
import { API_URL } from "../lib/config";
import "../styling/TopArtists.css";

const api = axios.create({ baseURL: API_URL });

const DECADES = ["All", "70s", "80s", "90s", "00s", "10s", "20s"];

const getDecade = (releaseDate) => {
    if (!releaseDate) return null;
    const year = parseInt(releaseDate.slice(0, 4));
    if (year < 1980) return "70s";
    if (year < 1990) return "80s";
    if (year < 2000) return "90s";
    if (year < 2010) return "00s";
    if (year < 2020) return "10s";
    return "20s";
};

const formatDuration = (ms) =>
    `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

// Hook to detect mobile viewport
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);
    return isMobile;
};

export default function LikedSongs() {
    const { accessToken } = useSpotify();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [selectedDecade, setSelectedDecade] = useState('All');
    const isMobile = useIsMobile();

    useEffect(() => {
        if (!accessToken) return;
        api.get("/spotify/user/liked-songs", {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        .then(res => {
            setSongs(res.data.items);
            setLoading(false);
        })
        .catch(err => {
            console.error("Error fetching liked songs:", err);
            setLoading(false);
        });
    }, [accessToken]);

    const filteredSongs = useMemo(() => {
        let result = songs;

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                item.track.name.toLowerCase().includes(q) ||
                item.track.artists.some(a => a.name.toLowerCase().includes(q))
            );
        }

        if (selectedDecade !== 'All') {
            result = result.filter(item =>
                getDecade(item.track.album.release_date) === selectedDecade
            );
        }

        if (sortOrder === 'oldest') {
            result = [...result].reverse();
        }

        return result;
    }, [songs, searchQuery, selectedDecade, sortOrder]);

    if (loading) return (
        <div className="loading-container">
            <p className="loading-text">Loading your liked songs...</p>
        </div>
    );

    return (
        <div className="top-artists-container">
            {/* Header */}
            <div className="header-container" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 className="header-title">Liked Songs</h1>
                    <p style={{ color: 'var(--accent-secondary)', fontSize: '13px', marginTop: '4px' }}>
                        {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'}
                        {searchQuery || selectedDecade !== 'All' ? ' matching filters' : ' · most recent 300'}
                    </p>
                </div>

                <div className="select-wrapper">
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="term-select"
                    >
                        <option value="newest" className="term-option">Recently Added</option>
                        <option value="oldest" className="term-option">Oldest First</option>
                    </select>
                    <span className="select-arrow">▾</span>
                </div>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '16px' }}>
                <input
                    type="text"
                    placeholder="🔍 Search by song or artist..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        background: 'var(--bg-dark, rgba(255,255,255,0.06))',
                        border: '1px solid var(--accent-secondary, #6b6580)',
                        borderRadius: '20px',
                        padding: '10px 18px',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                    }}
                />
            </div>

            {/* Decade filter */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {DECADES.map(decade => (
                    <button
                        key={decade}
                        onClick={() => setSelectedDecade(decade)}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            background: selectedDecade === decade ? 'var(--accent-primary)' : 'var(--bg-surface, rgba(255,255,255,0.06))',
                            color: selectedDecade === decade ? 'var(--text-on-brand, #fff)' : 'var(--accent-secondary)',
                            fontWeight: selectedDecade === decade ? '600' : '400',
                        }}
                    >
                        {decade}
                    </button>
                ))}
            </div>

            {/* Song list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {filteredSongs.length === 0 && (
                    <p style={{ color: 'var(--accent-secondary)', textAlign: 'center', marginTop: '48px' }}>
                        No songs match your filters.
                    </p>
                )}
                {filteredSongs.map((item, index) => (
                    <div
                        key={item.track.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? '10px' : '16px',
                            padding: isMobile ? '10px 8px' : '10px 12px',
                            borderRadius: '10px',
                            borderBottom: '1px solid rgba(var(--accent-secondary-rgb, 107,101,128), 0.15)',
                            transition: 'background 0.15s',
                            cursor: 'default',
                            // Prevent any horizontal overflow
                            minWidth: 0,
                            overflow: 'hidden',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-dark, rgba(255,255,255,0.04))'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        {/* Index number — hidden on mobile to save space */}
                        {!isMobile && (
                            <span style={{ color: 'var(--accent-secondary)', fontSize: '12px', width: '24px', textAlign: 'right', flexShrink: 0 }}>
                                {index + 1}
                            </span>
                        )}

                        {/* Album art */}
                        <img
                            src={item.track.album.images[2]?.url}
                            alt={item.track.album.name}
                            style={{
                                width: isMobile ? '36px' : '40px',
                                height: isMobile ? '36px' : '40px',
                                borderRadius: '6px',
                                flexShrink: 0,
                            }}
                        />

                        {/* Track name + artists — takes remaining space */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <a
                                href={item.track.external_urls.spotify}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: 'block',
                                    fontWeight: '500',
                                    fontSize: isMobile ? '13px' : '14px',
                                    color: 'var(--text-primary)',
                                    textDecoration: 'none',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.textDecoration = 'underline'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.textDecoration = 'none'; }}
                            >
                                {item.track.name}
                            </a>
                            <p style={{ fontSize: '12px', color: 'var(--accent-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.track.artists.map((a, i) => (
                                    <span key={a.id}>
                                        <a
                                            href={a.external_urls?.spotify}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ color: 'var(--accent-secondary)', textDecoration: 'none' }}
                                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.textDecoration = 'underline'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--accent-secondary)'; e.currentTarget.style.textDecoration = 'none'; }}
                                        >
                                            {a.name}
                                        </a>
                                        {i < item.track.artists.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                            </p>
                        </div>

                        {/* Album name — desktop only */}
                        {!isMobile && (
                            <p style={{ fontSize: '12px', color: 'var(--accent-secondary)', flexShrink: 0, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.track.album.name}
                            </p>
                        )}

                        {/* Decade badge — desktop only */}
                        {!isMobile && (
                            <span style={{ fontSize: '11px', color: 'var(--accent-secondary)', flexShrink: 0, background: 'var(--bg-surface, rgba(255,255,255,0.06))', padding: '2px 7px', borderRadius: '10px' }}>
                                {getDecade(item.track.album.release_date)}
                            </span>
                        )}

                        {/* Duration */}
                        <p style={{ fontSize: '12px', color: 'var(--accent-secondary)', flexShrink: 0, width: '40px', textAlign: 'right' }}>
                            {formatDuration(item.track.duration_ms)}
                        </p>

                        {/* Date added — desktop only */}
                        {!isMobile && (
                            <p style={{ fontSize: '11px', color: 'var(--accent-secondary)', flexShrink: 0, width: '88px', textAlign: 'right' }}>
                                {new Date(item.added_at).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric'
                                })}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}