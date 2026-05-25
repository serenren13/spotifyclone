import { useEffect, useState } from "react";
import { SpotifyApi, AuthorizationCodeWithPKCEStrategy } from "@spotify/web-api-ts-sdk";

const authStrategy = new AuthorizationCodeWithPKCEStrategy(
  import.meta.env.VITE_SPOTIFY_CLIENT_ID,
  import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
  ["user-read-private", "user-read-email", "user-top-read"]
);

const sdk = new SpotifyApi(authStrategy);

function SpotifyTest() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    sdk.currentUser.profile()
      .then((data) => setProfile(data))
      .catch((err) => console.log("Not authenticated yet"));
  }, []);

  const handleLogin = async () => {
    await sdk.authenticate();
  };

  const handleLogout = () => {
    sdk.logOut();
    setProfile(null);
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Spotify Simple App</h1>

      {!profile ? (
        <button onClick={() => handleLogin()} style={{ padding: "10px 20px", cursor: "pointer" }}>
          Log in with Spotify
        </button>
      ) : (
        <div>
          <button onClick={() => handleLogout()} style={{ marginBottom: "20px" }}>Log Out</button>
          <h2>Welcome, {profile.display_name}!</h2>
          <p>Email: {profile.email}</p>
          {profile.images?.[0] && (
            <img src={profile.images[0].url} alt="Profile" style={{ borderRadius: "50%", width: "120px" }} />
          )}
        </div>
      )}
    </div>
  );
}

export default SpotifyTest;