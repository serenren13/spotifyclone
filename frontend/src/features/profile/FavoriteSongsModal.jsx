export default function FavoriteSongsModal({ tempSelectedFavorites, allLikedSongs, handleToggleFavoriteSelection, setIsEditingFavorites, handleSaveFavorites }) {
    return (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    {/* UPDATED: Added rounded-xl */}
                    <div className="bg-[var(--bg-primary)] p-6 rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-[var(--text-primary)]/20 shadow-2xl">
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold">Pick Your Favorite Songs</h2>
                            <p className="text-[var(--accent-secondary)] text-sm">Select up to 4 tracks from your recent history ({tempSelectedFavorites.length}/4 selected)</p>
                        </div>

                        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-2">
                            {allLikedSongs.map(item => {
                                if (!item.track) return null;
                                const isSelected = tempSelectedFavorites.includes(item.track.id);
                                return (
                                    <div
                                        key={item.track.id}
                                        onClick={() => handleToggleFavoriteSelection(item.track.id)}
                                        className={`flex items-center gap-4 p-2 rounded-lg border-2 transition-colors ${isSelected ? 'border-[#1DB954] bg-[#1DB954]/10' : 'border-transparent hover:bg-[var(--bg-dark)]'}`}
                                    >
                                        {/* UPDATED: Changed rounded to rounded-md */}
                                        <img src={item.track.album?.images?.[2]?.url || item.track.album?.images?.[0]?.url} alt="Cover" className="w-10 h-10 rounded-md object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.track.name}</p>
                                            <p className="text-xs text-[var(--accent-secondary)] truncate">{item.track.artists?.map(a => a.name).join(", ")}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-[var(--text-primary)]/10">
                            <button onClick={() => setIsEditingFavorites(false)} className="px-4 py-2 text-sm hover:underline">Cancel</button>
                            {/* UPDATED: Changed rounded to rounded-full */}
                            <button onClick={handleSaveFavorites} className="bg-[#1DB954] text-white px-6 py-2 rounded-full font-medium hover:bg-green-600 transition-colors">Save Selection</button>
                        </div>
                    </div>
                </div>

    );
}
