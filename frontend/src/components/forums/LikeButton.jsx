export default function LikeButton({ likes, likedBy, userId, onLike }) {
    const isLiked = likedBy?.includes(userId);
    return (
        <button
            onClick={onLike}
            className="flex items-center gap-1 hover:opacity-80"
            style={{ color: isLiked ? 'var(--accent-primary)' : 'var(--accent-secondary)' }}
        >
            {isLiked ? '❤️' : '🤍'} {likes}
        </button>
    );
}