export default function PublicProfileMusicSections({ topArtists, topSongs, favoriteTracks }) {
    return (
                <div className="w-full md:w-2/3 flex flex-col">

                    {/* TOP ARTISTS */}
                    <div className="mb-12 border-b border-[var(--text-primary)]/20 pb-8">
                        <h3 className="text-2xl font-medium mb-6">Top Artists</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {topArtists.map(artist => (
                                <div key={artist.id} className="flex flex-col items-center text-center min-w-0">
                                    <div className="w-24 h-24 rounded-full bg-[var(--bg-dark)] mb-3 overflow-hidden border-2 border-transparent flex-shrink-0">
                                        <img src={artist.image} alt={artist.name} className="w-full h-full object-cover" />
                                    </div>
                                    <p className="font-medium text-sm truncate w-full px-2">{artist.name}</p>
                                </div>
                            ))}
                            {topArtists.length === 0 && <p className="col-span-4 text-[var(--accent-secondary)] text-sm">No top artists found.</p>}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">

                        {/* TOP SONGS */}
                        <div className="flex-1">
                            <div className="text-center mb-4">
                                <h3 className="text-xl font-medium">Top Songs</h3>
                            </div>
                            <div className="border border-[var(--text-primary)]/30 flex flex-col bg-[var(--bg-dark)] rounded-xl overflow-hidden shadow-sm">
                                {topSongs.map(song => (
                                    <div key={song.id} className="flex border-b border-[var(--text-primary)]/20 last:border-0 h-16 hover:bg-[var(--text-primary)]/5 transition-colors">
                                        <div className="w-16 h-full border-r border-[var(--text-primary)]/20 flex-shrink-0">
                                            <img src={song.albumArt} alt="Cover" className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center px-3 min-w-0 overflow-hidden">
                                            <p className="text-sm truncate font-medium">{song.name}</p>
                                            <p className="text-xs text-[var(--accent-secondary)] truncate">{song.artist}</p>
                                        </div>
                                    </div>
                                ))}
                                {topSongs.length === 0 && <p className="p-4 text-center text-sm text-[var(--accent-secondary)]">No top songs found.</p>}
                            </div>
                        </div>

                        {/* FAVORITE / RECENTLY LIKED SONGS */}
                        <div className="flex-1">
                            <div className="text-center mb-4 flex items-baseline justify-center gap-2">
                                <h3 className="text-xl font-medium">Current Favorites</h3>
                            </div>
                            <div className="border border-[var(--text-primary)]/30 flex flex-col bg-[var(--bg-dark)] rounded-xl overflow-hidden shadow-sm">
                                {favoriteTracks.map(track => (
                                    <div key={track.id} className="flex border-b border-[var(--text-primary)]/20 last:border-0 h-16 hover:bg-[var(--text-primary)]/5 transition-colors">
                                        <div className="w-16 h-full border-r border-[var(--text-primary)]/20 flex-shrink-0">
                                            {track.albumArt
                                                ? <img src={track.albumArt} alt="Cover" className="w-full h-full object-cover" />
                                                : <div className="w-full h-full bg-[var(--bg-primary)]" />
                                            }
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center px-3 min-w-0 overflow-hidden">
                                            <p className="text-sm truncate font-medium">{track.name}</p>
                                            <p className="text-xs text-[var(--accent-secondary)] truncate">{track.artist}</p>
                                        </div>
                                    </div>
                                ))}
                                {favoriteTracks.length === 0 && (
                                    <div className="p-8 text-center flex flex-col items-center">
                                        <span className="text-4xl mb-3 opacity-50">🎧</span>
                                        <p className="text-sm text-[var(--accent-secondary)]">No songs to display yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
    );
}
