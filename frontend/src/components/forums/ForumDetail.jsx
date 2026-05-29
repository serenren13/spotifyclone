import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSpotify } from '../../context/SpotifyContext';
import { useComments } from './useComments';
import Comment from './Comment';
import LikeButton from './LikeButton';
import SaveTrackButton from './SaveTrackButton';

export default function ForumDetail({ forum, onBack, onDelete, onLike, onForumUpdated }) {
    const { userProfile } = useSpotify();
    const {
        commentTree,
        newComment,
        replyingTo,
        setNewComment,
        setReplyingTo,
        fetchComments,
        handleAddComment,
        handleDeleteComment,
        handleCommentLike,
    } = useComments(forum.id);

    useEffect(() => {
        fetchComments(forum.id);
    }, [forum.id]);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-8">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={onBack}
                    className="mb-6 text-[var(--accent-primary)] hover:opacity-80 flex items-center gap-2"
                >
                    ← Back to Forums
                </button>

                <div className="bg-[var(--bg-dark)] rounded-2xl p-6 mb-6 border border-[var(--accent-secondary)]/20">
                    <h1 className="text-2xl font-bold mb-2">{forum.title}</h1>
                    <p className="text-xs text-[var(--accent-secondary)] mb-2">
                        {forum.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                        })}
                    </p>
                    <div
                        className="text-[var(--text-light)] mb-4"
                        dangerouslySetInnerHTML={{ __html: forum.content }}
                    />
                    {forum.attachedTrack && (
                        <div className="flex items-center gap-3 p-3 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 rounded-xl mb-4">
                            <a
                                href={forum.attachedTrack.spotifyUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-3 flex-1 hover:opacity-80 transition-all"
                            >
                                <img
                                    src={forum.attachedTrack.albumArt}
                                    alt={forum.attachedTrack.name}
                                    className="w-12 h-12 rounded"
                                />
                                <div>
                                    <p className="text-xs text-[var(--accent-primary)] mb-0.5">🎵 Attached Track</p>
                                    <p className="text-sm font-medium">{forum.attachedTrack.name}</p>
                                    <p className="text-xs text-[var(--accent-secondary)]">{forum.attachedTrack.artist}</p>
                                </div>
                            </a>
                            <SaveTrackButton trackId={forum.attachedTrack.id} />
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-[var(--accent-secondary)]">
                            by{" "}
                            <Link
                                to={`/user/${forum.creatorId}`}
                                className="text-[var(--accent-primary)] hover:underline"
                            >
                                {forum.createdBy}
                            </Link>
                            {userProfile?.id === forum.creatorId && (
                                <button
                                    onClick={() => {
                                        onDelete(forum.id);
                                        onBack();
                                    }}
                                    className="ml-3 text-red-400 hover:text-red-500 text-xs"
                                >
                                    delete
                                </button>
                            )}
                        </span>
                        <LikeButton
                            likes={forum.likes || 0}
                            likedBy={forum.likedBy || []}
                            userId={userProfile?.id}
                            onLike={(e) => {
                                e.stopPropagation();
                                onLike(forum.id, onForumUpdated);
                            }}
                        />
                    </div>
                </div>

                <h2 className="text-lg font-semibold mb-4">Comments</h2>

                {commentTree.length === 0 && (
                    <p className="text-[var(--accent-secondary)] text-sm mb-4">
                        No comments yet. Be the first!
                    </p>
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
                            <span>
                                Replying to{" "}
                                <span className="text-[var(--accent-primary)]">
                                    {replyingTo.authorName || replyingTo.authorId}
                                </span>
                            </span>
                            <button
                                onClick={() => setReplyingTo(null)}
                                className="ml-auto hover:text-red-400"
                            >
                                x
                            </button>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder={
                                replyingTo
                                    ? `Reply to ${replyingTo.authorName || replyingTo.authorId}...`
                                    : 'Add a comment...'
                            }
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleAddComment(); }}
                            className="flex-1 bg-[var(--bg-dark)] border border-[var(--accent-secondary)]/30 rounded-xl px-4 py-2 text-[var(--text-primary)] placeholder-[var(--accent-secondary)] focus:outline-none"
                        />
                        <button
                            onClick={handleAddComment}
                            className="bg-[var(--brand-color)] text-white px-4 py-2 rounded-xl hover:opacity-90"
                        >
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}