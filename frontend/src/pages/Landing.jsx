import '../styling/Landing.css'
import { useSpotify } from '../context/SpotifyContext'

export default function LandingPage() {
    const { isAuthenticated, userProfile } = useSpotify();

    const handleLogin = () => {
        window.location.href = 'http://127.0.0.1:5001/api/spotify/auth/login';
    };

    // CHANGE THIS TO GO TO THE RIGHT REACT PAGE
    // TODO: REPLACE WITH ROUTING
    if (isAuthenticated) {
        return (
            <div className="aura-container">
                <div className="aura-bg">
                    <div className="blob blob-1"></div>
                    <div className="blob blob-2"></div>
                    <div className="blob blob-3"></div>
                    <div className="blob blob-4"></div>
                </div>
                <div className="aura-content" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-almond-silk)' }}>
                    <p>Welcome back {userProfile.display_name}! You're logged in.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="aura-container">
            <div className="aura-bg">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
                <div className="blob blob-4"></div>
            </div>

            <div className="aura-content" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--color-almond-silk)' }}>
                <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10vh' }}>
                    <strong>App Name.</strong>
                </nav>

                <h1 style={{ fontSize: '4rem', fontWeight: '800', maxWidth: '700px', margin: '0 auto 1.5rem' }}>
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