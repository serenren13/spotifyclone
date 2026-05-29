import { useState } from 'react';
import { useForums } from './useForums';
import { useTrackSearch } from './useTrackSearch';
import ForumCard from './ForumCard';
import RichTextEditor from './RichTextEditor';
import ConfirmationModal from './ConfirmationModal';
import { useSpotify } from '../../context/SpotifyContext';

export default function ForumList({ onSelect }) {
    const { userProfile } = useSpotify();
    const {
        forums,
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
    } = useForums();

    const {
        trackSearch,
        trackResults,
        attachedTrack,
        handleTrackSearch,
        selectTrack,
        clearTrack,
    } = useTrackSearch();

    const [showForm, setShowForm] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');

    const onSubmit = () => {
        handleCreateForum({
            title: newTitle,
            content: newContent,
            attachedTrack,
            onSuccess: () => {
                setNewTitle('');
                setNewContent('');
                setShowForm(false);
                clearTrack();
            },
        });
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-8">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Forums</h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-[var(--brand-color)] text-white px-4 py-2 rounded-xl hover:opacity-90"
                    >
                        {showForm ? 'Cancel' : '+ New Post'}
                    </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-[var(--accent-secondary)]">Sort by:</span>
                    <button
                        onClick={() => setSortOrder('newest')}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                            sortOrder === 'newest'
                                ? 'bg-[var(--brand-color)] text-white'
                                : 'bg-[var(--bg-dark)] text-[var(--accent-secondary)] hover:opacity-80'
                        }`}
                    >
                        Newest
                    </button>
                    <button
                        onClick={() => setSortOrder('liked')}
                        className={`px-3 py-1 rounded-full text-sm transition-all ${
                            sortOrder === 'liked'
                                ? 'bg-[var(--brand-color)] text-white'
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
                        <RichTextEditor content={newContent} onChange={setNewContent} />
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
                                            onClick={() => selectTrack(track)}
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
                                        onClick={clearTrack}
                                        className="text-[var(--accent-secondary)] hover:text-red-400 text-xs"
                                    >
                                        remove
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onSubmit}
                            className="bg-[var(--brand-color)] text-white px-6 py-2 rounded-xl hover:opacity-90"
                        >
                            Post
                        </button>
                    </div>
                )}

                {loading && (
                    <p className="text-center text-[var(--accent-secondary)] mt-12">
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

                {forums.map(forum => (
                    <ForumCard
                        key={forum.id}
                        forum={forum}
                        userId={userProfile?.id}
                        onSelect={onSelect}
                        onLike={(e, id) => handleLike(id)}
                        onDelete={handleDeleteForum}
                    />
                ))}

                <ConfirmationModal
                    isOpen={deleteConfirm.isOpen}
                    title="Delete Post?"
                    message="This post and all its comments will be permanently deleted. This action cannot be undone."
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                    confirmText="Delete"
                    cancelText="Cancel"
                    isDangerous={true}
                />
            </div>
        </div>
    );
}