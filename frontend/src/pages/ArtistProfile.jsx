import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSpotify } from "../context/SpotifyContext";
import axios from "axios";
import { API_URL } from "../lib/config";

const api = axios.create({ baseURL: API_URL });

export default function ArtistProfile() {
    const { artistId } = useParams();
    const { accessToken } = useSpotify();
    const [artistSongs, setArtistSongs] = useState([]);
    const [artistInfo, setArtistInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!accessToken) return;
        api.get("/spotify/user/liked-songs", {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        .then(res => {
            const filtered = res.data.items.filter(
                item => item.track.artists.some(a => a.id === artistId)
            );
            if (filtered.length > 0) {
                const artist = filtered[0].track.artists.find(a => a.id === artistId);
                setArtistInfo(artist);
            }
            setArtistSongs(filtered);
            setLoading(false);
        })
        .catch(err => {
            console.error("Error:", err);
            setLoading(false);
        });
    }, [accessToken, artistId]);

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
            <p className="text-[var(--accent-secondary)]">Loading...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-8">
            <div className="max-w-4xl mx-auto">
                <Link to="/liked-songs" className="text-[var(--accent-primary)] hover:opacity-80 mb-6 block">
                    ← Back to Liked Songs
                </Link>
                <h1 className="text-3xl font-bold mb-2">{artistInfo?.name || 'Artist'}</h1>
                <p className="text-[var(--accent-secondary)] mb-8">{artistSongs.length} liked songs</p>

                <div className="flex flex-col gap-2">
                    {artistSongs.map((item, index) => (
                        <div
                            key={item.track.id}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--bg-dark)] transition-all border-b border-[var(--accent-secondary)]/10"
                        >
                            <span className="text-[var(--accent-secondary)] text-sm w-6 text-right">
                                {index + 1}
                            </span>
                            <img
                                src={item.track.album.images[2]?.url}
                                alt={item.track.album.name}
                                className="w-10 h-10 rounded"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{item.track.name}</p>
                                <p className="text-sm text-[var(--accent-secondary)] truncate">
                                    {item.track.artists.map(a => a.name).join(", ")}
                                </p>
                            </div>
                            <p className="text-sm text-[var(--accent-secondary)] hidden md:block truncate max-w-[200px]">
                                {item.track.album.name}
                            </p>
                            <p className="text-sm text-[var(--accent-secondary)] w-12 text-right">
                                {Math.floor(item.track.duration_ms / 60000)}:{String(Math.floor((item.track.duration_ms % 60000) / 1000)).padStart(2, "0")}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}