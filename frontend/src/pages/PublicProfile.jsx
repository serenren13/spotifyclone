import { usePublicProfile } from "../features/profile/usePublicProfile";
import PublicProfileSidebar from "../features/profile/PublicProfileSidebar";
import PublicProfileMusicSections from "../features/profile/PublicProfileMusicSections";

export default function PublicProfile() {
    const {
        navigate, publicUser, topArtists, topSongs, favoriteTracks,
        loading, error, handleMessageUser, displayImage,
    } = usePublicProfile();
    if (loading) return <div className="min-h-screen bg-[var(--bg-primary)] p-8 text-[var(--accent-secondary)] flex justify-center items-center">Loading Profile...</div>;

    if (error) return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-8 text-center flex flex-col items-center justify-center">
            <h2 className="text-2xl text-[var(--text-primary)] mb-4">{error}</h2>
            <button onClick={() => navigate(-1)} className="text-[#1DB954] hover:underline">Go Back</button>
        </div>
    );

    if (publicUser?.isPrivate) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] p-8 flex flex-col items-center justify-center text-[var(--text-primary)]">
                <span className="text-6xl mb-4">🔒</span>
                <h2 className="text-3xl font-bold mb-2">This Account is Private</h2>
                <p className="text-[var(--accent-secondary)] mb-6">You do not have permission to view {publicUser.displayName || "this user"}'s profile.</p>
                <button onClick={() => navigate(-1)} className="bg-[var(--bg-dark)] px-6 py-2 rounded border border-[var(--text-primary)]/20 hover:bg-[var(--text-primary)]/10 transition-colors">Go Back</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-8 flex justify-center">
            <div className="max-w-6xl w-full flex flex-col md:flex-row gap-8">

                {/* LEFT SIDEBAR — read only */}
                <PublicProfileSidebar displayImage={displayImage} publicUser={publicUser} handleMessageUser={handleMessageUser} />

                {/* RIGHT CONTENT */}
                <PublicProfileMusicSections topArtists={topArtists} topSongs={topSongs} favoriteTracks={favoriteTracks} />

            </div>
        </div>
    );
}