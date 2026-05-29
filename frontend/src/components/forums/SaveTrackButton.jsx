import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../lib/config';
import { useSpotify } from '../../context/SpotifyContext';

const api = axios.create({ baseURL: API_URL });

export default function SaveTrackButton({ trackId }) {
    const { accessToken } = useSpotify();
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSave = async (e) => {
        e.stopPropagation();
        if (saved || loading || !trackId) return;
        setLoading(true);
        try {
            await api.put('/spotify/user/save-track', { trackId }, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setSaved(true);
        } catch (err) {
            console.error('Error saving track:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleSave}
            disabled={saved || loading}
            className="text-xs px-2 py-1 rounded-lg transition-all"
            style={{
                background: saved ? 'var(--accent-primary)' : 'transparent',
                color: saved ? '#fff' : 'var(--accent-primary)',
                border: '1px solid var(--accent-primary)',
                opacity: loading ? 0.6 : 1,
                cursor: saved ? 'default' : 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
            }}
        >
            {saved ? '✓ Saved' : loading ? '...' : '+ Save'}
        </button>
    );
}