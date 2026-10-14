import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSpotify } from "../../context/SpotifyContext";
import { spotifyQueries } from "../../lib/spotifyQueries";
import { api } from "./profileApi";

export function useProfile() {
    const navigate = useNavigate();
    const { accessToken, userProfile, logout } = useSpotify();

    const profileQuery = useQuery(spotifyQueries.profile(userProfile?.id, accessToken));
    const artistsQuery = useQuery(spotifyQueries.fourTopArtists(userProfile?.id, accessToken));
    const tracksQuery = useQuery(spotifyQueries.topTracks(userProfile?.id, accessToken));
    const likedQuery = useQuery(spotifyQueries.likedSongs(userProfile?.id, accessToken));
    const profile = profileQuery.data ?? userProfile;
    const [firebaseMusic, setFirebaseMusic] = useState(null);
    const [firebaseLoading, setFirebaseLoading] = useState(true);
    const topArtists = firebaseMusic?.topArtists?.length
        ? firebaseMusic.topArtists
        : (artistsQuery.data?.items ?? []).slice(0, 4);
    const topSongs = firebaseMusic?.topTracks?.length
        ? firebaseMusic.topTracks
        : (tracksQuery.data?.items ?? (Array.isArray(tracksQuery.data) ? tracksQuery.data : [])).slice(0, 4);
    const allLikedSongs = likedQuery.data?.items ?? [];
    const loading = firebaseLoading || [profileQuery, artistsQuery, tracksQuery, likedQuery].some(query => query.isPending);
    const musicError = [profileQuery, artistsQuery, tracksQuery, likedQuery].some(query => query.isError);

    const [isPrivate, setIsPrivate] = useState(false);
    const [bioText, setBioText] = useState("");
    const [savingBio, setSavingBio] = useState(false);
    const [customImageUrl, setCustomImageUrl] = useState("");

    const [favoriteSongIds, setFavoriteSongIds] = useState([]);
    const [favoriteTracksData, setFavoriteTracksData] = useState([]);
    const [isEditingFavorites, setIsEditingFavorites] = useState(false);
    const [tempSelectedFavorites, setTempSelectedFavorites] = useState([]);

    useEffect(() => {
        if (!profile?.id) {
            setFirebaseLoading(false);
            return;
        }
        let cancelled = false;
        setFirebaseLoading(true);
        api.get(`/users/${profile.id}`)
            .then(firebaseRes => {
                if (cancelled) return;
                const fb = firebaseRes.data;
                if (fb) {
                    setIsPrivate(fb.isPrivate || false);
                    setBioText(fb.bio || "");
                    if (fb.profileImage) setCustomImageUrl(fb.profileImage);
                    if (fb.favoriteSongs) setFavoriteSongIds(fb.favoriteSongs);
                    if (fb.favoriteTracksData) setFavoriteTracksData(fb.favoriteTracksData);
                    setFirebaseMusic({ topArtists: fb.topArtists, topTracks: fb.topTracks });
                }
            })
            .catch(err => console.log("Firebase profile fetch issue:", err))
            .finally(() => { if (!cancelled) setFirebaseLoading(false); });
        return () => { cancelled = true; };
    }, [profile?.id]);

    //FIREBASE UPDATES
    const handleTogglePrivacy = async () => {
        if (!profile?.id) return;
        const newPrivacyStatus = !isPrivate;
        setIsPrivate(newPrivacyStatus);
        try {
            await api.patch(`/users/${profile.id}`, { isPrivate: newPrivacyStatus });
        } catch {
            setIsPrivate(!newPrivacyStatus);
            alert("Could not update privacy status.");
        }
    };

    const handleSaveBio = async () => {
        if (!profile?.id) return;
        setSavingBio(true);
        try {
            await api.patch(`/users/${profile.id}`, { bio: bioText });
            setTimeout(() => setSavingBio(false), 1500);
        } catch {
            setSavingBio(false);
            alert("Database error: Check backend terminal.");
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleEditProfileImage = async () => {
        if (!profile?.id) return;
        const newUrl = window.prompt("Paste a new image URL to update your profile picture:", customImageUrl);
        if (newUrl !== null && newUrl.trim() !== "") {
            setCustomImageUrl(newUrl);
            try {
                await api.patch(`/users/${profile.id}`, { profileImage: newUrl });
            } catch {
                alert("Database error: Could not save the new profile picture.");
            }
        }
    };

    //FAVORITE SONGS LOGIC
    const handleOpenFavoritesModal = () => {
        setTempSelectedFavorites([...favoriteSongIds]);
        setIsEditingFavorites(true);
    };

    const handleToggleFavoriteSelection = (trackId) => {
        if (tempSelectedFavorites.includes(trackId)) {
            setTempSelectedFavorites(tempSelectedFavorites.filter(id => id !== trackId));
        } else {
            if (tempSelectedFavorites.length < 4) {
                setTempSelectedFavorites([...tempSelectedFavorites, trackId]);
            } else {
                alert("You can only select up to 4 favorite songs.");
            }
        }
    };

    const handleSaveFavorites = async () => {
        if (!profile?.id) return;

        const updatedTracksData = allLikedSongs
            .filter(item => tempSelectedFavorites.includes(item.track?.id))
            .map(item => ({
                id: item.track?.id,
                name: item.track?.name,
                artist: item.track?.artists?.[0]?.name || null,
                albumArt: item.track?.album?.images?.[1]?.url || item.track?.album?.images?.[0]?.url || null,
            }));

        setFavoriteSongIds(tempSelectedFavorites);
        setFavoriteTracksData(updatedTracksData);
        setIsEditingFavorites(false);

        try {
            await api.patch(`/users/${profile.id}`, {
                favoriteSongs: tempSelectedFavorites,
                favoriteTracksData: updatedTracksData,
            });
        } catch {
            alert("Database error: Could not save favorite songs.");
        }
    };

    let displayFavorites = [];
    if (favoriteTracksData.length > 0) {
        displayFavorites = favoriteTracksData.slice(0, 4);
    } else if (favoriteSongIds.length > 0) {
        displayFavorites = allLikedSongs
            .filter(item => favoriteSongIds.includes(item.track?.id))
            .slice(0, 4)
            .map(item => ({
                id: item.track?.id,
                name: item.track?.name,
                artist: item.track?.artists?.map(a => a.name).join(", ") || "Unknown Artist",
                albumArt: item.track?.album?.images?.[2]?.url || item.track?.album?.images?.[0]?.url || null,
            }));
    } else {
        displayFavorites = allLikedSongs.slice(0, 4).map(item => ({
            id: item.track?.id,
            name: item.track?.name,
            artist: item.track?.artists?.map(a => a.name).join(", ") || "Unknown Artist",
            albumArt: item.track?.album?.images?.[2]?.url || item.track?.album?.images?.[0]?.url || null,
        }));
    }

    const displayImage = customImageUrl || profile?.images?.[1]?.url || profile?.images?.[0]?.url || "https://i.scdn.co/image/ab6761610000e5eb55d39ab9c21d506aa52f7021";

    return {
        userProfile, loading, musicError, handleLogout, isEditingFavorites,
        tempSelectedFavorites, allLikedSongs, handleToggleFavoriteSelection,
        setIsEditingFavorites, handleSaveFavorites, isPrivate,
        handleTogglePrivacy, displayImage, profile, bioText, setBioText,
        handleSaveBio, savingBio, topArtists, topSongs, displayFavorites,
        handleOpenFavoritesModal,
    };
}