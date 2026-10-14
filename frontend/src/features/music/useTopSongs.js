import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSpotify } from "../../context/SpotifyContext";
import { spotifyQueries } from "../../lib/spotifyQueries";

export function useTopSongs() {
    const { accessToken, userProfile } = useSpotify();
    const [timeRange, setTimeRange] = useState("short_term");
    const { data, isPending, isError } = useQuery(
        spotifyQueries.topTracks(userProfile?.id, accessToken, timeRange)
    );
    const songs = data?.items || (Array.isArray(data) ? data : []);
    return { timeRange, setTimeRange, data, isPending, isError, songs };
}
