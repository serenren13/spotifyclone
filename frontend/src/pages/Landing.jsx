import '../styling/Landing.css'
import { useSpotify } from '../context/SpotifyContext'
import { Navigate } from "react-router-dom";

export default function LandingPage() {
    const { isAuthenticated } = useSpotify();

    const handleLogin = () => {
        window.location.href = 'http://localhost:5001/api/spotify/auth/login';
    };

    if (isAuthenticated) {
        return <Navigate to="/discover" replace={true} />;
    }

    return (
        <div className="aura-container">
            <div className="aura-bg">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
                <div className="blob blob-4"></div>
            </div>

            <div className="aura-content" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-light)' }}>
                <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10vh' }}>
                    <strong style={{ color:'#ffffff' }}>App Name.</strong>
                </nav>

                <h1 style={{ fontSize: '4rem', fontWeight: '800', maxWidth: '700px', margin: '0 auto 1.5rem', color:'#ffffff' }}>
                    A new way to connect.
                </h1>
                <button className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}
                onClick={handleLogin}>
                    Login with Spotify
                </button>
            </div>
        </div>
    );
}