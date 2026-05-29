const express = require("express");
const SpotifyWebApi = require("spotify-web-api-node");
const router = express.Router();
const { saveUser } = require("../db/UsersService.js");

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
});

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://127.0.0.1:5173";

// redirect to login /api/spotify/auth/login
router.get("/auth/login", (req, res) => {
  const scopes = ["user-read-private", "user-read-email", "user-top-read", "user-library-read"];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.redirect(authorizeURL);
});

async function fetchMusicSnapshot(userApi) {
  const empty = { topArtists: [], topTracks: [], likedTracks: [] };

  const [topArtistsRes, topTracksRes, likedRes] = await Promise.allSettled([
    userApi.getMyTopArtists({ limit: 4, time_range: "long_term" }),
    userApi.getMyTopTracks({ limit: 4, time_range: "long_term" }),
    userApi.getMySavedTracks({ limit: 4 }),
  ]);

  if (topArtistsRes.status === "rejected") {
    console.warn("Auth callback: top artists fetch failed:", topArtistsRes.reason?.message);
  }
  if (topTracksRes.status === "rejected") {
    console.warn("Auth callback: top tracks fetch failed:", topTracksRes.reason?.message);
  }
  if (likedRes.status === "rejected") {
    console.warn("Auth callback: liked tracks fetch failed:", likedRes.reason?.message);
  }

  const topArtists =
    topArtistsRes.status === "fulfilled"
      ? (topArtistsRes.value.body.items ?? []).map((a) => ({
          id: a.id,
          name: a.name,
          image: a.images?.[0]?.url || null,
        }))
      : empty.topArtists;

  const topTracks =
    topTracksRes.status === "fulfilled"
      ? (topTracksRes.value.body.items ?? []).map((t) => ({
          id: t.id,
          name: t.name,
          artist: t.artists?.[0]?.name || null,
          albumArt: t.album?.images?.[0]?.url || null,
        }))
      : empty.topTracks;

  const likedTracks =
    likedRes.status === "fulfilled"
      ? (likedRes.value.body.items ?? [])
          .map(({ track }) => track)
          .filter(Boolean)
          .map((track) => ({
            id: track.id,
            name: track.name,
            artist: track.artists?.[0]?.name || null,
            albumArt: track.album?.images?.[0]?.url || null,
          }))
      : empty.likedTracks;

  return { topArtists, topTracks, likedTracks };
}

// gets token and redirects back to frontend /api/spotify/auth/callback
router.get("/auth/callback", async (req, res) => {
  const { code, error: spotifyError } = req.query;
  if (spotifyError) {
    return res.status(400).json({ error: `Spotify denied login: ${spotifyError}` });
  }
  if (!code) {
    return res.status(400).json({ error: "Missing authorization code. Start login again from the app." });
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const { access_token } = data.body;

    const userSpecificApi = new SpotifyWebApi({ clientId: process.env.SPOTIFY_CLIENT_ID });
    userSpecificApi.setAccessToken(access_token);

    const spotifyUser = await userSpecificApi.getMe();
    const userId = spotifyUser.body.id;

    const musicSnapshot = await fetchMusicSnapshot(userSpecificApi);

    await saveUser(userId, {
      displayName: spotifyUser.body.display_name,
      email: spotifyUser.body.email,
      spotifyId: userId,
      profileImage: spotifyUser.body.images?.[0]?.url || null,
      ...musicSnapshot,
    });

    res.redirect(`${FRONTEND_URL}/?access_token=${access_token}`);
  } catch (err) {
    console.error("Auth callback error:", err?.message || err);
    const hint =
      err?.statusCode === 400
        ? "Auth code may be expired or already used — click Login with Spotify again (do not refresh the callback URL)."
        : err?.message;
    res.status(400).json({
      error: "Authentication and profile sync failed",
      detail: hint,
    });
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
    console.error("Profile Fetch Error:", err.message);
    res.status(err.statusCode || 400).json({ error: "Failed to fetch profile" });
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
      limit: 21
    });
    res.json(data.body.items);
  } catch (err) {
    console.error("Spotify API Error fetching top tracks:", err.message);
    res.status(err.statusCode || 400).json({ error: "Failed to fetch top tracks" });
  }
});

// get user liked songs /api/spotify/user/liked-songs
// fetches up to 300 songs (6 requests of 50) to avoid quota issues
router.get("/user/liked-songs", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const userSpecificApi = new SpotifyWebApi({ clientId: process.env.SPOTIFY_CLIENT_ID });
    userSpecificApi.setAccessToken(token);

    const BATCH_SIZE = 50;
    const MAX_SONGS = 300;
    const offsets = [0, 50, 100, 150, 200, 250]; // 6 requests = 300 songs max

    const results = await Promise.all(
      offsets.map(offset =>
        userSpecificApi.getMySavedTracks({ limit: BATCH_SIZE, offset })
          .then(res => res.body.items)
          .catch(() => []) // if an offset fails (e.g. user has fewer songs), return empty
      )
    );

    const items = results.flat().slice(0, MAX_SONGS);
    res.json({ items });
  } catch (err) {
    console.error("Spotify API Error fetching liked songs:", err.message);
    res.status(err.statusCode || 400).json({ error: "Failed to fetch liked songs" });
  }
});

// get user top artists /api/spotify/user/top-artists
router.get("/user/top-artists", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

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
    console.error("Spotify API Error fetching top artists:", err.message);
    res.status(err.statusCode || 400).json({ error: "Failed to fetch top artists" });
  }
});

// get four top artists /api/spotify/user/four-top-artists
router.get("/user/four-top-artists", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const userSpecificApi = new SpotifyWebApi({ clientId: process.env.SPOTIFY_CLIENT_ID });
    userSpecificApi.setAccessToken(token);

    const data = await userSpecificApi.getMyTopArtists({ time_range: 'long_term', limit: 4 });
    res.json(data.body);
  } catch (err) {
    console.error("Spotify API Error fetching 4 top artists:", err.message);
    res.status(err.statusCode || 400).json({ error: "Failed to fetch four top artists" });
  }
});

// get specific tracks by ID /api/spotify/tracks?ids=123,456
router.get("/tracks", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  const trackIds = req.query.ids;
  if (!trackIds) return res.status(400).json({ error: "No track IDs provided" });

  try {
    const userSpecificApi = new SpotifyWebApi({ clientId: process.env.SPOTIFY_CLIENT_ID });
    userSpecificApi.setAccessToken(token);

    const data = await userSpecificApi.getTracks(trackIds.split(","));
    res.json(data.body.tracks);
  } catch (err) {
    console.error("Spotify API Error fetching tracks by ID:", err.message);
    res.status(err.statusCode || 400).json({ error: "Failed to fetch tracks" });
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
    console.error("Spotify search error:", err.message);
    res.status(err.statusCode || 400).json({ error: "Failed to search tracks" });
  }
});

// save a track to the user's liked songs /api/spotify/user/save-track
router.put("/user/save-track", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  const { trackId } = req.body;
  if (!trackId) return res.status(400).json({ error: "trackId required" });

  try {
    const userSpecificApi = new SpotifyWebApi({ clientId: process.env.SPOTIFY_CLIENT_ID });
    userSpecificApi.setAccessToken(token);

    await userSpecificApi.addToMySavedTracks([trackId]);
    res.status(200).json({ message: "Track saved to liked songs" });
  } catch (err) {
    console.error("Spotify save track error:", err.message);
    res.status(err.statusCode || 400).json({ error: "Failed to save track" });
  }
});

module.exports = router;