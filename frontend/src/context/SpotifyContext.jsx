import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SpotifyContext = createContext();
export const useSpotify = () => useContext(SpotifyContext);

export const SpotifyProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(() => localStorage.getItem("spotify_access_token") || "");
    const [userProfile, setUserProfile] = useState(null); // New state to hold your data

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get("access_token");

        if (tokenFromUrl) {
            setAccessToken(tokenFromUrl);
            localStorage.setItem("spotify_access_token", tokenFromUrl);
            window.history.replaceState({}, document.title, "/profile");
        }
    }, []);

    // New effect: Fetch user profile whenever the token exists
    useEffect(() => {
        if (accessToken) {
            axios.get("http://127.0.0.1:5001/api/spotify/user/profile", {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
            .then(res => {
                // We map Spotify's 'id' and 'display_name' to our needed structure
                setUserProfile({
                    id: res.data.id,
                    display_name: res.data.display_name
                });
            })
            .catch(err => console.error("Failed to fetch user in context", err));
        }
    }, [accessToken]);

    const logout = () => {
        setAccessToken("");
        setUserProfile(null);
        localStorage.removeItem("spotify_access_token");
        window.location.href = "/";
    };

    return (
        <SpotifyContext.Provider value={{ accessToken, userProfile, logout }}>
            {children}
        </SpotifyContext.Provider>
    );
};