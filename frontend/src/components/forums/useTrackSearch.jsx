import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../lib/config';
import { useSpotify } from '../../context/SpotifyContext';

const api = axios.create({ baseURL: API_URL });

export function useTrackSearch() {
    const { accessToken } = useSpotify();
    const [trackSearch, setTrackSearch] = useState('');
    const [trackResults, setTrackResults] = useState([]);
    const [attachedTrack, setAttachedTrack] = useState(null);

    const handleTrackSearch = async (e) => {
        const q = e.target.value;
        setTrackSearch(q);
        if (!q.trim()) { setTrackResults([]); return; }
        try {
            const res = await api.get(`/spotify/search?q=${q}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setTrackResults(res.data);
        } catch (err) {
            console.error('Error searching tracks:', err);
        }
    };

    const selectTrack = (track) => {
        setAttachedTrack(track);
        setTrackResults([]);
        setTrackSearch(track.name);
    };

    const clearTrack = () => {
        setAttachedTrack(null);
        setTrackSearch('');
        setTrackResults([]);
    };

    return {
        trackSearch,
        trackResults,
        attachedTrack,
        handleTrackSearch,
        selectTrack,
        clearTrack,
    };
}