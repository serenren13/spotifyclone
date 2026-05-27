const express = require("express");
const SpotifyWebApi = require("spotify-web-api-node");
const router = express.Router();
const { saveUser } = require("../db/UsersService.js");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

// redirect to login /api/spotify/auth/login
router.get("/auth/login", (req, res) => {
  const scopes = ["user-read-private", "user-read-email", "user-top-read", "user-library-read"];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authorizeURL);
});

// gets token and redirects back to frontend /api/spotify/auth/callback
router.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token } = data.body;

    const userSpecificApi = new SpotifyWebApi({ clientId: process.env.SPOTIFY_CLIENT_ID });
    userSpecificApi.setAccessToken(access_token);

    const spotifyUser = await userSpecificApi.getMe();

    const userId = spotifyUser.body.id;
    const email = spotifyUser.body.email;
    const displayName = spotifyUser.body.display_name;
    const profileImage = spotifyUser.body.images?.[0]?.url || null;

    await saveUser(userId, {
      displayName,
      email,
      spotifyId: userId,
      profileImage,
    });

    const frontendUrl = `http://127.0.0.1:5173/?access_token=${access_token}`;
    res.redirect(frontendUrl);
  } catch (err) {
    console.error("Auth callback error:", err);
    res.status(400).json({ error: "Authentication and profile sync failed" });
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

// get user top tracks /api/spotify/top-tracks
router.get("/top-tracks", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const userSpecificApi = new SpotifyWebApi({ clientId: process.env.SPOTIFY_CLIENT_ID });
    userSpecificApi.setAccessToken(token);

    const timeRange = req.query.time_range || 'long_term';

    const data = await userSpecificApi.getMyTopTracks({ 
        time_range: timeRange, 
        limit: 10 
    });
    res.json(data.body.items);
    
  } catch (err) {
    console.error("Spotify API Error:", err);
    res.status(400).json({ error: "Failed to fetch top tracks" });
  }
});

module.exports = router;
router.get("/user/liked-songs", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided " });

  try {
    const userSpecificApi = new SpotifyWebApi({ clientId: process.env.SPOTIFY_CLIENT_ID });
    userSpecificApi.setAccessToken(token);

    const data = await userSpecificApi.getMySavedTracks({ limit: 50 });
    res.json(data.body);
  } catch (err) {
    res.status(401).json({ error: "Failed to fetch liked songs" });
  }
});

router.get("/user/top-artists", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided " });

  try {
    const userSpecificApi = new SpotifyWebApi({ clientId: process.env.SPOTIFY_CLIENT_ID });
    userSpecificApi.setAccessToken(token);

    const [shortTermRes, mediumTermRes, longTermRes] = await Promise.all([
      userSpecificApi.getMyTopArtists({ time_range: 'short_term', limit: 21 }),
      userSpecificApi.getMyTopArtists({ time_range: 'medium_term', limit: 21 }),
      userSpecificApi.getMyTopArtists({ time_range: 'long_term', limit: 21 })
    ]);

    res.json({
      short_term: shortTermRes.body.items,
      medium_term: mediumTermRes.body.items,
      long_term: longTermRes.body.items
    });
  } catch (err) {
    res.status(401).json({ error: "Failed to fetch liked songs" });
  }
});

router.get("/user/top-artists", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    const userSpecificApi = new SpotifyWebApi({ clientId: process.env.SPOTIFY_CLIENT_ID });
    userSpecificApi.setAccessToken(token);
    const data = await userSpecificApi.getMyTopArtists({ limit: 4 });
    res.json(data.body);
  } catch (err) {
    res.status(401).json({ error: "Failed to fetch artists" });
  }
});

module.exports = router;

