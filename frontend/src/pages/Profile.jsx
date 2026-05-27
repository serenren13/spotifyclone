import { useState, useEffect } from "react";
import axios from "axios";
import { useSpotify } from "../context/SpotifyContext";

const api = axios.create({ baseURL: "http://127.0.0.1:5001/api" });

export default function Profile() {
    const { accessToken } = useSpotify();
    
    const [profile, setProfile] = useState(null);
    const [topArtists, setTopArtists] = useState([]);
    const [topSongs, setTopSongs] = useState([]);
    const [likedSongs, setLikedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isPrivate, setIsPrivate] = useState(false);
    const [bioText, setBioText] = useState("");
    const [savingBio, setSavingBio] = useState(false);
    const [customImageUrl, setCustomImageUrl] = useState("");

    useEffect(() => {
        if (!accessToken) return;

        Promise.all([
            api.get("/spotify/user/profile", { headers: { Authorization: `Bearer ${accessToken}` } }).catch(() => ({ data: null })),
            api.get("/spotify/user/top-artists", { headers: { Authorization: `Bearer ${accessToken}` } }).catch(() => ({ data: { items: [] } })),
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
            setLikedSongs(rawLiked.slice(0, 4));
            
            if (userData?.id) {
                api.get(`/users/${userData.id}`)
                    .then(firebaseRes => {
                        if (firebaseRes.data) {
                            setIsPrivate(firebaseRes.data.isPrivate || false);
                            setBioText(firebaseRes.data.bio || "");
                            // Load custom image if they saved one!
                            if (firebaseRes.data.profileImage) {
                                setCustomImageUrl(firebaseRes.data.profileImage);
                            }
                        }
                    })
                    .catch(err => console.log("Firebase profile fetch issue:", err))
                    .finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });
    }, [accessToken]);

    const handleTogglePrivacy = async () => {
        if (!profile?.id) return;
        const newPrivacyStatus = !isPrivate;
        setIsPrivate(newPrivacyStatus);
        
        try {
            await api.patch(`/users/${profile.id}`, { isPrivate: newPrivacyStatus });
        } catch (error) {
            console.error("Failed to update privacy:", error);
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
        } catch (error) {
            console.error("Failed to save bio:", error);
            setSavingBio(false);
            alert("Database error: Check backend terminal.");
        }
    };

    // NEW: Handle Custom Profile Image
    const handleEditProfileImage = async () => {
        if (!profile?.id) return;
        
        const newUrl = window.prompt("Paste a new image URL to update your profile picture:", customImageUrl);
        
        if (newUrl !== null && newUrl.trim() !== "") {
            setCustomImageUrl(newUrl); // Update screen instantly
            try {
                await api.patch(`/users/${profile.id}`, { profileImage: newUrl });
            } catch (error) {
                console.error("Failed to save image:", error);
                alert("Database error: Could not save the new profile picture.");
            }
        }
    };

    // Determine which image to show (Custom Firebase > Spotify > Default)
    const displayImage = customImageUrl || profile?.images?.[1]?.url || profile?.images?.[0]?.url || "https://i.scdn.co/image/ab6761610000e5eb55d39ab9c21d506aa52f7021";

    if (loading) return <div className="min-h-screen bg-[var(--bg-primary)] p-8 text-[var(--accent-secondary)]">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-8 flex justify-center">
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
                    <p className="text-center text-sm font-semibold">Current Status: {isPrivate ? "Private" : "Public"}</p>

                    <div className="flex flex-col items-center mt-4">
                        <img 
                            src={displayImage} 
                            alt="Profile" 
                            className="w-48 h-48 rounded-full object-cover bg-[var(--bg-dark)] mb-4 border-4 border-[var(--text-primary)]/10"
                        />
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

                    <div className="flex flex-col items-center gap-4 text-sm mt-4">
                        <button onClick={handleEditProfileImage} className="hover:text-[#1DB954] transition-colors font-medium">Edit Profile Picture</button>
                        <button onClick={() => alert("Messaging system not built yet!")} className="hover:text-[#1DB954] transition-colors font-medium">Message User</button>
                    </div>
                </div>

                {/* RIGHT CONTENT AREA */}
                <div className="w-full md:w-2/3 flex flex-col">
                    
                    <div className="mb-12 border-b border-[var(--text-primary)]/20 pb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-medium">Top Artists</h3>
                            <button className="text-sm text-[var(--accent-secondary)] hover:text-[#1DB954] transition-colors">Edit Selection</button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                              {topArtists.map(artist => (
                                  <div key={artist.id} className="flex flex-col items-center text-center group cursor-pointer min-w-0">
                                      <div className="w-24 h-24 rounded-full bg-[var(--bg-dark)] mb-3 overflow-hidden border-2 border-transparent group-hover:border-[#1DB954] transition-all flex-shrink-0">
                                          <img 
                                              /* Bulletproof fallback chain for missing Spotify images */
                                              src={artist.images?.[1]?.url || artist.images?.[0]?.url || artist.images?.[2]?.url || "https://i.scdn.co/image/ab6761610000e5eb55d39ab9c21d506aa52f7021"} 
                                              alt={artist.name} 
                                              className="w-full h-full object-cover" 
                                          />
                                      </div>
                                      {/* Truncate ensures long band names don't stretch the grid */}
                                      <p className="font-medium text-sm group-hover:text-[#1DB954] transition-colors truncate w-full px-2">
                                          {artist.name}
                                      </p>
                                  </div>
                              ))}
                              {topArtists.length === 0 && (
                                  <p className="col-span-4 text-center text-sm text-[var(--accent-secondary)]">No top artists found.</p>
                              )}
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
                                            <img src={song.album?.images?.[2]?.url || song.album?.images?.[0]?.url} alt="Cover" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex items-center px-3 min-w-0 overflow-hidden">
                                            <p className="text-sm truncate w-full font-medium">{song.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-medium">Liked Songs</h3>
                            </div>
                            <div className="border border-[var(--text-primary)]/30 flex flex-col bg-[var(--bg-dark)]">
                                {likedSongs.map(item => {
                                    const song = item.track;
                                    return (
                                        <div key={song?.id} className="flex border-b border-[var(--text-primary)]/30 last:border-0 h-16 hover:bg-[var(--text-primary)]/5 transition-colors cursor-pointer">
                                            <div className="w-16 h-full border-r border-[var(--text-primary)]/30 flex-shrink-0">
                                                <img src={song?.album?.images?.[2]?.url || song?.album?.images?.[0]?.url} alt="Cover" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 flex items-center px-3 min-w-0 overflow-hidden">
                                                <p className="text-sm truncate w-full font-medium">{song?.name}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}