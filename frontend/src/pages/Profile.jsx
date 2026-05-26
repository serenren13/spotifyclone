import React, { useState } from 'react';
import './Profile.css';

const Profile = () => {
  // Toggle this to 'false' to test what OTHER users see when clicking your profile!
  const isOwnProfile = true; 

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: "Ashish_Music_Fan",
    bio: "I listen to way too much indie pop.",
    isPublic: true
  });

  // Dummy Data for UI testing
  const pinnedArtists = [
    { id: 1, name: "Placeholder Artist 1" },
    { id: 2, name: "Placeholder Artist 2" },
    { id: 3, name: "Placeholder Artist 3" },
    { id: 4, name: "Placeholder Artist 4" }
  ];

  const topSongs = [
    { id: 1, title: "Cool Song 1", artist: "Artist A" },
    { id: 2, title: "Cool Song 2", artist: "Artist B" },
    { id: 3, title: "Cool Song 3", artist: "Artist C" }
  ];

  return (
    <div className="profile-page">
      
      {/* LEFT SIDEBAR */}
      <div className="profile-sidebar">
        
        {isOwnProfile && (
          <div className="privacy-toggle">
            <label>
              <input 
                type="checkbox" 
                checked={profileData.isPublic}
                onChange={() => setProfileData({...profileData, isPublic: !profileData.isPublic})}
                disabled={!isEditing}
              />
              {profileData.isPublic ? " Public Profile" : " Private Profile"}
            </label>
          </div>
        )}

        <div className="avatar"></div>
        <h2 className="username">{profileData.username}</h2>

        <div className="bio-section">
          {isEditing ? (
            <textarea 
              className="bio-input"
              value={profileData.bio}
              onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
            />
          ) : (
            <p>{profileData.bio || "No bio yet."}</p>
          )}
        </div>

        {/* Dynamic Button Rendering */}
        {isOwnProfile ? (
          <button 
            className="action-btn" 
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Save Changes" : "Edit Profile"}
          </button>
        ) : (
          <button className="action-btn">Message User</button>
        )}
      </div>

      {/* RIGHT CANVAS */}
      <div className="profile-main">
        
        {/* Top Artists Section */}
        <div className="section-header">
          <h2>Top Artists</h2>
          {isOwnProfile && <button className="edit-select-btn">Edit Selection</button>}
        </div>
        <div className="artists-grid">
          {pinnedArtists.map(artist => (
            <div key={artist.id} className="artist-card">
              <div className="artist-img"></div>
              <h3>{artist.name}</h3>
            </div>
          ))}
        </div>

        {/* Top / Liked Songs Section */}
        <div className="section-header">
          <h2>Featured Songs</h2>
          {isOwnProfile && <button className="edit-select-btn">Edit Selection</button>}
        </div>
        <div className="songs-list">
          {topSongs.map(song => (
            <div key={song.id} className="song-row">
              <div className="song-cover"></div>
              <div className="song-info">
                <span className="song-title">{song.title}</span>
                <span className="song-artist">{song.artist}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Profile;