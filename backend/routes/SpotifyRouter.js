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
  const scopes = [
    'user-read-email',
    'user-read-private',
    'user-top-read',
    'user-library-read',
  ];
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

    // Fetch everything in parallel
    const [spotifyUser, topArtistsRes, topTracksRes, likedRes] = await Promise.all([
      userSpecificApi.getMe(),
      userSpecificApi.getMyTopArtists({ limit: 4, time_range: 'long_term' }),
      userSpecificApi.getMyTopTracks({ limit: 4, time_range: 'long_term' }),
      userSpecificApi.getMySavedTracks({ limit: 4 }),
    ]);

    const userId = spotifyUser.body.id;

    // Slim down to only what you need stored
    const topArtists = topArtistsRes.body.items.map(a => ({
      id: a.id,
      name: a.name,
      image: a.images?.[0]?.url || null,
    }));

    const topTracks = topTracksRes.body.items.map(t => ({
      id: t.id,
      name: t.name,
      artist: t.artists[0]?.name || null,
      albumArt: t.album.images?.[0]?.url || null,
    }));

    const likedTracks = likedRes.body.items.map(({ track }) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name || null,
      albumArt: track.album.images?.[0]?.url || null,
    }));

    await saveUser(userId, {
      displayName: spotifyUser.body.display_name,
      email: spotifyUser.body.email,
      spotifyId: userId,
      profileImage: spotifyUser.body.images?.[0]?.url || null,
      topArtists,
      topTracks,
      likedTracks,
    });

    res.redirect(`http://127.0.0.1:5173/?access_token=${access_token}`);
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

// get user top artists /api/spotify/user/top-artists
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

router.get("/user/four-top-artists", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided " });

  try {
    const userSpecificApi = new SpotifyWebApi({ clientId: process.env.SPOTIFY_CLIENT_ID });
    userSpecificApi.setAccessToken(token);

    const data = await userSpecificApi.getMyTopArtists({ time_range: 'long_term', limit: 4 });

    res.json(data.body);
  } catch (err) {
    res.status(401).json({ error: "Failed to fetch liked songs" });
  }
});

// get specific tracks by ID /api/spotify/tracks?ids=123,456
router.get("/tracks", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  const trackIds = req.query.ids;
  console.log("Track IDs received:", trackIds); // 👈 add this
  if (!trackIds) return res.status(400).json({ error: "No track IDs provided" });

  try {
    const userSpecificApi = new SpotifyWebApi({ clientId: process.env.SPOTIFY_CLIENT_ID });
    userSpecificApi.setAccessToken(token);

    // Spotify's getTracks takes an array of IDs
    const data = await userSpecificApi.getTracks(trackIds.split(","));
    res.json(data.body.tracks);
  } catch (err) {
    console.error("Spotify API Error fetching tracks:", err);
    res.status(400).json({ error: "Failed to fetch tracks" });
  }
});

// search spotify tracks /api/spotify/search?q=query
router.get("/search", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Search query required" });

  try {
    const userSpecificApi = new SpotifyWebApi({ clientId: process.env.SPOTIFY_CLIENT_ID });
    userSpecificApi.setAccessToken(token);

    const data = await userSpecificApi.searchTracks(q, { limit: 8 });
    const tracks = data.body.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map(a => a.name).join(", "),
      albumArt: track.album.images[2]?.url || track.album.images[0]?.url,
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify,
    }));
    res.json(tracks);
  } catch (err) {
    console.error("Spotify search error:", err);
    res.status(400).json({ error: "Failed to search tracks" });
  }
});

module.exports = router;