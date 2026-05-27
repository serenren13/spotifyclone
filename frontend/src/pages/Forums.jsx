import { useState, useEffect, useCallback } from 'react';
import { useSpotify } from '../context/SpotifyContext';
import axios from 'axios';
import ForumCard from '../components/forums/ForumCard';
import CommentCard from '../components/forums/CommentCard';

const api = axios.create({ baseURL: 'http://127.0.0.1:5001/api' });

export default function Forums() {
    const { userProfile } = useSpotify();
    const [forums, setForums] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedForum, setSelectedForum] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const fetchForums = useCallback (async () => {
        try {
            const res = await api.get('/forums');
            setForums(res.data);
        } catch (err) {
            console.error('Error fetching forums:', err);
        }
    }, []);
    
    useEffect(() => {
        fetchForums();
    }, [fetchForums]);

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

    const handleCreateForum = async () => {
        if (!newTitle.trim() || !newContent.trim()) return;
        try {
            await api.post('/forums', {
                title: newTitle,
                content: newContent,
                createdBy: userProfile?.display_name || 'Anonymous',
            });
            setNewTitle('');
            setNewContent('');
            setShowForm(false);
            fetchForums();
        } catch (err) {
            console.error('Error creating forum:', err);
        }
    };

    const handleSelectForum = async (forum) => {
        setSelectedForum(forum);
        try {
            const res = await api.get(`/forums/${forum.id}/comments`);
            setComments(res.data);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            await api.post(`/forums/${selectedForum.id}/comments`, {
                authorId: userProfile?.display_name || 'Anonymous',
                comment: newComment,
            });
            setNewComment('');
            handleSelectForum(selectedForum);
        } catch (err) {
            console.error('Error adding comment:', err);
        }
    };

    const handleCommentLike = async (e, commentId) => {
        e.stopPropagation();
        try {
            const res = await api.patch(
                `/forums/${selectedForum.id}/comments/${commentId}/like`,
                { userId: userProfile?.id }
            );
            setComments(prev => prev.map(c =>
                c.id === commentId
                    ? { ...c,
                        likes: res.data.liked ? c.likes + 1 : c.likes - 1,
                        likedBy: res.data.liked
                            ? [...(c.likedBy || []), userProfile?.id]
                            : (c.likedBy || []).filter(id => id !== userProfile?.id) }
                    : c
            ));
        } catch (err) {
            console.error('Error liking comment:', err);
        }
    };

    const handleLike = async (e, forumId) => {
        e.stopPropagation();
        try {
            const res = await api.patch(`/forums/${forumId}/like`, {
                userId: userProfile?.id,
            });
            setForums(prev => prev.map(f =>
                f.id === forumId
                    ? { ...f, likes: res.data.liked ? f.likes + 1 : f.likes - 1,
                        likedBy: res.data.liked
                            ? [...(f.likedBy || []), userProfile?.id]
                            : (f.likedBy || []).filter(id => id !== userProfile?.id) }
                    : f
            ));
            if (selectedForum?.id === forumId) {
                setSelectedForum(prev => ({
                    ...prev,
                    likes: res.data.liked ? prev.likes + 1 : prev.likes - 1,
                    likedBy: res.data.liked
                        ? [...(prev.likedBy || []), userProfile?.id]
                        : (prev.likedBy || []).filter(id => id !== userProfile?.id)
                }));
            }
        } catch (err) {
            console.error('Error liking forum:', err);
        }
    };

    // forum detail view
    if (selectedForum) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-8">
                <button
                    onClick={() => setSelectedForum(null)}
                    className="mb-6 text-[var(--accent-primary)] hover:opacity-80 flex items-center gap-2"
                >
                    ← Back to Forums
                </button>

                <div className="max-w-3xl mx-auto">
                    <div className="bg-[var(--bg-dark)] rounded-2xl p-6 mb-6 border border-[var(--accent-secondary)]/20">
                        <h1 className="text-2xl font-bold mb-2">{selectedForum.title}</h1>
                        <p className="text-[var(--text-light)] mb-4">{selectedForum.content}</p>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--accent-secondary)]">by {selectedForum.createdBy}</span>
                            <button
                                onClick={(e) => handleLike(e, selectedForum.id)}
                                className="flex items-center gap-1 hover:opacity-80"
                                style={{ color: selectedForum.likedBy?.includes(userProfile?.id)
                                    ? 'var(--accent-primary)'
                                    : 'var(--accent-secondary)' }}
                            >
                                {selectedForum.likedBy?.includes(userProfile?.id) ? '❤️' : '🤍'} {selectedForum.likes}
                            </button>
                        </div>
                    </div>

                    <h2 className="text-lg font-semibold mb-4">Comments</h2>

                    {comments.length === 0 && (
                        <p className="text-[var(--accent-secondary)] text-sm mb-4">No comments yet. Be the first!</p>
                    )}

                    {comments.map(c => (
                        <CommentCard
                            key={c.id}
                            comment={c}
                            userId={userProfile?.id}
                            onLike={(e, commentId) => handleCommentLike(e, commentId)}
                        />
                    ))}

                    <div className="mt-6 flex gap-3">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            className="flex-1 bg-[var(--bg-dark)] border border-[var(--accent-secondary)]/30 rounded-xl px-4 py-2 text-[var(--text-primary)] placeholder-[var(--accent-secondary)] focus:outline-none"
                        />
                        <button
                            onClick={handleAddComment}
                            className="bg-[var(--accent-primary)] text-white px-4 py-2 rounded-xl hover:opacity-90"
                        >
                            Post
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // forum list view
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Forums</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-[var(--accent-primary)] text-white px-4 py-2 rounded-xl hover:opacity-90"
                    >
                        {showForm ? 'Cancel' : '+ New Post'}
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Search forums..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="w-full bg-[var(--bg-dark)] border border-[var(--accent-secondary)]/30 rounded-xl px-4 py-3 mb-6 text-[var(--text-primary)] placeholder-[var(--accent-secondary)] focus:outline-none"
                />

                {showForm && (
                    <div className="bg-[var(--bg-dark)] rounded-2xl p-6 mb-6 border border-[var(--accent-secondary)]/20">
                        <input
                            type="text"
                            placeholder="Title"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            className="w-full bg-[var(--bg-primary)] border border-[var(--accent-secondary)]/30 rounded-xl px-4 py-2 mb-3 text-[var(--text-primary)] placeholder-[var(--accent-secondary)] focus:outline-none"
                        />
                        <textarea
                            placeholder="What's on your mind?"
                            value={newContent}
                            onChange={e => setNewContent(e.target.value)}
                            rows={4}
                            className="w-full bg-[var(--bg-primary)] border border-[var(--accent-secondary)]/30 rounded-xl px-4 py-2 mb-3 text-[var(--text-primary)] placeholder-[var(--accent-secondary)] focus:outline-none resize-none"
                        />
                        <button
                            onClick={handleCreateForum}
                            className="bg-[var(--accent-primary)] text-white px-6 py-2 rounded-xl hover:opacity-90"
                        >
                            Post
                        </button>
                    </div>
                )}

                {forums.length === 0 && (
                    <p className="text-center text-[var(--accent-secondary)] mt-12">No forums yet. Be the first to post!</p>
                )}
                {forums.map(forum => (
                    <ForumCard
                        key={forum.id}
                        forum={forum}
                        userId={userProfile?.id}
                        onSelect={handleSelectForum}
                        onLike={handleLike}
                    />
                ))}
            </div>
        </div>
    );
}