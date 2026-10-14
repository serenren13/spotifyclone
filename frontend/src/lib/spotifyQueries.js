import axios from "axios";
import { SPOTIFY_API_URL } from "./config";

const spotifyApi = axios.create({ baseURL: SPOTIFY_API_URL });

// example: ["spotify", "user123", "profile"]
// example: ["spotify", "user123", "top-tracks", "long_term"]
export const spotifyKeys = {
  profile: (userId) => ["spotify", userId, "profile"],  
  topTracks: (userId, timeRange) => ["spotify", userId, "top-tracks", timeRange], 
  topArtists: (userId) => ["spotify", userId, "top-artists"],
  fourTopArtists: (userId) => ["spotify", userId, "four-top-artists"],
  likedSongs: (userId) => ["spotify", userId, "liked-songs"],
};

// queryKey identifies the query cached data
// path is the endpoint path requested from our backend
// accessToken is the spotify token used to authenticate the request
const spotifyQuery = (queryKey, path, accessToken) => ({
  queryKey,
  enabled: Boolean(queryKey[1] && accessToken), // only run the query if both key and token are available
  queryFn: async ({ signal }) => {
    const response = await spotifyApi.get(path, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    });
    return response.data;
  },
});

// build tanstack query 
export const spotifyQueries = {
  profile: (userId, accessToken) =>
    spotifyQuery(spotifyKeys.profile(userId), "/user/profile", accessToken),
  topTracks: (userId, accessToken, timeRange = "long_term") =>
    spotifyQuery(spotifyKeys.topTracks(userId, timeRange), `/top-tracks?time_range=${timeRange}`, accessToken),
  topArtists: (userId, accessToken) =>
    spotifyQuery(spotifyKeys.topArtists(userId), "/user/top-artists", accessToken),
  fourTopArtists: (userId, accessToken) =>
    spotifyQuery(spotifyKeys.fourTopArtists(userId), "/user/four-top-artists", accessToken),
  likedSongs: (userId, accessToken) =>
    spotifyQuery(spotifyKeys.likedSongs(userId), "/user/liked-songs", accessToken),
};
