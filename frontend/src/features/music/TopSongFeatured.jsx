import { formatDuration } from "./musicUtils";

export default function TopSongFeatured({ top }) {
    return (
                        <div className="featured-artist">
                            <p className="featured-badge">#1 this period</p>
                            <div className="featured-avatar-ring" style={{ borderRadius: '12px' }}>
                                <img
                                    src={top.album?.images?.[1]?.url || top.album?.images?.[0]?.url}
                                    alt={top.album?.name}
                                    style={{ width: '160px', height: '160px', borderRadius: '10px', display: 'block' }}
                                />
                                <div className="featured-rank-badge">1</div>
                            </div>
                            <h2 className="featured-name">
                                <a
                                    href={top.external_urls?.spotify}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: 'inherit', textDecoration: 'none' }}
                                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.textDecoration = 'underline'; }}
                                    onMouseLeave={e => { e.currentTarget.style.color = 'inherit'; e.currentTarget.style.textDecoration = 'none'; }}
                                >
                                    {top.name}
                                </a>
                                {top.explicit && (
                                    <span style={{ fontSize: '10px', background: 'var(--accent-secondary)', color: 'var(--bg-primary)', padding: '2px 5px', borderRadius: '3px', fontWeight: 700, marginLeft: '8px', verticalAlign: 'middle' }}>E</span>
                                )}
                            </h2>
                            <p style={{ color: 'var(--accent-secondary)', fontSize: '14px', marginBottom: '4px' }}>
                                {top.artists?.map((a, i) => (
                                    <span key={a.id}>
                                        <a
                                            href={a.external_urls?.spotify}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="spotify-link-muted"
                                        >
                                            {a.name}
                                        </a>
                                        {i < top.artists.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                            </p>
                            <a
                                href={top.external_urls?.spotify}
                                target="_blank"
                                rel="noreferrer"
                                className="spotify-link-muted"
                            >
                                Listen on Spotify · {formatDuration(top.duration_ms)}
                            </a>
                        </div>
    );
}
