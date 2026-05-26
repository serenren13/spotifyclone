import React, { useState } from 'react';
import './TopSongs.css';

const TopSongs = () => {
  const [activeTab, setActiveTab] = useState('allTime');

  // Generating 10 dummy songs
  const dummySongs = Array.from({ length: 10 }, (_, i) => ({
    rank: i + 1,
    title: `Song Title ${i + 1}`,
    artist: "Artist Name",
    genre: "Indie Pop",
    minutes: "124",
    length: "3:45"
  }));

  return (
    <div className="top-songs-page">
      <div className="top-songs-main">
        <h1 className="page-title">Your Top Songs</h1>

        {/* Time Tabs */}
        <div className="time-filters">
          {['allTime', 'lastYear', 'lastMonth'].map(tab => (
            <button 
              key={tab}
              className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'allTime' ? 'All Time' : tab === 'lastYear' ? 'Last Year' : 'Last Month'}
            </button>
          ))}
        </div>

        {/* Locked-in List Container */}
        <div className="list-container">
          {dummySongs.map(song => (
            <div key={song.rank} className="song-card">
              <div className="rank">{song.rank}</div>
              <div className="album-cover"></div>
              
              <div className="info-block">
                <span className="title">{song.title}</span>
                <span className="artist">{song.artist}</span>
                <span className="genre">{song.genre}</span>
              </div>

              <div className="stats-block">
                <span>{song.minutes} Mins</span>
                <span>{song.length}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopSongs;