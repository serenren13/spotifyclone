import { useSpotify } from "../context/SpotifyContext";
import { SPOTIFY_LOGIN_URL } from "../lib/config";

export default function SpotifyTest() {
    const { userProfile, logout } = useSpotify();

    return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>Spotify App Hub</h1>
            {!userProfile ? (
                <button onClick={() => { window.location.href = SPOTIFY_LOGIN_URL; }}>
                    Log in with Spotify
                </button>
            ) : (
                <div>
                    <button onClick={logout}>Log Out</button>
                    <h2>Welcome, {userProfile.display_name}!</h2>
                    <p>Email: {userProfile.email}</p>
                    {userProfile.images?.[0] && (
                        <img
                            src={userProfile.images[0].url}
                            alt="Profile"
                            style={{ borderRadius: "50%", width: "120px" }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
