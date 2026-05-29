import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../lib/config';
import { useSpotify } from '../../context/SpotifyContext'

const api = axios.create({ baseURL: API_URL });

export function useForums() {
    const { userProfile } = useSpotify();
    const [forums, setForums] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');
    const [loading, setLoading] = useState(true);

    const fetchForums = async () => {
        try {
            const res = await api.get('/forums');
            setForums(res.data);
        } catch (err) {
            console.error('Error fetching forums:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let cancelled = false;
        api.get('/forums')
            .then(res => { if (!cancelled) setForums(res.data); })
            .catch(err => console.error('Error fetching forums:', err))
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);
 
    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        try {
            const res = await api.get(`/forums?search=${query}`);
            setForums(res.data);
        } catch (err) {
            console.error('Error searching forums:', err);
        }
    };

    const handleCreateForum = async ({ title, content, attachedTrack, onSuccess }) => {
        if (!title.trim() || !content.trim()) return;
 
        const optimisticForum = {
            id: `temp-${Date.now()}`,
            title,
            content,
            createdBy: userProfile?.display_name || 'Anonymous',
            creatorId: userProfile?.id,
            attachedTrack: attachedTrack || null,
            likes: 0,
            likedBy: [],
            createdAt: null,
        };
 
        setForums(prev => [optimisticForum, ...prev]);
        onSuccess?.();
 
        try {
            await api.post('/forums', {
                title: optimisticForum.title,
                content: optimisticForum.content,
                createdBy: optimisticForum.createdBy,
                creatorId: optimisticForum.creatorId,
                attachedTrack: optimisticForum.attachedTrack,
            });
            fetchForums();
        } catch (err) {
            console.error('Error creating forum:', err);
            setForums(prev => prev.filter(f => f.id !== optimisticForum.id));
        }
    };

    const handleDeleteForum = async (forumId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/forums/${forumId}`);
            setForums(prev => prev.filter(f => f.id !== forumId));
        } catch (err) {
            console.error('Error deleting forum:', err);
        }
    };

    const handleLike = async (forumId, onForumUpdated) => {
        try {
            await api.patch(`/forums/${forumId}/like`, { userId: userProfile?.id });
            fetchForums();
            if (onForumUpdated) {
                const res = await api.get(`/forums/${forumId}`);
                onForumUpdated(res.data);
            }
        } catch (err) {
            console.error('Error liking forum:', err);
        }
    };

    const sortedForums = sortOrder === 'liked'
        ? [...forums].sort((a, b) => (b.likes || 0) - (a.likes || 0))
        : forums;
 
    return {
        forums: sortedForums,
        searchQuery,
        sortOrder,
        loading,
        setSortOrder,
        handleSearch,
        handleCreateForum,
        handleDeleteForum,
        handleLike,
    };
}