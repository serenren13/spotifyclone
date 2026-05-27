import { createContext, useContext, useState, useEffect } from 'react';

const SpotifyContext = createContext();
export const useSpotify = () => useContext(SpotifyContext);

export const SpotifyProvider = ({ children }) => {
    // 1. Check localStorage FIRST when the app loads
    const [accessToken, setAccessToken] = useState(() => {
        return localStorage.getItem("spotify_access_token") || "";
    });

    useEffect(() => {
        // 2. Grab the token from the URL if we just logged in
        const params = new URLSearchParams(window.location.search);
        const tokenFromUrl = params.get("access_token");

        if (tokenFromUrl) {
            setAccessToken(tokenFromUrl);
            localStorage.setItem("spotify_access_token", tokenFromUrl); // Save it permanently
            
            // 3. Clean up the URL so it looks nice
            window.history.replaceState({}, document.title, "/profile");
        }
    }, []);

    // 4. Add a logout function just in case you need it later
    const logout = () => {
        setAccessToken("");
        localStorage.removeItem("spotify_access_token");
        window.location.href = "/";
    };

    return (
        <SpotifyContext.Provider value={{ accessToken, logout }}>
            {children}
        </SpotifyContext.Provider>
    );
};