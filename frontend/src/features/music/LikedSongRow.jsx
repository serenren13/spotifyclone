import { getDecade, formatDuration } from "./musicUtils";

export default function LikedSongRow({ item, index, isMobile }) {
    return (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? '10px' : '16px',
                            padding: isMobile ? '10px 8px' : '10px 12px',
                            borderRadius: '10px',
                            borderBottom: '1px solid rgba(var(--accent-secondary-rgb, 107,101,128), 0.15)',
                            transition: 'background 0.15s',
                            cursor: 'default',
                            // Prevent any horizontal overflow
                            minWidth: 0,
                            overflow: 'hidden',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-dark, rgba(255,255,255,0.04))'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        {/* Index number — hidden on mobile to save space */}
                        {!isMobile && (
                            <span style={{ color: 'var(--accent-secondary)', fontSize: '12px', width: '24px', textAlign: 'right', flexShrink: 0 }}>
                                {index + 1}
                            </span>
                        )}

                        {/* Album art */}
                        <img
                            src={item.track.album.images[2]?.url}
                            alt={item.track.album.name}
                            style={{
                                width: isMobile ? '36px' : '40px',
                                height: isMobile ? '36px' : '40px',
                                borderRadius: '6px',
                                flexShrink: 0,
                            }}
                        />

                        {/* Track name + artists — takes remaining space */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <a
                                href={item.track.external_urls.spotify}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                    display: 'block',
                                    fontWeight: '500',
                                    fontSize: isMobile ? '13px' : '14px',
                                    color: 'var(--text-primary)',
                                    textDecoration: 'none',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.textDecoration = 'underline'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.textDecoration = 'none'; }}
                            >
                                {item.track.name}
                            </a>
                            <p style={{ fontSize: '12px', color: 'var(--accent-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.track.artists.map((a, i) => (
                                    <span key={a.id}>
                                        <a
                                            href={a.external_urls?.spotify}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{ color: 'var(--accent-secondary)', textDecoration: 'none' }}
                                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-primary)'; e.currentTarget.style.textDecoration = 'underline'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--accent-secondary)'; e.currentTarget.style.textDecoration = 'none'; }}
                                        >
                                            {a.name}
                                        </a>
                                        {i < item.track.artists.length - 1 ? ', ' : ''}
                                    </span>
                                ))}
                            </p>
                        </div>

                        {/* Album name — desktop only */}
                        {!isMobile && (
                            <p style={{ fontSize: '12px', color: 'var(--accent-secondary)', flexShrink: 0, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.track.album.name}
                            </p>
                        )}

                        {/* Decade badge — desktop only */}
                        {!isMobile && (
                            <span style={{ fontSize: '11px', color: 'var(--accent-secondary)', flexShrink: 0, background: 'var(--bg-surface, rgba(255,255,255,0.06))', padding: '2px 7px', borderRadius: '10px' }}>
                                {getDecade(item.track.album.release_date)}
                            </span>
                        )}

                        {/* Duration */}
                        <p style={{ fontSize: '12px', color: 'var(--accent-secondary)', flexShrink: 0, width: '40px', textAlign: 'right' }}>
                            {formatDuration(item.track.duration_ms)}
                        </p>

                        {/* Date added — desktop only */}
                        {!isMobile && (
                            <p style={{ fontSize: '11px', color: 'var(--accent-secondary)', flexShrink: 0, width: '88px', textAlign: 'right' }}>
                                {new Date(item.added_at).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric'
                                })}
                            </p>
                        )}
                    </div>

    );
}
