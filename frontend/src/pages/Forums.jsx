import { useState, useEffect } from 'react';
import { useSpotify } from '../context/SpotifyContext';
import axios from 'axios';

const backendAPI = axios.create({
    baseURL: 'http://127.0.0.1:5001/api',
});

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

    // fetch all forums on load
    useEffect(() => {
        fetchForums();
    }, []);

    const fetchForums = async () => {
        try {
            const res = await backendAPI.get('/forums');
            setForums(res.data);
        } catch (err) {
            console.error('Error fetching forums:', err);
        }
    };

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        try {
            const res = await backendAPI.get(`/forums?search=${query}`);
            setForums(res.data);
        } catch (err) {
            console.error('Error searching forums:', err);
        }
    };

    const handleCreateForum = async () => {
        if (!newTitle.trim() || !newContent.trim()) return;
        try {
            await backendAPI.post('/forums', {
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
            const res = await backendAPI.get(`/forums/${forum.id}/comments`);
            setComments(res.data);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        try {
            await backendAPI.post(`/forums/${selectedForum.id}/comments`, {
                authorId: userProfile?.display_name || 'Anonymous',
                comment: newComment,
            });
            setNewComment('');
            handleSelectForum(selectedForum);
        } catch (err) {
            console.error('Error adding comment:', err);
        }
    };

    const handleLike = async (forumId) => {
        try {
            await backendAPI.patch(`/forums/${forumId}/like/1`);
            fetchForums();
        } catch (err) {
            console.error('Error liking forum:', err);
        }
    };

    // forum detail view
    if (selectedForum) {
        return (
            <div style={{ padding: '2rem', color: 'var(--color-almond-silk)' }}>
                <button onClick={() => setSelectedForum(null)}>← Back</button>
                <h1>{selectedForum.title}</h1>
                <p>{selectedForum.content}</p>
                <p>by {selectedForum.createdBy} · {selectedForum.likes} likes</p>
                <button onClick={() => handleLike(selectedForum.id)}>❤️ Like</button>

                <h2>Comments</h2>
                {comments.map(c => (
                    <div key={c.id} style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid #333' }}>
                        <strong>{c.authorId}</strong>
                        <p>{c.comment}</p>
                    </div>
                ))}

                <div style={{ marginTop: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                    />
                    <button onClick={handleAddComment}>Post Comment</button>
                </div>
            </div>
        );
    }

    // forum list view
    return (
        <div style={{ padding: '2rem', color: 'var(--color-almond-silk)' }}>
            <h1>Forums</h1>

            <input
                type="text"
                placeholder="Search forums..."
                value={searchQuery}
                onChange={handleSearch}
                style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem' }}
            />

            <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: '1rem' }}>
                {showForm ? 'Cancel' : '+ New Post'}
            </button>

            {showForm && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <input
                        type="text"
                        placeholder="Title"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                    />
                    <textarea
                        placeholder="What's on your mind?"
                        value={newContent}
                        onChange={e => setNewContent(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }}
                    />
                    <button onClick={handleCreateForum}>Post</button>
                </div>
            )}

            {forums.map(forum => (
                <div
                    key={forum.id}
                    onClick={() => handleSelectForum(forum)}
                    style={{ padding: '1rem', marginBottom: '1rem', border: '1px solid #444', cursor: 'pointer' }}
                >
                    <h2>{forum.title}</h2>
                    <p>{forum.content}</p>
                    <p>by {forum.createdBy} · ❤️ {forum.likes}</p>
                </div>
            ))}
        </div>
    );
}