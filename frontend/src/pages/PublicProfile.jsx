import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSpotify } from "../context/SpotifyContext";

const api = axios.create({ baseURL: "http://127.0.0.1:5001/api" });

// Normalize both Spotify API tracks and stored DB tracks into one shape
const normalizeSpotifyTrack = (track) => ({
  id: track.id,
  name: track.name,
  artist: track.artists?.map(a => a.name).join(", "),
  albumArt: track.album?.images?.[1]?.url || track.album?.images?.[0]?.url || null,
});

const normalizeStoredTrack = (track) => ({
  id: track.id,
  name: track.name,
  artist: track.artist,
  albumArt: track.albumArt,
});

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { accessToken, userProfile } = useSpotify();

  const [publicUser, setPublicUser] = useState(null);
  const [displayTracks, setDisplayTracks] = useState([]);
  const [usingFavorites, setUsingFavorites] = useState(false); // for label in UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userProfile && id === userProfile.id) {
      navigate('/profile');
    }
  }, [userProfile, id, navigate]);

  useEffect(() => {
    if (!accessToken) return;

    api.get(`/users/${id}`)
      .then(async (res) => {
        const userData = res.data;
        setPublicUser(userData);

        if (userData.isPrivate) {
          setLoading(false);
          return;
        }

        const hasFavoriteSongs = userData.favoriteSongs?.length > 0;

        if (hasFavoriteSongs) {
          // User has manually curated songs — fetch full details from Spotify
          try {
            const idsString = userData.favoriteSongs.join(",");
            const trackRes = await api.get(`/spotify/tracks?ids=${idsString}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            setDisplayTracks((trackRes.data || []).map(normalizeSpotifyTrack));
            setUsingFavorites(true);
          } catch (err) {
            console.error("Failed to load favorite tracks", err);
          }
        } else if (userData.recentTracks?.length > 0) {
          // Fall back to recently played stored in DB — no Spotify call needed
          setDisplayTracks(userData.recentTracks.map(normalizeStoredTrack));
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

  if (loading) return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-8 text-[var(--accent-secondary)] flex justify-center items-center">
      Loading Profile...
    </div>
  );

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
        <p className="text-[var(--accent-secondary)] mb-6">
          You do not have permission to view {publicUser.displayName || "this user"}'s profile.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="bg-[var(--bg-dark)] px-6 py-2 rounded border border-[var(--text-primary)]/20 hover:bg-[var(--text-primary)]/10 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const displayImage = publicUser?.profileImage || "https://i.scdn.co/image/ab6761610000e5eb55d39ab9c21d506aa52f7021";

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-8 flex justify-center">
      <div className="max-w-6xl w-full flex flex-col md:flex-row gap-8">

        {/* LEFT SIDEBAR */}
        <div className="w-full md:w-1/3 flex flex-col gap-6 border-r border-[var(--text-primary)]/20 pr-8">
          <div className="flex flex-col items-center mt-4">
            <img
              src={displayImage}
              alt={`${publicUser.displayName}'s Profile`}
              className="w-48 h-48 rounded-full object-cover bg-[var(--bg-dark)] mb-4 border-4 border-[var(--text-primary)]/10 shadow-lg"
            />
            <h2 className="text-3xl font-medium mb-6">{publicUser?.displayName || "Anonymous"}</h2>
          </div>

          <div className="border border-[var(--text-primary)]/30 p-4 relative bg-[var(--bg-dark)] flex flex-col rounded-xl">
            <p className="text-sm font-semibold mb-2 text-[#1DB954]">Bio:</p>
            <p className="text-sm min-h-[5rem] whitespace-pre-wrap">
              {publicUser?.bio || <span className="text-[var(--accent-secondary)] italic">No bio provided.</span>}
            </p>
          </div>
        </div>

        {/* RIGHT CONTENT */}
        <div className="w-full md:w-2/3 flex flex-col">
          <div className="flex-1">
            <div className="border-b border-[var(--text-primary)]/20 pb-4 mb-6 flex items-baseline gap-3">
              <h3 className="text-2xl font-medium">
                {usingFavorites ? "Favorite Songs" : "Recently Played"}
              </h3>
              {!usingFavorites && displayTracks.length > 0 && (
                <span className="text-xs text-[var(--accent-secondary)]">from last session</span>
              )}
            </div>

            <div className="border border-[var(--text-primary)]/30 flex flex-col bg-[var(--bg-dark)] rounded overflow-hidden shadow-md">
              {displayTracks.map(track => (
                <div
                  key={track.id}
                  className="flex border-b border-[var(--text-primary)]/30 last:border-0 h-20 hover:bg-[var(--text-primary)]/5 transition-colors"
                >
                  <div className="w-20 h-full border-r border-[var(--text-primary)]/30 flex-shrink-0">
                    {track.albumArt
                      ? <img src={track.albumArt} alt="Cover" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-[var(--bg-primary)]" />
                    }
                  </div>
                  <div className="flex-1 flex flex-col justify-center px-4 min-w-0 overflow-hidden">
                    <p className="text-base truncate w-full font-medium">{track.name}</p>
                    <p className="text-sm text-[var(--accent-secondary)] truncate w-full">{track.artist}</p>
                  </div>
                </div>
              ))}

              {displayTracks.length === 0 && (
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
  );
}