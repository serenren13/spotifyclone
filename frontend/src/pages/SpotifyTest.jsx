import { useEffect, useState } from "react";
import axios from "axios";
import { SPOTIFY_API_URL, SPOTIFY_LOGIN_URL } from "../lib/config";

const backendAPI = axios.create({
    baseURL: SPOTIFY_API_URL,
});

function SpotifyTest() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem("spotify_access_token");
        setProfile(null);
    };

    useEffect(() => {
        const fetchProfile = async (accessToken) => {
            try {
                const response = await backendAPI.get("/user/profile", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                setProfile(response.data);
            } catch (err) {
                console.error("Error fetching profile from backend:", err);
                handleLogout();
            } finally {
                setLoading(false);
            }
        };

        const initializeAuth = async () => {
            const storedToken = localStorage.getItem("spotify_access_token");

            const urlParams = new URLSearchParams(window.location.search);
            const urlToken = urlParams.get("access_token");

            let activeToken = storedToken;

            if (urlToken) {
                localStorage.setItem("spotify_access_token", urlToken);
                activeToken = urlToken;
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            if (activeToken) {
                await fetchProfile(activeToken);
            } else {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const handleLogin = () => {
        window.location.href = SPOTIFY_LOGIN_URL;
    };

    if (loading) return <div style={{ padding: "2rem" }}>Loading App...</div>;

    return (
        <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
            <h1>Spotify App Hub</h1>

            {!profile ? (
                <button onClick={handleLogin}>
                    Log in with Spotify
                </button>
            ) : (
                <div>
                    <button onClick={handleLogout}>Log Out</button>
                    <h2>Welcome, {profile.display_name}!</h2>
                    <p>Email: {profile.email}</p>

                    {profile.images?.[0] && (
                        <img
                            src={profile.images[0].url}
                            alt="Profile"
                            style={{ borderRadius: "50%", width: "120px" }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

export default SpotifyTest;