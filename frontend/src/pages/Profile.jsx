import { useProfile } from "../features/profile/useProfile";
import FavoriteSongsModal from "../features/profile/FavoriteSongsModal";
import ProfileSidebar from "../features/profile/ProfileSidebar";
import ProfileMusicSections from "../features/profile/ProfileMusicSections";

export default function Profile() {
    const {
        userProfile, loading, musicError, handleLogout, isEditingFavorites,
        tempSelectedFavorites, allLikedSongs, handleToggleFavoriteSelection,
        setIsEditingFavorites, handleSaveFavorites, isPrivate,
        handleTogglePrivacy, displayImage, profile, bioText, setBioText,
        handleSaveBio, savingBio, topArtists, topSongs, displayFavorites,
        handleOpenFavoritesModal,
    } = useProfile();
    if (!userProfile) return <div className="p-8">Please log in to view your profile.</div>;
    if (loading) return <div className="min-h-screen bg-[var(--bg-primary)] p-8 text-[var(--accent-secondary)]">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-8 flex justify-center relative">
            {musicError && <p role="alert" className="absolute top-20">Some Spotify music could not be loaded.</p>}
            <button
                onClick={handleLogout}
                className="absolute top-8 right-8 border border-[var(--text-primary)]/30 text-[var(--text-primary)] py-2 px-5 rounded-full font-medium cursor-pointer hover:border-[#1DB954] hover:text-[#1DB954] transition-all text-sm tracking-wide bg-[var(--bg-dark)]/40 shadow-sm backdrop-blur-sm z-10"
            >
                Logout
            </button>

            {isEditingFavorites && (
                <FavoriteSongsModal tempSelectedFavorites={tempSelectedFavorites} allLikedSongs={allLikedSongs} handleToggleFavoriteSelection={handleToggleFavoriteSelection} setIsEditingFavorites={setIsEditingFavorites} handleSaveFavorites={handleSaveFavorites} />
            )}

            <div className="max-w-6xl w-full flex flex-col md:flex-row gap-8">

                {/* LEFT SIDEBAR */}
                <ProfileSidebar isPrivate={isPrivate} handleTogglePrivacy={handleTogglePrivacy} displayImage={displayImage} profile={profile} bioText={bioText} setBioText={setBioText} handleSaveBio={handleSaveBio} savingBio={savingBio} />

                {/* RIGHT CONTENT AREA */}
                <ProfileMusicSections topArtists={topArtists} topSongs={topSongs} displayFavorites={displayFavorites} handleOpenFavoritesModal={handleOpenFavoritesModal} />
            </div>
        </div>
    );
}
