import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSpotify } from "../context/SpotifyContext";
import { API_URL } from "../lib/config";
// import '../styling/Profile.css';

const api = axios.create({ baseURL: API_URL });

export default function Profile() {
    const navigate = useNavigate();
    const { accessToken, logout } = useSpotify();

    const [profile, setProfile] = useState(null);
    const [topArtists, setTopArtists] = useState([]);
    const [topSongs, setTopSongs] = useState([]);
    const [allLikedSongs, setAllLikedSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isPrivate, setIsPrivate] = useState(false);
    const [bioText, setBioText] = useState("");
    const [savingBio, setSavingBio] = useState(false);
    const [customImageUrl, setCustomImageUrl] = useState("");

    const [favoriteSongIds, setFavoriteSongIds] = useState([]);
    const [favoriteTracksData, setFavoriteTracksData] = useState([]);
    const [isEditingFavorites, setIsEditingFavorites] = useState(false);
    const [tempSelectedFavorites, setTempSelectedFavorites] = useState([]);

    useEffect(() => {
        if (!accessToken) return;

        Promise.all([
            api.get("/spotify/user/profile", { headers: { Authorization: `Bearer ${accessToken}` } }).catch(() => ({ data: null })),
            api.get("/spotify/user/four-top-artists", { headers: { Authorization: `Bearer ${accessToken}` } }).catch(() => ({ data: { items: [] } })),
            api.get("/spotify/top-tracks", { headers: { Authorization: `Bearer ${accessToken}` } }).catch(() => ({ data: { items: [] } })),
            api.get("/spotify/user/liked-songs", { headers: { Authorization: `Bearer ${accessToken}` } }).catch(() => ({ data: { items: [] } }))
        ]).then(([profileRes, artistsRes, songsRes, likedRes]) => {
            const userData = profileRes.data;
            setProfile(userData);

            const rawArtists = artistsRes.data?.items || (Array.isArray(artistsRes.data) ? artistsRes.data : []);
            setTopArtists(rawArtists.slice(0, 4));

            const rawTopSongs = songsRes.data?.items || (Array.isArray(songsRes.data) ? songsRes.data : []);
            setTopSongs(rawTopSongs.slice(0, 4));

            const rawLiked = likedRes.data?.items || (Array.isArray(likedRes.data) ? likedRes.data : []);
            setAllLikedSongs(rawLiked);

            if (userData?.id) {
                api.get(`/users/${userData.id}`)
                    .then(firebaseRes => {
                        const fb = firebaseRes.data;
                        if (fb) {
                            setIsPrivate(fb.isPrivate || false);
                            setBioText(fb.bio || "");
                            if (fb.profileImage) setCustomImageUrl(fb.profileImage);
                            if (fb.favoriteSongs) setFavoriteSongIds(fb.favoriteSongs);
                            if (fb.favoriteTracksData) setFavoriteTracksData(fb.favoriteTracksData);

                            if (fb.topArtists?.length) setTopArtists(fb.topArtists);
                            if (fb.topTracks?.length) setTopSongs(fb.topTracks);
                        }
                    })
                    .catch(err => console.log("Firebase profile fetch issue:", err))
                    .finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });
    }, [accessToken]);

    //FIREBASE UPDATES
    const handleTogglePrivacy = async () => {
        if (!profile?.id) return;
        const newPrivacyStatus = !isPrivate;
        setIsPrivate(newPrivacyStatus);
        try {
            await api.patch(`/users/${profile.id}`, { isPrivate: newPrivacyStatus });
        } catch {
            setIsPrivate(!newPrivacyStatus);
            alert("Could not update privacy status.");
        }
    };

    const handleSaveBio = async () => {
        if (!profile?.id) return;
        setSavingBio(true);
        try {
            await api.patch(`/users/${profile.id}`, { bio: bioText });
            setTimeout(() => setSavingBio(false), 1500);
        } catch {
            setSavingBio(false);
            alert("Database error: Check backend terminal.");
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleEditProfileImage = async () => {
        if (!profile?.id) return;
        const newUrl = window.prompt("Paste a new image URL to update your profile picture:", customImageUrl);
        if (newUrl !== null && newUrl.trim() !== "") {
            setCustomImageUrl(newUrl);
            try {
                await api.patch(`/users/${profile.id}`, { profileImage: newUrl });
            } catch {
                alert("Database error: Could not save the new profile picture.");
            }
        }
    };

    //FAVORITE SONGS LOGIC
    const handleOpenFavoritesModal = () => {
        setTempSelectedFavorites([...favoriteSongIds]);
        setIsEditingFavorites(true);
    };

    const handleToggleFavoriteSelection = (trackId) => {
        if (tempSelectedFavorites.includes(trackId)) {
            setTempSelectedFavorites(tempSelectedFavorites.filter(id => id !== trackId));
        } else {
            if (tempSelectedFavorites.length < 4) {
                setTempSelectedFavorites([...tempSelectedFavorites, trackId]);
            } else {
                alert("You can only select up to 4 favorite songs.");
            }
        }
    };

    const handleSaveFavorites = async () => {
        if (!profile?.id) return;

        const updatedTracksData = allLikedSongs
            .filter(item => tempSelectedFavorites.includes(item.track?.id))
            .map(item => ({
                id: item.track?.id,
                name: item.track?.name,
                artist: item.track?.artists?.[0]?.name || null,
                albumArt: item.track?.album?.images?.[1]?.url || item.track?.album?.images?.[0]?.url || null,
            }));

        setFavoriteSongIds(tempSelectedFavorites);
        setFavoriteTracksData(updatedTracksData);
        setIsEditingFavorites(false);

        try {
            await api.patch(`/users/${profile.id}`, {
                favoriteSongs: tempSelectedFavorites,
                favoriteTracksData: updatedTracksData,
            });
        } catch {
            alert("Database error: Could not save favorite songs.");
        }
    };

    let displayFavorites = [];
    if (favoriteTracksData.length > 0) {
        displayFavorites = favoriteTracksData.slice(0, 4);
    } else if (favoriteSongIds.length > 0) {
        displayFavorites = allLikedSongs
            .filter(item => favoriteSongIds.includes(item.track?.id))
            .slice(0, 4)
            .map(item => ({
                id: item.track?.id,
                name: item.track?.name,
                artist: item.track?.artists?.map(a => a.name).join(", ") || "Unknown Artist",
                albumArt: item.track?.album?.images?.[2]?.url || item.track?.album?.images?.[0]?.url || null,
            }));
    } else {
        displayFavorites = allLikedSongs.slice(0, 4).map(item => ({
            id: item.track?.id,
            name: item.track?.name,
            artist: item.track?.artists?.map(a => a.name).join(", ") || "Unknown Artist",
            albumArt: item.track?.album?.images?.[2]?.url || item.track?.album?.images?.[0]?.url || null,
        }));
    }

    const displayImage = customImageUrl || profile?.images?.[1]?.url || profile?.images?.[0]?.url || "https://i.scdn.co/image/ab6761610000e5eb55d39ab9c21d506aa52f7021";

    if (loading) return <div className="min-h-screen bg-[var(--bg-primary)] p-8 text-[var(--accent-secondary)]">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-8 flex justify-center relative">
            <button
                onClick={handleLogout}
                className="absolute top-8 right-8 border border-[var(--text-primary)]/30 text-[var(--text-primary)] py-2 px-5 rounded-full font-medium hover:border-[#1DB954] hover:text-[#1DB954] transition-all text-sm tracking-wide bg-[var(--bg-dark)]/40 shadow-sm backdrop-blur-sm z-10"
            >
                Logout
            </button>

            {isEditingFavorites && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-primary)] p-6 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-[var(--text-primary)]/20 shadow-2xl">
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold">Pick Your Favorite Songs</h2>
                            <p className="text-[var(--accent-secondary)] text-sm">Select up to 4 tracks from your recent history ({tempSelectedFavorites.length}/4 selected)</p>
                        </div>

                        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-2">
                            {allLikedSongs.map(item => {
                                if (!item.track) return null;
                                const isSelected = tempSelectedFavorites.includes(item.track.id);
                                return (
                                    <div
                                        key={item.track.id}
                                        onClick={() => handleToggleFavoriteSelection(item.track.id)}
                                        className={`flex items-center gap-4 p-2 rounded cursor-pointer border-2 transition-colors ${isSelected ? 'border-[#1DB954] bg-[#1DB954]/10' : 'border-transparent hover:bg-[var(--bg-dark)]'}`}
                                    >
                                        <img src={item.track.album?.images?.[2]?.url || item.track.album?.images?.[0]?.url} alt="Cover" className="w-10 h-10 rounded object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.track.name}</p>
                                            <p className="text-xs text-[var(--accent-secondary)] truncate">{item.track.artists?.map(a => a.name).join(", ")}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-[var(--text-primary)]/10">
                            <button onClick={() => setIsEditingFavorites(false)} className="px-4 py-2 text-sm hover:underline">Cancel</button>
                            <button onClick={handleSaveFavorites} className="bg-[#1DB954] text-white px-6 py-2 rounded font-medium hover:bg-green-600 transition-colors">Save Selection</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-6xl w-full flex flex-col md:flex-row gap-8">

                {/* LEFT SIDEBAR */}
                <div className="w-full md:w-1/3 flex flex-col gap-6 border-r border-[var(--text-primary)]/20 pr-8">

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{isPrivate ? "🔒" : "🌎"}</span>
                            <span>Account Privacy Toggle</span>
                        </div>
                        <button
                            onClick={handleTogglePrivacy}
                            className={`w-12 h-6 rounded-full relative transition-colors ${isPrivate ? 'bg-[#1DB954]' : 'bg-gray-500'}`}
                        >
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isPrivate ? 'translate-x-6' : ''}`}></span>
                        </button>
                    </div>

                    <p className="text-center text-sm font-semibold mt-2">Current Status: {isPrivate ? "Private" : "Public"}</p>

                    <div className="flex flex-col items-center mt-4">
                        <div className="relative group cursor-pointer" onClick={handleEditProfileImage}>
                            <img src={displayImage} alt="Profile" className="w-48 h-48 rounded-full object-cover bg-[var(--bg-dark)] mb-4 border-4 border-[var(--text-primary)]/10 group-hover:opacity-80 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity mb-4">
                                <span className="text-xs text-white font-medium">Change Photo</span>
                            </div>
                        </div>
                        <h2 className="text-3xl font-medium mb-6">{profile?.display_name || "Username"}</h2>
                    </div>

                    <div className="border border-[var(--text-primary)]/30 p-3 h-auto relative bg-[var(--bg-dark)] flex flex-col">
                        <p className="text-sm font-semibold mb-2">Bio:</p>
                        <textarea
                            value={bioText}
                            onChange={(e) => setBioText(e.target.value)}
                            className="w-full h-32 bg-transparent resize-none focus:outline-none text-sm placeholder:text-[var(--accent-secondary)]"
                            placeholder="Type your bio here..."
                        ></textarea>
                        <div className="flex justify-end mt-2 border-t border-[var(--text-primary)]/10 pt-2">
                            <button
                                onClick={handleSaveBio}
                                disabled={savingBio}
                                className="text-xs bg-[#1DB954] text-white px-4 py-1.5 rounded hover:bg-green-600 transition-colors disabled:opacity-50 font-medium"
                            >
                                {savingBio ? "Saved!" : "Save Bio"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT CONTENT AREA */}
                <div className="w-full md:w-2/3 flex flex-col">
                    <div className="mb-12 border-b border-[var(--text-primary)]/20 pb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-medium">Top Artists</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {topArtists.map(artist => (
                                <div key={artist.id} className="flex flex-col items-center text-center group min-w-0">
                                    <div className="w-24 h-24 rounded-full bg-[var(--bg-dark)] mb-3 overflow-hidden border-2 border-transparent transition-all flex-shrink-0">
                                        <img
                                            src={artist.image || artist.images?.[1]?.url || artist.images?.[0]?.url || "https://via.placeholder.com/150"}
                                            alt={artist.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <p className="font-medium text-sm truncate w-full px-2">{artist.name}</p>
                                </div>
                            ))}
                            {topArtists.length === 0 && <p className="col-span-4 text-[var(--accent-secondary)] text-sm">No top artists found.</p>}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-medium">Top Songs</h3>
                            </div>
                            <div className="border border-[var(--text-primary)]/30 flex flex-col bg-[var(--bg-dark)]">
                                {topSongs.map(song => (
                                    <div key={song.id} className="flex border-b border-[var(--text-primary)]/30 last:border-0 h-16 hover:bg-[var(--text-primary)]/5 transition-colors cursor-pointer">
                                        <div className="w-16 h-full border-r border-[var(--text-primary)]/30 flex-shrink-0">
                                            <div className="w-16 h-full border-r border-[var(--text-primary)]/30 flex-shrink-0">
                                            {/* Checks for Firebase schema first, falls back to Spotify schema, then placeholder */}
                                            <img
                                                src={song.albumArt || song.album?.images?.[2]?.url || song.album?.images?.[0]?.url || "https://via.placeholder.com/150"}
                                                alt="Cover"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center px-3 min-w-0 overflow-hidden">
                                            <p className="text-sm truncate w-full font-medium">{song.name}</p>
                                            {/* Checks for Firebase artist first, falls back to raw Spotify artists array */}
                                            <p className="text-xs text-[var(--accent-secondary)] truncate">
                                                {song.artist || song.artists?.map(a => a.name).join(", ")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-medium">Favorite Songs</h3>
                            </div>
                            <div className="border border-[var(--text-primary)]/30 flex flex-col bg-[var(--bg-dark)]">
                                {displayFavorites.map(song => (
                                    <div key={song?.id} className="flex border-b border-[var(--text-primary)]/30 last:border-0 h-16 hover:bg-[var(--text-primary)]/5 transition-colors">
                                        <div className="w-16 h-full border-r border-[var(--text-primary)]/30 flex-shrink-0">
                                            {song?.albumArt ? (
                                                <img src={song.albumArt} alt="Cover" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-xs">🎵</div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center px-3 min-w-0 overflow-hidden">
                                            <p className="text-sm truncate font-medium">{song?.name || "Unknown Track"}</p>
                                            <p className="text-xs text-[var(--accent-secondary)] truncate">{song?.artist}</p>
                                        </div>
                                    </div>
                                ))}
                                {displayFavorites.length === 0 && <p className="p-4 text-center text-sm text-[var(--accent-secondary)]">No favorites selected.</p>}
                            </div>
                            <div className="text-center mt-4">
                                <button onClick={handleOpenFavoritesModal} className="text-sm text-[var(--accent-secondary)] hover:text-[#1DB954] transition-colors font-medium">Edit Selection</button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}