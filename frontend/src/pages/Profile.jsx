import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const isOwnProfile = true; 
  const [isEditing, setIsEditing] = useState(false);
  
  // 1. Set up empty state variables
  const [profileData, setProfileData] = useState(null);
  
  // We'll keep the dummy data for songs/artists until Srihan finishes the Spotify routes!
  const [pinnedArtists, setPinnedArtists] = useState([{ id: 1, name: "Artist 1" }]);
  const [topSongs, setTopSongs] = useState([{ id: 1, title: "Song 1", artist: "Artist A" }]);

  // 2. The useEffect hook to fetch the Firebase data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // We are using a test ID here (e.g., "123"). 
        // Later, this will be the actual logged-in user's ID!
        const testUserId = "123"; 
        const response = await axios.get(`http://localhost:5001/api/users/${testUserId}`);
        
        // Update the state with the database info
        setProfileData({
          username: response.data.displayName || "Unknown User",
          bio: response.data.bio || "No bio yet.",
          isPublic: !response.data.isPrivate // Note: Srihan's DB uses 'isPrivate', your UI uses 'isPublic'
        });
        
      } catch (error) {
        console.error("Error fetching user data from Firebase:", error);
        // Fallback data so your UI doesn't crash during testing
        setProfileData({ username: "Test_User", bio: "Testing the connection...", isPublic: true });
      }
    };

    fetchUserData();
  }, []);

  // 4. Add a quick loading screen so the app doesn't crash before the data arrives
  if (!profileData) {
    return <div style={{ color: 'white', padding: '40px' }}>Loading your profile...</div>;
  }

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