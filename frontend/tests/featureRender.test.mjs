import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

test("extracted feature components render the established content and classes", async () => {
    const vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
    try {
        const load = async (path) => (await vite.ssrLoadModule(path)).default;
        const [LikedSongRow, TopSongFeatured, TopArtistFeatured, ProfileMusicSections, FavoriteSongsModal, PublicProfileMusicSections, DiscoverUsers] =
            await Promise.all([
                load("/src/features/music/LikedSongRow.jsx"),
                load("/src/features/music/TopSongFeatured.jsx"),
                load("/src/features/music/TopArtistFeatured.jsx"),
                load("/src/features/profile/ProfileMusicSections.jsx"),
                load("/src/features/profile/FavoriteSongsModal.jsx"),
                load("/src/features/profile/PublicProfileMusicSections.jsx"),
                load("/src/features/discover/DiscoverUsers.jsx"),
            ]);

        const track = {
            id: "track-1", name: "Example Song", duration_ms: 185000,
            external_urls: { spotify: "https://open.spotify.com/track/track-1" },
            artists: [{ id: "artist-1", name: "Example Artist", external_urls: { spotify: "https://open.spotify.com/artist/artist-1" } }],
            album: { name: "Example Album", release_date: "1995-01-01", images: [{ url: "cover" }, {}, { url: "small-cover" }] },
        };
        const artist = { id: "artist-1", name: "Example Artist", images: [{ url: "portrait" }], external_urls: { spotify: "https://open.spotify.com/artist/artist-1" } };

        const row = renderToStaticMarkup(createElement(LikedSongRow, {
            item: { track, added_at: "2024-01-01" }, index: 0, isMobile: false,
        }));
        assert.match(row, /Example Song/);
        assert.match(row, /Example Album/);
        assert.match(row, /3:05/);

        const featuredSong = renderToStaticMarkup(createElement(TopSongFeatured, { top: track }));
        assert.match(featuredSong, /featured-artist/);
        assert.match(featuredSong, /Listen on Spotify/);

        const featuredArtist = renderToStaticMarkup(createElement(TopArtistFeatured, { top: artist }));
        assert.match(featuredArtist, /art-featured-container/);
        assert.match(featuredArtist, /Example Artist/);

        const profile = renderToStaticMarkup(createElement(ProfileMusicSections, {
            topArtists: [], topSongs: [], displayFavorites: [], handleOpenFavoritesModal: () => {},
        }));
        assert.match(profile, /No top artists found/);
        assert.match(profile, /No favorites selected/);

        const favoritesModal = renderToStaticMarkup(createElement(FavoriteSongsModal, {
            tempSelectedFavorites: [track.id], allLikedSongs: [{ track }],
            handleToggleFavoriteSelection: () => {}, setIsEditingFavorites: () => {},
            handleSaveFavorites: () => {},
        }));
        assert.match(favoritesModal, /Pick Your Favorite Songs/);
        assert.match(favoritesModal, /Example Song/);
        assert.match(favoritesModal, /Save Selection/);

        const publicProfile = renderToStaticMarkup(createElement(PublicProfileMusicSections, {
            topArtists: [], topSongs: [], favoriteTracks: [],
        }));
        assert.match(publicProfile, /Current Favorites/);
        assert.match(publicProfile, /No songs to display yet/);

        const discover = renderToStaticMarkup(createElement(DiscoverUsers, {
            filteredUsers: [], searchText: "", setSearchText: () => {}, status: "",
        }));
        assert.match(discover, /discover-main-panel/);
        assert.match(discover, /Discover Users/);
    } finally {
        await vite.close();
    }
});
