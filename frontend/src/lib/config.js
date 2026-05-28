// Backend URL is configurable via VITE_BACKEND_URL so the same frontend
// build can talk to a local backend (default), an ngrok tunnel, or a
// deployed backend. Set this in `.env.local`. See `.env.example`.
export const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:5001";

export const API_URL = `${BACKEND_URL}/api`;
export const SPOTIFY_API_URL = `${BACKEND_URL}/api/spotify`;
export const SPOTIFY_LOGIN_URL = `${BACKEND_URL}/api/spotify/auth/login`;
