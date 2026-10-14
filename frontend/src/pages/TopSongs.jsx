import { useTopSongs } from "../features/music/useTopSongs";
import TopSongFeatured from "../features/music/TopSongFeatured";
import TopSongCard from "../features/music/TopSongCard";
import "../styling/TopSongs.css";

const TERM_LABELS = {
    short_term: "Last 4 weeks",
    medium_term: "Last year",
    long_term: "All time",
};

export default function TopSongs() {
    const { timeRange, setTimeRange, data, isPending, isError, songs } = useTopSongs();

    const top = songs[0];
    const rest = songs.slice(1);

    if (isPending) return (
        <div className="loading-container">
            <p className="loading-text">Loading your top songs...</p>
        </div>
    );

    if (isError && !data) return <p role="alert">Could not load your top songs.</p>;

    return (
        <div className="top-artists-container">
            <div className="header-container">
                <h1 className="header-title">Top Songs</h1>
                <div className="select-wrapper">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="term-select"
                    >
                        {Object.entries(TERM_LABELS).map(([key, label]) => (
                            <option key={key} value={key} className="term-option">
                                {label}
                            </option>
                        ))}
                    </select>
                    <span className="select-arrow">▾</span>
                </div>
            </div>

            {songs.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--accent-secondary)', marginTop: '48px' }}>
                    No top songs found for this time range.
                </p>
            ) : (
                <>
                    {/* Featured #1 song */}
                    {top && <TopSongFeatured top={top} />}

                    {/* Rest of the songs grid */}
                    <div className="artists-grid">
                        {rest.map((track, i) => (
                            <TopSongCard key={track.id} track={track} i={i} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
