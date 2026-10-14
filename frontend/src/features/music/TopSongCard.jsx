import { formatDuration } from "./musicUtils";

export default function TopSongCard({ track, i }) {
    return (
                            <div className="artist-card">
                                <div className="avatar-wrapper">
                                    <img
                                        src={track.album?.images?.[1]?.url || track.album?.images?.[0]?.url}
                                        alt={track.album?.name}
                                        style={{ width: '120px', height: '120px', borderRadius: '8px', display: 'block' }}
                                    />
                                    <p className="rank-badge">{i + 2}</p>
                                </div>
                                <div className="artist-info">
                                    <p className="artist-name">
                                        <a
                                            href={track.external_urls?.spotify}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ color: 'inherit', textDecoration: 'none' }}
                                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.textDecoration = 'underline'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'inherit'; e.currentTarget.style.textDecoration = 'none'; }}
                                        >
                                            {track.name}
                                        </a>
                                        {track.explicit && (
                                            <span style={{ fontSize: '9px', background: 'var(--accent-secondary)', color: 'var(--bg-primary)', padding: '1px 4px', borderRadius: '3px', fontWeight: 700, marginLeft: '6px', verticalAlign: 'middle' }}>E</span>
                                        )}
                                    </p>
                                    <a
                                        href={track.artists?.[0]?.external_urls?.spotify}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="spotify-link-grid"
                                    >
                                        {track.artists?.map(a => a.name).join(", ")}
                                    </a>
                                    <span className="spotify-link-grid" style={{ marginTop: '2px' }}>
                                        {formatDuration(track.duration_ms)}
                                    </span>
                                </div>
                            </div>

    );
}
