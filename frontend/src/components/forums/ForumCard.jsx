import LikeButton from './LikeButton';
import { Link } from 'react-router-dom';

export default function ForumCard({ forum, userId, onSelect, onLike, onDelete }) {
    return (
        <div
            onClick={() => onSelect(forum)}
            className="bg-[var(--bg-dark)] rounded-2xl p-6 mb-4 border border-[var(--accent-secondary)]/20 cursor-pointer hover:border-[var(--accent-primary)]/50 transition-all"
        >
            <h2 className="text-xl font-semibold mb-2">{forum.title}</h2>
            <p className="text-xs text-[var(--accent-secondary)] mb-2">
                {forum.createdAt?.toDate?.()?.toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric'
                })}
            </p>
            <div className="text-[var(--text-light)] text-sm mb-4 line-clamp-2" dangerouslySetInnerHTML={{ __html: forum.content }} />
            {forum.attachedTrack && (
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open(forum.attachedTrack.spotifyUrl, '_blank');
                    }}
                    className="flex items-center gap-2 p-2 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 rounded-lg mb-3 hover:opacity-80 cursor-pointer"
                >
                    <img src={forum.attachedTrack.albumArt} alt={forum.attachedTrack.name} className="w-8 h-8 rounded" />
                    <div>
                        <p className="text-xs font-medium">{forum.attachedTrack.name}</p>
                        <p className="text-xs text-[var(--accent-secondary)]">{forum.attachedTrack.artist}</p>
                    </div>
                    <span className="ml-auto text-xs text-[var(--accent-primary)]">🎵</span>
                </div>
            )}
            <div className="flex items-center justify-between text-sm text-[var(--accent-secondary)]">
                <span>
                    by{" "}
                    <Link
                        to={`/user/${forum.creatorId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[var(--accent-primary)] hover:underline"
                    >
                        {forum.createdBy}
                    </Link>
                </span>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs text-[var(--accent-secondary)]">
                        💬 {forum.commentCount || 0}
                    </span>
                    {userId === forum.creatorId && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(forum.id);
                            }}
                            className="text-red-400 hover:text-red-500 text-xs"
                        >
                            delete
                        </button>
                    )}
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
        </div>
    );
}