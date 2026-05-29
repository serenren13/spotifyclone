import { useState } from 'react';
import { Link } from 'react-router-dom';
import LikeButton from './LikeButton';

export default function Comment({ comment, userId, onLike, onReply, onDelete, maxDepth = 2 }) {
    const [showReplies, setShowReplies] = useState(true);

    return (
        <div className={`${comment.depth > 0 ? 'ml-6 border-l border-[var(--accent-secondary)]/20 pl-4' : ''}`}>
            <div className="bg-[var(--bg-dark)] rounded-xl p-4 mb-2 border border-[var(--accent-secondary)]/20">
                <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-[var(--accent-primary)]">
                        <Link to={`/user/${comment.authorId}`} className="hover:underline">
                            {comment.authorName || comment.authorId}
                        </Link>
                    </p>
                    <div className="flex items-center gap-2">
                        {userId === comment.authorId && (
                            <button 
                                onClick={() => onDelete(comment.id)}
                                className="text-red-400 hover:text-red-500 text-xs"
                            >
                                delete
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-xs text-[var(--accent-secondary)] mb-1">
                    {comment.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                    })}
                </p>
                <p className="text-[var(--text-light)] mb-2">{comment.comment}</p>
                <div className="flex items-center justify-between">
                    {comment.depth < maxDepth && (
                        <button
                            onClick={() => onReply(comment)}
                            className="text-xs text-[var(--accent-secondary)] hover:text-[var(--accent-primary)]"
                        >
                            Reply
                        </button>
                    )}
                    <LikeButton
                        likes={comment.likes || 0}
                        likedBy={comment.likedBy || []}
                        userId={userId}
                        onLike={(e) => onLike(e, comment.id)}
                    />
                </div>
            </div>

            {comment.replies?.length > 0 && (
                <>
                    <button
                        onClick={() => setShowReplies(!showReplies)}
                        className="text-xs text-[var(--accent-secondary)] hover:text-[var(--accent-primary)] mb-2 ml-2"
                    >
                        {showReplies ? 'Hide replies' : `▶ ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}`}
                    </button>
                    {showReplies && comment.replies.map(reply => (
                        <Comment
                            key={reply.id}
                            comment={reply}
                            userId={userId}
                            onLike={onLike}
                            onReply={onReply}
                            onDelete={onDelete}
                            maxDepth={maxDepth}
                        />
                    ))}
                </>
            )}
        </div>
    );
}