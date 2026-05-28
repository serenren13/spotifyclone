import { useState, useEffect, useMemo } from 'react';
import { useSpotify } from '../context/SpotifyContext';
import LikeButton from '../components/forums/LikeButton';
import { Link } from 'react-router-dom';
import ForumCard from '../components/forums/ForumCard';
import axios from 'axios';
import RichTextEditor from '../components/forums/RichTextEditor';
import Comment from '../components/forums/Comment';

const api = axios.create({ baseURL: 'http://127.0.0.1:5001/api' });

const buildTree = (comments) => {
        const map = {};
        const roots = [];
        comments.forEach(c => map[c.id] = { ...c, replies: [] });
        comments.forEach(c => {
            if (c.parentId) map[c.parentId]?.replies.push(map[c.id]);
            else roots.push(map[c.id]);
        });
        return roots;
    };

export default function Forums() {
    const { userProfile, accessToken } = useSpotify();
    const [forums, setForums] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [selectedForum, setSelectedForum] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [trackSearch, setTrackSearch] = useState('');
    const [trackResults, setTrackResults] = useState([]);
    const [attachedTrack, setAttachedTrack] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('newest');
    const [replyingTo, setReplyingTo] = useState(null);
    
    const commentTree = useMemo(() => buildTree(comments), [comments]);

    const sortedForums = sortOrder === 'liked'
        ? [...forums].sort((a,b) => (b.likes || 0) - (a.likes || 0))
        : forums;

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        api.get('/forums')
            .then((res) => { if (!cancelled) setForums(res.data); })
            .catch((err) => { console.error('Error fetching forums:', err); })
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

    const handleCreateForum = async () => {
        if (!newTitle.trim() || !newContent.trim()) return;
        
        const optimisticForum = {
            id: `temp-${Date.now()}`,
            title: newTitle,
            content: newContent,
            createdBy: userProfile?.display_name || 'Anonymous',
            creatorId: userProfile?.id,
            attachedTrack: attachedTrack || null,
            likes: 0,
            likedBy: [],
            createdAt: null,
        };

        setForums(prev => [optimisticForum, ...prev]);
        setNewTitle('');
        setNewContent('');
        setShowForm(false);
        setAttachedTrack(null);
        setTrackSearch('');
        setTrackResults([]);


        try {
            await api.post('/forums', {
                title: optimisticForum.title,
                content: optimisticForum.content,
                createdBy: optimisticForum.createdBy,
                creatorId: optimisticForum.creatorId, 
                attachedTrack: optimisticForum.attachedTrack,
            });
            // replace optimistic with real data
            api.get('/forums').then(res => setForums(res.data));
        } catch (err) {
            console.error('Error creating forum:', err);
            // revert on failure
            setForums(prev => prev.filter(f => f.id !== optimisticForum.id));
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

    const handleDeleteForum = async (forumId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/forums/${forumId}`);
            setForums(prev => prev.filter(f => f.id !== forumId));
        } catch (err) {
            console.error('Error deleting forum:', err);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        
        // optimistic update
        const optimisticComment = {
            id: `temp-${Date.now()}`,
            authorName: userProfile?.display_name || 'Anonymous',
            authorId: userProfile?.id,
            comment: newComment,
            parentId: replyingTo?.id || null,
            depth: replyingTo ? (replyingTo.depth || 0) + 1 : 0,
            likes: 0,
            likedBy: [],
            createdAt: null, // no timestamp yet
            replies: [],
        };

        setComments(prev => [...prev, optimisticComment]);
        setNewComment('');
        setReplyingTo(null);

        try {
            await api.post(`/forums/${selectedForum.id}/comments`, {
                authorName: userProfile?.display_name || 'Anonymous',
                authorId: userProfile?.id, // Explicitly save the Firebase Document ID
                comment: optimisticComment.comment,
                parentId: replyingTo?.id || null,
                depth: optimisticComment.depth,
            });
            // replace optimistic with real data
            handleSelectForum(selectedForum);
        } catch (err) {
            console.error('Error adding comment:', err);
            // revert on failure
            setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;
        try {
            await api.delete(`/forums/${selectedForum.id}/comments/${commentId}`);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    };

    const handleLike = async (forumId) => {
        try {
            await api.patch(`/forums/${forumId}/like`, { userId: userProfile?.id });
            api.get('/forums').then(res => setForums(res.data));
            
            if (selectedForum && selectedForum.id === forumId) {
                const res = await api.get(`/forums/${forumId}`);
                setSelectedForum(res.data);
            }
        } catch (err) {
            console.error('Error liking forum:', err);
        }
    };

    const handleTrackSearch = async (e) => {
        const q = e.target.value;
        setTrackSearch(q);
        if (!q.trim()) { setTrackResults([]); return; }
        try {
            const res = await api.get(`/spotify/search?q=${q}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            setTrackResults(res.data);
        } catch (err) {
            console.error('Error searching tracks:', err)
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

    // --- FORUM DETAIL VIEW ---
    if (selectedForum) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-8">
                <div className="max-w-3xl mx-auto">
                    <button
                        onClick={() => setSelectedForum(null)}
                        className="mb-6 text-[var(--accent-primary)] hover:opacity-80 flex items-center gap-2"
                    >
                        ← Back to Forums
                    </button>
                    <div className="bg-[var(--bg-dark)] rounded-2xl p-6 mb-6 border border-[var(--accent-secondary)]/20">
                        <h1 className="text-2xl font-bold mb-2">{selectedForum.title}</h1>
                        <p className="text-xs text-[var(--accent-secondary)] mb-2">
                            {selectedForum.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                                year: 'numeric', month: 'short', day: 'numeric'
                            })}
                        </p>
                        <div className="text-[var(--text-light)] mb-4" dangerouslySetInnerHTML={{ __html: selectedForum.content }} />
                        {selectedForum.attachedTrack && (
                            <a
                                href={selectedForum.attachedTrack.spotifyUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 p-3 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 rounded-xl mb-4 hover:opacity-80 transition-all"
                            >
                                <img
                                    src={selectedForum.attachedTrack.albumArt}
                                    alt={selectedForum.attachedTrack.name}
                                    className="w-12 h-12 rounded"
                                />
                                <div>
                                    <p className="text-xs text-[var(--accent-primary)] mb-0.5">🎵 Attached Track</p>
                                    <p className="text-sm font-medium">{selectedForum.attachedTrack.name}</p>
                                    <p className="text-xs text-[var(--accent-secondary)]">{selectedForum.attachedTrack.artist}</p>
                                </div>
                            </a>
                        )}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-[var(--accent-secondary)]">
                                by{" "}
                                <Link 
                                    to={`/user/${selectedForum.creatorId}`} 
                                    className="text-[var(--accent-primary)] hover:underline"
                                >
                                    {selectedForum.createdBy}
                                </Link>
                                {userProfile?.id === selectedForum.creatorId && (
                                    <button
                                        onClick={() => {
                                            handleDeleteForum(selectedForum.id);
                                            setSelectedForum(null);
                                        }}
                                        className="text-red-400 hover:text-red-500 text-xs"
                                    >
                                        delete
                                    </button>
                                )}
                            </span>
                            <LikeButton
                                likes={selectedForum.likes || 0}
                                likedBy={selectedForum.likedBy || []}
                                userId={userProfile?.id}
                                onLike={(e) => {
                                    e.stopPropagation();
                                    handleLike(selectedForum.id);
                                }}
                            />
                        </div>
                    </div>

                    <h2 className="text-lg font-semibold mb-4">Comments</h2>

                    {comments.length === 0 && (
                        <p className="text-[var(--accent-secondary)] text-sm mb-4">No comments yet. Be the first!</p>
                    )}

                    {commentTree.map(comment => (
                        <Comment
                            key={comment.id}
                            comment={comment}
                            userId={userProfile?.id}
                            onLike={handleCommentLike}
                            onReply={setReplyingTo}
                            onDelete={handleDeleteComment}
                            maxDepth={3}
                        />
                    ))}
                    <div className="mt-6 flex flex-col gap-3">
                        {replyingTo && (
                            <div className="flex items-center gap-2 text-xs text-[var(--accent-secondary)] bg-[var(--bg-dark)] px-3 py-2 rounded-xl">
                                <span>Replying to <span className="text-[var(--accent-primary)]">{replyingTo.authorName || replyingTo.authorId}</span></span>
                                <button onClick={() => setReplyingTo(null)} className="ml-auto hover:text-red-400">x</button>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <input
                                type="text"
                                placeholder={replyingTo ? `Reply to ${replyingTo.authorName || replyingTo.authorId}...` : "Add a comment..."}
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
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
            </div>
        );
    }

    // --- FORUM LIST VIEW ---
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

                <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-[var(--accent-secondary)]">
                        Sort by:
                    </span>
                    <button 
                        onClick={() => setSortOrder('newest')}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                            sortOrder === 'newest'
                                ? 'bg-[var(--accent-primary)] text-white'
                                : 'bg-[var(--bg-dark)] text-[var(--accent-secondary)] hover:opacity-80'
                        }`}
                    >
                        Newest
                    </button>
                    <button 
                        onClick={() => setSortOrder('liked')}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                            sortOrder === 'liked'
                                ? 'bg-[var(--accent-primary)] text-white'
                                : 'bg-[var(--bg-dark)] text-[var(--accent-secondary)] hover:opacity-80'
                        }`}
                    >
                        Most Liked
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
                        <RichTextEditor
                            content={newContent}
                            onChange={setNewContent}
                        />
                        {/* Song search */}
                        <div className="mb-3">
                            <input
                                type="text"
                                placeholder="🎵 Attach a song..."
                                value={trackSearch}
                                onChange={handleTrackSearch}
                                className="w-full bg-[var(--bg-primary)] border border-[var(--accent-secondary)]/30 rounded-xl px-4 py-2 text-[var(--text-primary)] placeholder-[var(--accent-secondary)] focus:outline-none"
                            />
                            {trackResults.length > 0 && !attachedTrack && (
                                <div className="mt-2 bg-[var(--bg-primary)] border border-[var(--accent-secondary)]/20 rounded-xl overflow-hidden">
                                    {trackResults.map(track => (
                                        <div
                                            key={track.id}
                                            onClick={() => {
                                                setAttachedTrack(track);
                                                setTrackResults([]);
                                                setTrackSearch(track.name);
                                            }}
                                            className="flex items-center gap-3 p-3 hover:bg-[var(--bg-dark)] cursor-pointer"
                                            >
                                                <img src={track.albumArt} alt={track.name} className="w-10 h-10 rounded" />
                                                <div>
                                                    <p className="text-sm font-medium">{track.name}</p>
                                                    <p className="text-xs text-[var(--accent-secondary)]">{track.artist}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {attachedTrack && (
                                    <div className="mt-2 flex items-center gap-3 p-3 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 rounded-xl">
                                        <img src={attachedTrack.albumArt} alt={attachedTrack.name} className="w-10 h-10 rounded" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{attachedTrack.name}</p>
                                            <p className="text-xs text-[var(--accent-secondary)]">{attachedTrack.artist}</p>
                                        </div>
                                        <button
                                            onClick={() => { setAttachedTrack(null); setTrackSearch(''); }}
                                            className="text-[var(--accent-secondary)] hover:text-red-400 text-xs"
                                        >
                                            remove
                                        </button>
                                    </div>
                                )}
                            </div>
                        <button
                            onClick={handleCreateForum}
                            className="bg-[var(--accent-primary)] text-white px-6 py-2 rounded-xl hover:opacity-90"
                        >
                            Post
                        </button>
                    </div>
                )}

                {loading && (
                    <p className= "text-center text-[var(--accent-secondary)] mt-12">
                        Loading forums...
                    </p>
                )}

                {!loading && forums.length === 0 && searchQuery && (
                    <p className="text-center text-[var(--accent-secondary)] mt-12">
                        No forums found for "{searchQuery}"
                    </p>
                )}

                {!loading && forums.length === 0 && !searchQuery && (
                    <p className="text-center text-[var(--accent-secondary)] mt-12">
                        No forums yet. Be the first to post!
                    </p>
                )}

                {sortedForums.map(forum => (
                    <ForumCard
                        key={forum.id}
                        forum={forum}
                        userId={userProfile?.id}
                        onSelect={handleSelectForum}
                        onLike={(e, id) => handleLike(id)}
                        onDelete={handleDeleteForum} 
                    />
                ))}
            </div>
        </div>
    );
}