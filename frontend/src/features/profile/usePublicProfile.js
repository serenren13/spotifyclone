import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSpotify } from "../../context/SpotifyContext";
import { api } from "./profileApi";

export function usePublicProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { accessToken, userProfile } = useSpotify();

    const [publicUser, setPublicUser] = useState(null);
    const [topArtists, setTopArtists] = useState([]);
    const [topSongs, setTopSongs] = useState([]);
    const [favoriteTracks, setFavoriteTracks] = useState([]);
    const [usingFavorites, setUsingFavorites] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (userProfile && id === userProfile.id) navigate('/profile');
    }, [userProfile, id, navigate]);

    useEffect(() => {
        if (!accessToken) return;

        api.get(`/users/${id}`)
            .then(async (res) => {
                const userData = res.data;

                if (!userData) {
                    setError("User not found in the database.");
                    setLoading(false);
                    return;
                }

                setPublicUser(userData);

                if (userData.isPrivate) {
                    setLoading(false);
                    return;
                }

                setTopArtists(userData.topArtists || []);
                setTopSongs(userData.topTracks || []);

                const hasFavoriteSongs = userData.favoriteSongs?.length > 0;

                if (hasFavoriteSongs && userData.favoriteTracksData?.length > 0) {
                    setFavoriteTracks(userData.favoriteTracksData);
                    setUsingFavorites(true);
                } else {
                    setFavoriteTracks(userData.likedTracks || []);
                    setUsingFavorites(false);
                }

                setLoading(false);
            })
            .catch(err => {
                console.error("User not found:", err);
                setError("User not found.");
                setLoading(false);
            });
    }, [id, accessToken]);

    const handleMessageUser = () => {
        if (!publicUser) return;
        navigate("/inbox");
    };

    const displayImage = publicUser?.profileImage || "https://i.scdn.co/image/ab6761610000e5eb55d39ab9c21d506aa52f7021";

    return {
        navigate, publicUser, topArtists, topSongs, favoriteTracks,
        loading, error, handleMessageUser, displayImage,
    };
}