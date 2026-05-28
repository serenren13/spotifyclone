import { useState, useEffect } from "react";
import axios from "axios";
import { useSpotify } from "../context/SpotifyContext";
import { Link } from "react-router-dom";

const api = axios.create({ baseURL: "http://127.0.0.1:5001/api" });

export default function LikedSongs() {
    const { accessToken } = useSpotify();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedArtist, setSelectedArtist] = useState(null);
    const [sortOrder, setSortOrder] = useState('newest');

    // get unique artists from songs
    const artists = [...new Set(songs.map(item => item.track.artists[0].name))];

    // filter songs by selected artist
    const filteredSongs = selectedArtist
        ? songs.filter(item => item.track.artists[0].name === selectedArtist)
        : songs;

    const sortedSongs = sortOrder === 'oldest'
        ? [...filteredSongs].reverse()
        : filteredSongs;

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

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
            <p className="text-[var(--accent-secondary)]">Loading your liked songs...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Liked Songs</h1>
                <p className="text-[var(--accent-secondary)] mb-8">
                    {sortedSongs.length} {selectedArtist ? `songs by ${selectedArtist}` : 'songs'}
                </p>
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-[var(--accent-secondary)]">Sort by:</span>
                    <button
                        onClick={() => setSortOrder('newest')}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                            sortOrder === 'newest'
                                ? 'bg-[var(--accent-primary)] text-white'
                                : 'bg-[var(--bg-dark)] text-[var(--accent-secondary)] hover:opacity-80'
                        }`}
                    >
                        Recently Added
                    </button>
                    <button
                        onClick={() => setSortOrder('oldest')}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                            sortOrder === 'oldest'
                                ? 'bg-[var(--accent-primary)] text-white'
                                : 'bg-[var(--bg-dark)] text-[var(--accent-secondary)] hover:opacity-80'
                        }`}
                    >
                        Oldest First
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setSelectedArtist(null)}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                            !selectedArtist
                                ? 'bg-[var(--accent-primary)] text-white'
                                : 'bg-[var(--bg-dark)] text-[var(--accent-secondary)] hover:opacity-80'
                        }`}
                    >
                        All
                    </button>
                    {artists.map(artist => (
                        <button
                            key={artist}
                            onClick={() => setSelectedArtist(artist === selectedArtist ? null : artist)}
                            className={`px-3 py-1 rounded-full text-sm transition-all ${
                                selectedArtist === artist
                                    ? 'bg-[var(--accent-primary)] text-white'
                                    : 'bg-[var(--bg-dark)] text-[var(--accent-secondary)] hover:opacity-80'
                            }`}
                        >
                            {artist}
                        </button>
                    ))}
                </div>

                <div className="flex flex-col gap-2">
                    {sortedSongs.map((item, index) => (
                        <div
                            key={item.track.id}
                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--bg-dark)] transition-all cursor-pointer group border-b border-[var(--accent-secondary)]/10"
                        >
                            <span className="text-[var(--accent-secondary)] text-sm w-6 text-right group-hover:hidden">
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
                                    {item.track.artists.map((a,i) => (
                                        <span key={a.id}>
                                            <Link
                                                to={`/artist/${a.id}`}
                                                className="hover:text-[var(--accent-primary)] hover:underline"
                                            >
                                                {a.name}
                                            </Link>
                                            {i < item.track.artists.length - 1 ? ', ' : ''}
                                        </span>
                                    ))}
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