import ArtistAvatar from "./ArtistAvatar";

export default function TopArtistCard({ artist, i }) {
    return (
          <div className="art-card">
            <div className="art-avatar-wrapper">
              <ArtistAvatar artist={artist} size={120} />
              <p className="art-rank-badge">{i + 2}</p>
            </div>

            <div className="art-info-wrapper">
              <p className="art-name-heading">
                <a href={artist.external_urls.spotify} target="_blank" rel="noreferrer">
                  {artist.name}
                </a>
              </p>
              <a href={artist.external_urls.spotify} target="_blank" rel="noreferrer" className="art-spotify-link-grid">
                Listen on Spotify
              </a>
            </div>
          </div>

    );
}
