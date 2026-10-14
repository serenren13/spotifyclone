export default function PublicProfileSidebar({ displayImage, publicUser, handleMessageUser }) {
    return (
                <div className="w-full md:w-1/3 flex flex-col gap-6 border-r border-[var(--text-primary)]/20 pr-8">
                    <div className="flex flex-col items-center mt-4">
                        <img src={displayImage} alt={`${publicUser.displayName}'s Profile`} className="w-48 h-48 rounded-full object-cover bg-[var(--bg-dark)] mb-4 border-4 border-[var(--text-primary)]/10 shadow-lg" />
                        <h2 className="text-3xl font-medium mb-6">{publicUser?.displayName || "Anonymous"}</h2>
                        <button
                            onClick={handleMessageUser}
                            className="w-full max-w-[200px] bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold py-2 px-4 rounded-full transition-colors duration-200 mt-2 shadow cursor-pointer"
                        >
                            Message User
                        </button>
                    </div>
                    <div className="border border-[var(--text-primary)]/30 p-4 bg-[var(--bg-dark)] flex flex-col rounded-xl overflow-hidden shadow-sm">
                        <p className="text-sm font-semibold mb-2 text-[#1DB954]">Bio:</p>
                        <p className="text-sm min-h-[5rem] whitespace-pre-wrap">
                            {publicUser?.bio || <span className="text-[var(--accent-secondary)] italic">No bio provided.</span>}
                        </p>
                    </div>
                </div>
    );
}
