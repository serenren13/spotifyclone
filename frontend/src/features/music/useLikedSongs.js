import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSpotify } from "../../context/SpotifyContext";
import { spotifyQueries } from "../../lib/spotifyQueries";
import { filterLikedSongs } from "./musicUtils";

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
    useEffect(() => {
        const handler = () => setIsMobile(window.innerWidth < 640);
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
    }, []);
    return isMobile;
};

export function useLikedSongs() {
    const { accessToken, userProfile } = useSpotify();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [selectedDecade, setSelectedDecade] = useState('All');
    const isMobile = useIsMobile();
    const { data, isPending, isError } = useQuery(
        spotifyQueries.likedSongs(userProfile?.id, accessToken)
    );
    const filteredSongs = useMemo(
        () => filterLikedSongs(data?.items ?? [], searchQuery, selectedDecade, sortOrder),
        [data, searchQuery, selectedDecade, sortOrder]
    );

    return {
        searchQuery, setSearchQuery, sortOrder, setSortOrder,
        selectedDecade, setSelectedDecade, isMobile,
        filteredSongs, isPending, isError, data,
    };
}
