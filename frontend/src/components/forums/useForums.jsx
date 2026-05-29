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
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, forumId: null });

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
 
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const filteredForums = searchQuery.trim()
        ? forums.filter(f =>
            f.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : forums;

    const sortedForums = sortOrder === 'liked'
        ? [...filteredForums].sort((a, b) => (b.likes || 0) - (a.likes || 0))
        : filteredForums;

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

    const handleDeleteForum = (forumId) => {
        setDeleteConfirm({ isOpen: true, forumId });
    };

    const handleConfirmDelete = async () => {
        const forumId = deleteConfirm.forumId;
        setDeleteConfirm({ isOpen: false, forumId: null });
        try {
            await api.delete(`/forums/${forumId}`);
            setForums(prev => prev.filter(f => f.id !== forumId));
        } catch (err) {
            console.error('Error deleting forum:', err);
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirm({ isOpen: false, forumId: null });
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
 
    return {
        forums: sortedForums,
        searchQuery,
        sortOrder,
        loading,
        setSortOrder,
        handleSearch,
        handleCreateForum,
        handleDeleteForum,
        handleConfirmDelete,
        handleCancelDelete,
        deleteConfirm,
        handleLike,
    };
}