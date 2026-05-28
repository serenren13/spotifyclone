import { useState, useEffect } from "react";
import axios from "axios";
import { useSpotify } from "../context/SpotifyContext";
import { API_URL } from "../lib/config";
// import '../styling/TopSongs.css';

const api = axios.create({ baseURL: API_URL });

export default function TopSongs() {
    const { accessToken } = useSpotify();
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("long_term");

    useEffect(() => {
        if (!accessToken) return;

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

    const selectTimeRange = (next) => {
        if (next === timeRange) return;
        setLoading(true);
        setTimeRange(next);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-center mb-6">Your Top Songs</h1>
                
                <div className="flex justify-center mb-10">
                    <div className="flex border border-[var(--text-primary)]/30 rounded overflow-hidden">
                        <button
                            onClick={() => selectTimeRange("long_term")}
                            className={`px-6 py-2 transition-colors ${timeRange === "long_term" ? "bg-[#1DB954] text-white" : "bg-[var(--bg-dark)] hover:bg-[var(--text-primary)]/10"}`}
                        >
                            All Time
                        </button>
                        <button
                            onClick={() => selectTimeRange("medium_term")}
                            className={`px-6 py-2 border-l border-r border-[var(--text-primary)]/30 transition-colors ${timeRange === "medium_term" ? "bg-[#1DB954] text-white" : "bg-[var(--bg-dark)] hover:bg-[var(--text-primary)]/10"}`}
                        >
                            Last Year
                        </button>
                        <button
                            onClick={() => selectTimeRange("short_term")}
                            className={`px-6 py-2 transition-colors ${timeRange === "short_term" ? "bg-[#1DB954] text-white" : "bg-[var(--bg-dark)] hover:bg-[var(--text-primary)]/10"}`}
                        >
                            Last Month
                        </button>
                    </div>
                </div>

                {loading ? (
                    <p className="text-center text-[var(--accent-secondary)]">Loading tracks...</p>
                ) : songs.length === 0 ? (
                    <div className="text-center p-10 border border-[var(--text-primary)]/20 rounded-xl bg-[var(--bg-dark)]">
                        <p className="text-xl mb-2">No top songs found for this time range.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
                        {songs.map((track, index) => (
                            <div key={track.id} className="flex items-center gap-4">
                                <span className="text-3xl font-light w-8 text-right">
                                    {index + 1}
                                </span>
                                
                                <div className="flex-1 flex border border-[var(--text-primary)]/20 bg-[var(--bg-primary)] h-24 overflow-hidden">
                                    <div className="w-24 h-full border-r border-[var(--text-primary)]/20 flex-shrink-0">
                                        <img
                                            src={track.album?.images?.[1]?.url || track.album?.images?.[0]?.url || "https://i.scdn.co/image/ab6761610000e5eb55d39ab9c21d506aa52f7021"}
                                            alt="Cover"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    
                                    <div className="flex-1 p-3 flex flex-col justify-center border-r border-[var(--text-primary)]/20 min-w-0 overflow-hidden">
                                        <p className="text-lg font-semibold truncate w-full flex items-center gap-2">
                                            {track.name}
                                            {track.explicit && <span className="text-[10px] bg-[var(--text-primary)] text-[var(--bg-primary)] px-1.5 py-0.5 rounded font-bold">E</span>}
                                        </p>
                                        <p className="text-sm text-[var(--accent-secondary)] truncate w-full">{track.artists?.map(a => a.name).join(", ")}</p>
                                    </div>
                                    
                                    <div className="w-36 p-3 flex flex-col justify-center text-sm text-[var(--accent-secondary)] flex-shrink-0 min-w-0 overflow-hidden">
                                        <p className="truncate w-full">{track.album?.name}</p>
                                        <p>Length: {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, "0")}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}