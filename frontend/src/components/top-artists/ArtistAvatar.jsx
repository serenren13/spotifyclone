import { useState } from "react";

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
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        flexShrink: 0,
        background: "var(--brand-color)", 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.35,
        fontWeight: 600,
        color: "var(--text-on-brand)",
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
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      )}
    </div>
  );
}