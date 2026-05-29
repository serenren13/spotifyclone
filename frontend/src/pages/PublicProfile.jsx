import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSpotify } from "../context/SpotifyContext";
import { API_URL } from "../lib/config";

const api = axios.create({ baseURL: API_URL });

const normalizeSpotifyTrack = (track) => ({
    id: track.id,
    name: track.name,
    artist: track.artists?.map(a => a.name).join(", "),
    albumArt: track.album?.images?.[1]?.url || track.album?.images?.[0]?.url || null,
});

export default function PublicProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { accessToken, userProfile } = useSpotify();

    const [publicUser, setPublicUser] = useState(null);
    const [topArtists, setTopArtists] = useState([]);
    const [topSongs, setTopSongs] = useState([]);
    const [favoriteTracks, setFavoriteTracks] = useState([]);
    const [usingFavorites, setUsingFavorites] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (userProfile && id === userProfile.id) navigate('/profile');
    }, [userProfile, id, navigate]);

    useEffect(() => {
        if (!accessToken) return;

        api.get(`/users/${id}`)
            .then(async (res) => {
                const userData = res.data;

                if (!userData) {
                    setError("User not found in the database.");
                    setLoading(false);
                    return;
                }

                setPublicUser(userData);

                if (userData.isPrivate) {
                    setLoading(false);
                    return;
                }

                // Top artists and top songs come straight from DB
                setTopArtists(userData.topArtists || []);
                setTopSongs(userData.topTracks || []);

                // Favorite songs: use saved IDs if set, otherwise fall back to stored likedTracks
                const hasFavoriteSongs = userData.favoriteSongs?.length > 0;

                if (hasFavoriteSongs && userData.favoriteTracksData?.length > 0) {
                    // Full track data already stored — no Spotify call needed
                    setFavoriteTracks(userData.favoriteTracksData);
                    setUsingFavorites(true);
                } else {
                    // No favorites set, fall back to stored likedTracks
                    setFavoriteTracks(userData.likedTracks || []);
                    setUsingFavorites(false);
                }

                setLoading(false);
            })
            .catch(err => {
                console.error("User not found:", err);
                setError("User not found.");
                setLoading(false);
            });
    }, [id, accessToken]);

    if (loading) return <div className="min-h-screen bg-[var(--bg-primary)] p-8 text-[var(--accent-secondary)] flex justify-center items-center">Loading Profile...</div>;

    if (error) return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-8 text-center flex flex-col items-center justify-center">
            <h2 className="text-2xl text-[var(--text-primary)] mb-4">{error}</h2>
            <button onClick={() => navigate(-1)} className="text-[#1DB954] hover:underline">Go Back</button>
        </div>
    );

    if (publicUser?.isPrivate) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] p-8 flex flex-col items-center justify-center text-[var(--text-primary)]">
                <span className="text-6xl mb-4">🔒</span>
                <h2 className="text-3xl font-bold mb-2">This Account is Private</h2>
                <p className="text-[var(--accent-secondary)] mb-6">You do not have permission to view {publicUser.displayName || "this user"}'s profile.</p>
                <button onClick={() => navigate(-1)} className="bg-[var(--bg-dark)] px-6 py-2 rounded border border-[var(--text-primary)]/20 hover:bg-[var(--text-primary)]/10 transition-colors">Go Back</button>
            </div>
        );
    }

    const handleMessageUser = () => {
        if (!publicUser) return;

        navigate("/inbox", {
            state: {
                startChatWith: {
                    id: publicUser.id,
                    displayName: publicUser.displayName || "Anonymous",
                    profileImage: publicUser.profileImage || null,
                    email: publicUser.email || null
                }
            }
        });
    };

    const displayImage = publicUser?.profileImage || "https://i.scdn.co/image/ab6761610000e5eb55d39ab9c21d506aa52f7021";

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-8 flex justify-center">
            <div className="max-w-6xl w-full flex flex-col md:flex-row gap-8">

                {/* LEFT SIDEBAR — read only */}
                <div className="w-full md:w-1/3 flex flex-col gap-6 border-r border-[var(--text-primary)]/20 pr-8">
                    <div className="flex flex-col items-center mt-4">
                        <img src={displayImage} alt={`${publicUser.displayName}'s Profile`} className="w-48 h-48 rounded-full object-cover bg-[var(--bg-dark)] mb-4 border-4 border-[var(--text-primary)]/10 shadow-lg" />
                        <h2 className="text-3xl font-medium mb-6">{publicUser?.displayName || "Anonymous"}</h2>
                        <button
                            onClick={handleMessageUser}
                            className="w-full max-w-[200px] bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold py-2 px-4 rounded-full transition-colors duration-200 mt-2 shadow"
                        >
                            Message User
                        </button>
                    </div>
                    <div className="border border-[var(--text-primary)]/30 p-4 bg-[var(--bg-dark)] flex flex-col rounded-xl">
                        <p className="text-sm font-semibold mb-2 text-[#1DB954]">Bio:</p>
                        <p className="text-sm min-h-[5rem] whitespace-pre-wrap">
                            {publicUser?.bio || <span className="text-[var(--accent-secondary)] italic">No bio provided.</span>}
                        </p>
                    </div>
                </div>

                {/* RIGHT CONTENT */}
                <div className="w-full md:w-2/3 flex flex-col">

                    {/* TOP ARTISTS — from DB: { id, name, image } */}
                    <div className="mb-12 border-b border-[var(--text-primary)]/20 pb-8">
                        <h3 className="text-2xl font-medium mb-6">Top Artists</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {topArtists.map(artist => (
                                <div key={artist.id} className="flex flex-col items-center text-center min-w-0">
                                    <div className="w-24 h-24 rounded-full bg-[var(--bg-dark)] mb-3 overflow-hidden border-2 border-transparent flex-shrink-0">
                                        <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                                    </div>
                                    <p className="font-medium text-sm truncate w-full px-2">{artist.name}</p>
                                </div>
                            ))}
                            {topArtists.length === 0 && <p className="col-span-4 text-[var(--accent-secondary)] text-sm">No top artists found.</p>}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">

                        {/* TOP SONGS — from DB: { id, name, artist, albumArt } */}
                        <div className="flex-1">
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-medium">Top Songs</h3>
                            </div>
                            <div className="border border-[var(--text-primary)]/30 flex flex-col bg-[var(--bg-dark)]">
                                {topSongs.map(song => (
                                    <div key={song.id} className="flex border-b border-[var(--text-primary)]/30 last:border-0 h-16 hover:bg-[var(--text-primary)]/5 transition-colors">
                                        <div className="w-16 h-full border-r border-[var(--text-primary)]/30 flex-shrink-0">
                                            <img src={song.albumArt} alt="Cover" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center px-3 min-w-0 overflow-hidden">
                                            <p className="text-sm truncate font-medium">{song.name}</p>
                                            <p className="text-xs text-[var(--accent-secondary)] truncate">{song.artist}</p>
                                        </div>
                                    </div>
                                ))}
                                {topSongs.length === 0 && <p className="p-4 text-center text-sm text-[var(--accent-secondary)]">No top songs found.</p>}
                            </div>
                        </div>

                        {/* FAVORITE / RECENTLY LIKED SONGS */}
                        <div className="flex-1">
                            <div className="text-center mb-4 flex items-baseline justify-center gap-2">
                                <h3 className="text-xl font-medium">Current Favorites</h3>
                            </div>
                            <div className="border border-[var(--text-primary)]/30 flex flex-col bg-[var(--bg-dark)]">
                                {favoriteTracks.map(track => (
                                    <div key={track.id} className="flex border-b border-[var(--text-primary)]/30 last:border-0 h-16 hover:bg-[var(--text-primary)]/5 transition-colors">
                                        <div className="w-16 h-full border-r border-[var(--text-primary)]/30 flex-shrink-0">
                                            {track.albumArt
                                                ? <img src={track.albumArt} alt="Cover" className="w-full h-full object-cover" />
                                                : <div className="w-full h-full bg-[var(--bg-primary)]" />
                                            }
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center px-3 min-w-0 overflow-hidden">
                                            <p className="text-sm truncate font-medium">{track.name}</p>
                                            <p className="text-xs text-[var(--accent-secondary)] truncate">{track.artist}</p>
                                        </div>
                                    </div>
                                ))}
                                {favoriteTracks.length === 0 && (
                                    <div className="p-8 text-center flex flex-col items-center">
                                        <span className="text-4xl mb-3 opacity-50">🎧</span>
                                        <p className="text-sm text-[var(--accent-secondary)]">No songs to display yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}