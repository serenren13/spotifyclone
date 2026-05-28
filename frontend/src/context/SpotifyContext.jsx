import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const SpotifyContext = createContext();

const backendAPI = axios.create({
  baseURL: "http://127.0.0.1:5001/api/spotify",
});

export function SpotifyProvider({ children }) {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem("spotify_access_token") || null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = () => {
    localStorage.removeItem("spotify_access_token");
    setAccessToken(null);
    setUserProfile(null);
    setIsAuthenticated(false);
  };

  const fetchProfile = async (token) => {
    try {
      const response = await backendAPI.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserProfile(response.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Error fetching profile from backend:", err);
      logout();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('access_token');

      if (urlToken) {
        localStorage.setItem("spotify_access_token", urlToken);
        setAccessToken(urlToken);
        
        window.history.pushState({}, null, "/");
        
        await fetchProfile(urlToken);
      } else if (accessToken) {
        await fetchProfile(accessToken);
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Automatically turn off loading once userProfile is set successfully
  useEffect(() => {
    if (userProfile) {
      setLoading(false);
    }
  }, [userProfile]);

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