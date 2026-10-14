export const DECADES = ["All", "70s", "80s", "90s", "00s", "10s", "20s"];

export const getDecade = (releaseDate) => {
    if (!releaseDate) return null;
    const year = parseInt(releaseDate.slice(0, 4));
    if (year < 1980) return "70s";
    if (year < 1990) return "80s";
    if (year < 2000) return "90s";
    if (year < 2010) return "00s";
    if (year < 2020) return "10s";
    return "20s";
};

export const formatDuration = (ms) =>
    `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

export function filterLikedSongs(items, searchQuery, selectedDecade, sortOrder) {
    let result = items;

    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        result = result.filter(item =>
            item.track.name.toLowerCase().includes(q) ||
            item.track.artists.some(a => a.name.toLowerCase().includes(q))
        );
    }

    if (selectedDecade !== 'All') {
        result = result.filter(item =>
            getDecade(item.track.album.release_date) === selectedDecade
        );
    }

    if (sortOrder === 'oldest') {
        result = [...result].reverse();
    }

    return result;
}
