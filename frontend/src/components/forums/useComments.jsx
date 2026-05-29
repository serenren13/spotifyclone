import { useState, useMemo } from 'react';
import axios from 'axios';
import { API_URL } from '../../lib/config';
import { useSpotify } from '../../context/SpotifyContext';
import { buildTree } from '../../lib/buildTree';

const api = axios.create({ baseURL: API_URL });

export function useComments(forumId) {
    const { userProfile } = useSpotify();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, commentId: null });

    const commentTree = useMemo(() => buildTree(comments), [comments]);

    const fetchComments = async (id) => {
        try {
            const res = await api.get(`/forums/${id}/comments`);
            setComments(res.data);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        const optimisticComment = {
            id: `temp-${Date.now()}`,
            authorName: userProfile?.display_name || 'Anonymous',
            authorId: userProfile?.id,
            comment: newComment,
            parentId: replyingTo?.id || null,
            depth: replyingTo ? (replyingTo.depth || 0) + 1 : 0,
            likes: 0,
            likedBy: [],
            createdAt: null,
            replies: [],
        };

        setComments(prev => [...prev, optimisticComment]);
        setNewComment('');
        setReplyingTo(null);

        try {
            await api.post(`/forums/${forumId}/comments`, {
                authorName: optimisticComment.authorName,
                authorId: optimisticComment.authorId,
                comment: optimisticComment.comment,
                parentId: optimisticComment.parentId,
                depth: optimisticComment.depth,
            });
            fetchComments(forumId);
        } catch (err) {
            console.error('Error adding comment:', err);
            setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
        }
    };

    const handleDeleteComment = (commentId) => {
        setDeleteConfirm({ isOpen: true, commentId });
    };

    const handleConfirmDeleteComment = async () => {
        const commentId = deleteConfirm.commentId;
        setDeleteConfirm({ isOpen: false, commentId: null });
        try {
            await api.delete(`/forums/${forumId}/comments/${commentId}`);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    };

    const handleCancelDeleteComment = () => {
        setDeleteConfirm({ isOpen: false, commentId: null });
    };

    const handleCommentLike = async (e, commentId) => {
        e.stopPropagation();
        try {
            const res = await api.patch(
                `/forums/${forumId}/comments/${commentId}/like`,
                { userId: userProfile?.id }
            );
            setComments(prev => prev.map(c =>
                c.id === commentId
                    ? {
                        ...c,
                        likes: res.data.liked ? c.likes + 1 : c.likes - 1,
                        likedBy: res.data.liked
                            ? [...(c.likedBy || []), userProfile?.id]
                            : (c.likedBy || []).filter(id => id !== userProfile?.id),
                    }
                    : c
            ));
        } catch (err) {
            console.error('Error liking comment:', err);
        }
    };

    return {
        comments,
        commentTree,
        newComment,
        replyingTo,
        setNewComment,
        setReplyingTo,
        fetchComments,
        handleAddComment,
        handleDeleteComment,
        handleConfirmDeleteComment,
        handleCancelDeleteComment,
        deleteConfirm,
        handleCommentLike,
    };
}