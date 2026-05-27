import LikeButton from './LikeButton';

export default function CommentCard({ comment, userId, onLike }) {
    return (
        <div className="bg-[var(--bg-dark)] rounded-xl p-4 mb-3 border border-[var(--accent-secondary)]/20">
            <p className="text-sm font-semibold text-[var(--accent-primary)] mb-1">{comment.authorId}</p>
            <p className="text-[var(--text-light)] mb-2">{comment.comment}</p>
            <div className="flex justify-end">
                <LikeButton
                    likes={comment.likes || 0}
                    likedBy={comment.likedBy || []}
                    userId={userId}
                    onLike={(e) => onLike(e, comment.id)}
                />
            </div>
        </div>
    );
}