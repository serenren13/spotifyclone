import ArtistAvatar from "./ArtistAvatar";

export default function TopArtistFeatured({ top }) {
    return (
        <div className="art-featured-container">
          <p className="art-featured-badge">#1 this period</p>

          <div className="art-featured-avatar-ring">
            <ArtistAvatar
              artist={top}
              size={160}
            />
            <div className="art-featured-rank-badge">1</div>
          </div>

          <h2 className="art-featured-name">
            <a href={top.external_urls.spotify} target="_blank" rel="noreferrer">
              {top.name}
            </a>
          </h2>
          <a href={top.external_urls.spotify} target="_blank" rel="noreferrer" className="art-spotify-link-muted">
            Listen on Spotify
          </a>
        </div>

    );
}
