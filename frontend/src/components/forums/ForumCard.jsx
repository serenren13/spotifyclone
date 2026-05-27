import LikeButton from './LikeButton';

export default function ForumCard({ forum, userId, onSelect, onLike }) {
    return (
        <div
            onClick={() => onSelect(forum)}
            className="bg-[var(--bg-dark)] rounded-2xl p-6 mb-4 border border-[var(--accent-secondary)]/20 cursor-pointer hover:border-[var(--accent-primary)]/50 transition-all"
        >
            <h2 className="text-xl font-semibold mb-2">{forum.title}</h2>
            <p className="text-[var(--text-light)] text-sm mb-4 line-clamp-2">{forum.content}</p>
            <div className="flex items-center justify-between text-sm text-[var(--accent-secondary)]">
                <span>by {forum.createdBy}</span>
                <LikeButton
                    likes={forum.likes}
                    likedBy={forum.likedBy}
                    userId={userId}
                    onLike={(e) => {
                        e.stopPropagation();
                        onLike(e, forum.id);
                    }}
                />
            </div>
        </div>
    );
}