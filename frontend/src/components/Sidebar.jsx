import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, TrendingUp, Music, Compass, Inbox, MessageSquare } from 'lucide-react';
import { useSpotify } from '../context/SpotifyContext';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import '../styling/Sidebar.css';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef(null);
    const { userProfile } = useSpotify();
    const { theme } = useTheme();
    const location = useLocation();

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsOpen(true);
        }, 150);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(false);
    };

    const menuItems = [
        { icon: <Compass size={22} />, label: 'Discover', path: '/discover' },
        { icon: <Heart size={22} />, label: 'Liked Songs', path: '/liked-songs' },
        { icon: <TrendingUp size={22} />, label: 'Top Songs', path: '/top-songs' },
        { icon: <Music size={22} />, label: 'Top Artists', path: '/top-artists' },
        { icon: <Inbox size={22} />, label: 'Inbox', path: '/inbox' },
        { icon: <MessageSquare size={22} />, label: 'Forums', path: '/forums' },
    ];

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`sidebar ${isOpen ? 'open' : 'closed'}`}
        >
            {/* Top Logo / Header Section */}
            <div>
                <div className="sidebar-header">
                    <Link to="/profile" className="profile-link">
                        {/* Avatar Circle Container */}
                        <div className="avatar-container">
                            {userProfile?.images?.[0]?.url ? (
                                <img
                                    src={userProfile.images[0].url}
                                    alt={userProfile.display_name || "User profile"}
                                    className="avatar-image"
                                />
                            ) : (
                                <span>{(userProfile?.display_name || "U").charAt(0).toUpperCase()}</span>
                            )}
                        </div>

                        {/* Profile Name */}
                        <div className="profile-info" style={{ opacity: isOpen ? 1 : 0 }}>
                            <span className="profile-name">
                                {userProfile?.display_name || "User"}
                            </span>
                            <span className="profile-subtext">View Profile</span>
                        </div>
                    </Link>
                </div>

                {/* Navigation Items */}
                <nav className="sidebar-nav">
                    <div className="sidebar-nav-list">
                        {menuItems.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={index}
                                    to={item.path}
                                    className={`nav-link ${isActive ? 'active' : 'inactive'}`}
                                >
                                    <div className="nav-icon">
                                        {item.icon}
                                    </div>
                                    <span className={`sidebar-label ${isOpen ? 'label-open' : 'label-closed'}`}>
                                        {item.label}
                                    </span>

                                    {!isOpen && (
                                        <div className="nav-tooltip">
                                            {item.label}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </div>

            {/* Bottom Footer / Theme Section */}
            <div className="sidebar-footer">
                <div className="footer-content">
                    <ThemeToggle />
                    <span className={`sidebar-label ${isOpen ? 'label-open' : 'label-closed'}`}>
                        Switch to {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </span>
                </div>
            </div>
        </div>
    );
}