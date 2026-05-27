import { useState } from "react";
import "../../styling/TopArtists.css"; 

export default function ArtistAvatar({ artist, size, style = {} }) {
  const [imgError, setImgError] = useState(false);
  const initials = artist.name
    ? artist.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  return (
    <div
      className="artist-avatar-container"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        ...style,
      }}
    >
      {imgError || !artist.images?.[0]?.url ? (
        initials
      ) : (
        <img
          src={artist.images[0].url}
          alt={artist.name}
          onError={() => setImgError(true)}
          className="artist-avatar-img"
        />
      )}
    </div>
  );
}