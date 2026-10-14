import { useLikedSongs } from "../features/music/useLikedSongs";
import { DECADES } from "../features/music/musicUtils";
import LikedSongRow from "../features/music/LikedSongRow";
import "../styling/TopArtists.css";

export default function LikedSongs() {
    const {
        searchQuery, setSearchQuery, sortOrder, setSortOrder,
        selectedDecade, setSelectedDecade, isMobile,
        filteredSongs, isPending, isError, data,
    } = useLikedSongs();

    if (isPending) return (
        <div className="loading-container">
            <p className="loading-text">Loading your liked songs...</p>
        </div>
    );

    if (isError && !data) return <p role="alert">Could not load your liked songs.</p>;

    return (
        <div className="top-artists-container">
            {/* Header */}
            <div className="header-container" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h1 className="header-title">Liked Songs</h1>
                    <p style={{ color: 'var(--accent-secondary)', fontSize: '13px', marginTop: '4px' }}>
                        {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'}
                        {searchQuery || selectedDecade !== 'All' ? ' matching filters' : ' · most recent 300'}
                    </p>
                </div>

                <div className="select-wrapper">
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="term-select"
                    >
                        <option value="newest" className="term-option">Recently Added</option>
                        <option value="oldest" className="term-option">Oldest First</option>
                    </select>
                    <span className="select-arrow">▾</span>
                </div>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '16px' }}>
                <input
                    type="text"
                    placeholder="🔍 Search by song or artist..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                        width: '100%',
                        background: 'var(--bg-dark, rgba(255,255,255,0.06))',
                        border: '1px solid var(--accent-secondary, #6b6580)',
                        borderRadius: '20px',
                        padding: '10px 18px',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box',
                    }}
                />
            </div>

            {/* Decade filter */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
                {DECADES.map(decade => (
                    <button
                        key={decade}
                        onClick={() => setSelectedDecade(decade)}
                        style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                            background: selectedDecade === decade ? 'var(--accent-primary)' : 'var(--bg-surface, rgba(255,255,255,0.06))',
                            color: selectedDecade === decade ? 'var(--text-on-brand, #fff)' : 'var(--accent-secondary)',
                            fontWeight: selectedDecade === decade ? '600' : '400',
                        }}
                    >
                        {decade}
                    </button>
                ))}
            </div>

            {/* Song list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {filteredSongs.length === 0 && (
                    <p style={{ color: 'var(--accent-secondary)', textAlign: 'center', marginTop: '48px' }}>
                        No songs match your filters.
                    </p>
                )}
                {filteredSongs.map((item, index) => (
                    <LikedSongRow key={item.track.id} item={item} index={index} isMobile={isMobile} />
                ))}
            </div>
        </div>
    );
}
