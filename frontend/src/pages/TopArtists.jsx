import TopArtistFeatured from "../features/music/TopArtistFeatured";
import TopArtistCard from "../features/music/TopArtistCard";
import { useTopArtists } from "../features/music/useTopArtists";
import "../styling/TopArtists.css";

const TERM_LABELS = {
  short_term: "Last 4 weeks",
  medium_term: "Last 6 months",
  long_term: "All time",
};

export default function TopArtists() {
  const { term, setTerm, data, isPending, isError, artists } = useTopArtists();
  const top = artists[0];
  const rest = artists.slice(1, 21);

  if (isPending) return (
    <div className="art-loading-container">
      <p className="art-loading-text">Loading your top artists...</p>
    </div>
  );

  if (isError && !data) return <p role="alert">Could not load your top artists.</p>;

  return (
    <div className="art-page-container">
      <div className="art-header-container">
        <h1 className="art-header-title">Top Artists</h1>

        <div className="art-select-wrapper">
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="art-term-select"
          >
            {Object.entries(TERM_LABELS).map(([key, label]) => (
              <option key={key} value={key} className="art-term-option">
                {label}
              </option>
            ))}
          </select>
          <span className="art-select-arrow">▾</span>
        </div>
      </div>

      {top && <TopArtistFeatured top={top} />}

      {artists.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <p style={{ color: 'var(--accent-secondary)' }}>No top artists found for this time period.</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginTop: '0.5rem' }}>Go listen to some music on Spotify and come back!</p>
        </div>
      )}

      <div className="art-grid-container">
        {rest.map((artist, i) => (
          <TopArtistCard key={artist.id ?? artist.name} artist={artist} i={i} />
        ))}
      </div>
    </div>
  );
}
