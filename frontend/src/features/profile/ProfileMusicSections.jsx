export default function ProfileMusicSections({ topArtists, topSongs, displayFavorites, handleOpenFavoritesModal }) {
    return (
                <div className="w-full md:w-2/3 flex flex-col">
                    <div className="mb-12 border-b border-[var(--text-primary)]/20 pb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-medium">Top Artists</h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {topArtists.map(artist => (
                                <div key={artist.id} className="flex flex-col items-center text-center group min-w-0">
                                    <div className="w-24 h-24 rounded-full bg-[var(--bg-dark)] mb-3 overflow-hidden border-2 border-transparent transition-all flex-shrink-0">
                                        <img
                                            src={artist.image || artist.images?.[1]?.url || artist.images?.[0]?.url || "https://via.placeholder.com/150"}
                                            alt={artist.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <p className="font-medium text-sm truncate w-full px-2">{artist.name}</p>
                                </div>
                            ))}
                            {topArtists.length === 0 && <p className="col-span-4 text-[var(--accent-secondary)] text-sm">No top artists found.</p>}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-medium">Top Songs</h3>
                            </div>
                            {/* UPDATED: Added rounded-xl and overflow-hidden to the track container */}
                            <div className="border border-[var(--text-primary)]/30 flex flex-col bg-[var(--bg-dark)] rounded-xl overflow-hidden shadow-sm">
                                {topSongs.map(song => (
                                    <div key={song.id} className="flex border-b border-[var(--text-primary)]/30 last:border-0 h-16 hover:bg-[var(--text-primary)]/5 transition-colors">
                                        <div className="w-16 h-full border-r border-[var(--text-primary)]/30 flex-shrink-0">
                                            <div className="w-16 h-full border-r border-[var(--text-primary)]/30 flex-shrink-0">
                                            {/* Checks for Firebase schema first, falls back to Spotify schema, then placeholder */}
                                            <img
                                                src={song.albumArt || song.album?.images?.[2]?.url || song.album?.images?.[0]?.url || "https://via.placeholder.com/150"}
                                                alt="Cover"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center px-3 min-w-0 overflow-hidden">
                                            <p className="text-sm truncate w-full font-medium">{song.name}</p>
                                            {/* Checks for Firebase artist first, falls back to raw Spotify artists array */}
                                            <p className="text-xs text-[var(--accent-secondary)] truncate">
                                                {song.artist || song.artists?.map(a => a.name).join(", ")}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-medium">Favorite Songs</h3>
                            </div>
                            {/* UPDATED: Added rounded-xl and overflow-hidden to the track container */}
                            <div className="border border-[var(--text-primary)]/30 flex flex-col bg-[var(--bg-dark)] rounded-xl overflow-hidden shadow-sm">
                                {displayFavorites.map(song => (
                                    <div key={song?.id} className="flex border-b border-[var(--text-primary)]/20 last:border-0 h-16 hover:bg-[var(--text-primary)]/5 transition-colors">
                                        <div className="w-16 h-full border-r border-[var(--text-primary)]/20 flex-shrink-0">
                                            {song?.albumArt ? (
                                                <img src={song.albumArt} alt="Cover" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-xs">🎵</div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center px-4 min-w-0 overflow-hidden">
                                            <p className="text-sm truncate font-medium">{song?.name || "Unknown Track"}</p>
                                            <p className="text-xs text-[var(--accent-secondary)] truncate">{song?.artist}</p>
                                        </div>
                                    </div>
                                ))}
                                {displayFavorites.length === 0 && <p className="p-4 text-center text-sm text-[var(--accent-secondary)]">No favorites selected.</p>}
                            </div>
                            <div className="text-center mt-4">
                                <button onClick={handleOpenFavoritesModal} className="text-sm text-[var(--accent-secondary)] hover:text-[#1DB954] transition-colors font-medium">Edit Selection</button>
                            </div>
                        </div>

                    </div>
                </div>
    );
}
