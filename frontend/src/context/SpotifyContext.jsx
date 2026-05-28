import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { SPOTIFY_API_URL } from '../lib/config';

const SpotifyContext = createContext();

const backendAPI = axios.create({
  baseURL: SPOTIFY_API_URL,
});

const STORAGE_KEY = "spotify_access_token";

export function SpotifyProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAccessToken(null);
    setUserProfile(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const fetchProfile = async (token) => {
      try {
        const response = await backendAPI.get("/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserProfile(response.data);
        setIsAuthenticated(true);
        return true;
      } catch (err) {
        console.error("Error fetching profile from backend:", err);
        logout();
        return false;
      }
    };

    const initializeAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('access_token');
      const storedToken = localStorage.getItem(STORAGE_KEY);

      const activeToken = urlToken ?? storedToken;

      if (urlToken) {
        localStorage.setItem(STORAGE_KEY, urlToken);
        // strip the access_token query param from the URL so it doesn't linger / leak via referrers
        const url = new URL(window.location.href);
        url.searchParams.delete('access_token');
        window.history.replaceState({}, document.title, url.pathname + url.search + url.hash);
      }

      if (activeToken) {
        setAccessToken(activeToken);
        await fetchProfile(activeToken);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  return (
    <SpotifyContext.Provider value={{
      accessToken,
      userProfile,
      isAuthenticated,
      loading,
      logout
    }}>
      {!loading && children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (!context) {
    throw new Error('useSpotify must be used within SpotifyProvider');
  }
  return context;
}
