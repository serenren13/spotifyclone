export default function ProfileSidebar({ isPrivate, handleTogglePrivacy, displayImage, profile, bioText, setBioText, handleSaveBio, savingBio }) {
    return (
                <div className="w-full md:w-1/3 flex flex-col gap-6 border-r border-[var(--text-primary)]/20 pr-8">

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{isPrivate ? "🔒" : "🌎"}</span>
                            <span>Account Privacy Toggle</span>
                        </div>
                        <button
                            onClick={handleTogglePrivacy}
                            className={`w-12 h-6 rounded-full relative transition-colors ${isPrivate ? 'bg-[#1DB954]' : 'bg-gray-500'} cursor-pointer`}
                        >
                            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isPrivate ? 'translate-x-6' : ''}`}></span>
                        </button>
                    </div>

                    <p className="text-center text-sm font-semibold mt-2">Current Status: {isPrivate ? "Private" : "Public"}</p>

                    <div className="flex flex-col items-center mt-4">
                        <div className="relative group">
                            <img src={displayImage} alt="Profile" className="w-48 h-48 rounded-full object-cover bg-[var(--bg-dark)] mb-4 border-4 border-[var(--text-primary)]/10" />
                        </div>
                        <h2 className="text-3xl font-medium mb-6">{profile?.display_name || "Username"}</h2>
                    </div>

                    {/* UPDATED: Added rounded-xl to container wrapper */}
                    <div className="border border-[var(--text-primary)]/30 p-4 h-auto relative bg-[var(--bg-dark)] flex flex-col rounded-xl overflow-hidden shadow-sm">
                        <p className="text-sm font-semibold mb-2">Bio:</p>
                        <textarea
                            value={bioText}
                            onChange={(e) => setBioText(e.target.value)}
                            className="w-full h-32 bg-transparent resize-none focus:outline-none text-sm placeholder:text-[var(--accent-secondary)]"
                            placeholder="Type your bio here..."
                        ></textarea>
                        <div className="flex justify-end mt-2 border-t border-[var(--text-primary)]/10 pt-2">
                            <button
                                onClick={handleSaveBio}
                                disabled={savingBio}
                                className="text-xs bg-[#1DB954] text-white px-5 py-2 rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 font-medium cursor-pointer"
                            >
                                {savingBio ? "Saved!" : "Save Bio"}
                            </button>
                        </div>
                    </div>
                </div>
    );
}
