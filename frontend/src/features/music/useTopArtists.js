import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSpotify } from "../../context/SpotifyContext";
import { spotifyQueries } from "../../lib/spotifyQueries";

export function useTopArtists() {
  const { accessToken, userProfile } = useSpotify();
  const [term, setTerm] = useState("short_term");
  const { data, isPending, isError } = useQuery(
    spotifyQueries.topArtists(userProfile?.id, accessToken)
  );
  const artists = data?.[term] ?? [];
  return { term, setTerm, data, isPending, isError, artists };
}
