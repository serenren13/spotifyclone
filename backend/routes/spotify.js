const express = require("express");
const SpotifyWebApi = require("spotify-web-api-node");
const router = express.Router();

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  });

// redirect to login /api/spotify/auth/login
router.get("/auth/login", (req, res) => {
  const scopes = ["user-read-private", "user-read-email", "user-top-read"];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authorizeURL);
});

// gets token and redirects back to frontend /api/spotify/auth/callback
router.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token, refresh_token, expires_in } = data.body;

    const frontendUrl = `http://127.0.0.1:5173/?access_token=${access_token}&refresh_token=${refresh_token}`;
    res.redirect(frontendUrl);
  } catch (err) {
    res.status(400).json({ error: "Authentication failed" });
  }
});

// get user profile /api/spotify/user/profile
router.get("/user/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const userSpecificApi = new SpotifyWebApi({ clientId: process.env.SPOTIFY_CLIENT_ID });
    userSpecificApi.setAccessToken(token);

    const data = await userSpecificApi.getMe();
    res.json(data.body);
  } catch (err) {
    res.status(401).json({ error: "Failed to fetch profile" });
  }
});

module.exports = router;