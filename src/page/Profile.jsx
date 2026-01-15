import React, { useEffect, useState } from 'react';
import { useLiff } from '../context/LiffContext';
import { useCardStore } from '../store/cardStore';
import './Profile.css';

// Format card expiry display (same logic as Home.jsx)
const formatExpiry = (card) => {
    // Card has been used - show actual expiry date
    if (card.card_firstuse && card.card_expire_date) {
        const expiryDate = new Date(card.card_expire_date);
        const now = new Date();

        // Check if expired
        if (expiryDate < now) {
            return `Expired: ${expiryDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })}`;
        }

        // Return formatted date
        return expiryDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Card NOT used yet - show days left before first use
    if (card.card_expire) {
        const hours = parseInt(card.card_expire);
        if (hours >= 24) {
            const days = Math.floor(hours / 24);
            return `${days} days before first use`;
        }
        return `${hours} hours before first use`;
    }

    return 'No expiry';
};

// Get card status based on expiry
const getCardStatus = (card) => {
    // Round cards with 0 balance are considered expired
    if (card.card_type === 0 && card.card_balance === 0) {
        return 'expired';
    }

    if (card.card_firstuse && card.card_expire_date) {
        const expiryDate = new Date(card.card_expire_date);
        const now = new Date();
        return expiryDate < now ? 'expired' : 'active';
    }
    // Card not used yet is still active
    return 'active';
};

import { getMemberByUserId } from '../services/memberService';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
    const { profile, isLoggedIn, logout, isLoading: liffLoading } = useLiff();
    const { cards, isLoading: cardsLoading, fetchCardsByUuid } = useCardStore();
    const { theme, toggleTheme } = useTheme();
    const [filter, setFilter] = useState('all');
    const [memberData, setMemberData] = useState(null);

    // Fetch cards when profile is loaded
    useEffect(() => {
        if (profile?.userId) {
            fetchCardsByUuid(profile.userId);
        }
    }, [profile?.userId, fetchCardsByUuid]);

    // Log LINE userId and fetch member data
    useEffect(() => {
        if (profile?.userId) {
            console.log('LINE User ID:', profile.userId);
            getMemberByUserId(profile.userId)
                .then(response => {
                    if (response?.data) {
                        setMemberData(response.data);
                    }
                })
                .catch(err => console.error('Failed to fetch member data:', err));
        }
    }, [profile]);

    const isLoading = liffLoading || cardsLoading;

    // Filter cards based on status
    const filteredCards = cards.filter(card => {
        if (filter === 'all') return true;
        return getCardStatus(card) === filter;
    });

    return (
        <div className="profile-page">
            <header className="profile-header">
                <div className="header-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="4" width="20" height="16" rx="3" stroke="white" strokeWidth="2" />
                        <path d="M2 10H22" stroke="white" strokeWidth="2" />
                    </svg>
                </div>
                <h1>My Profile</h1>
                <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </header>

            <div className="profile-content">
                <div className="user-section">
                    <div className="avatar-container">
                        {profile?.pictureUrl ? (
                            <img
                                src={profile.pictureUrl}
                                alt={profile.displayName || 'Profile'}
                                className="avatar-image"
                            />
                        ) : (
                            <div className="avatar">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke="#E0E0E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="user-info">
                        <h2>{profile?.displayName || 'Guest User'}</h2>
                        <p>{profile?.statusMessage || 'LINE User'}</p>
                    </div>
                </div>

                <div className="loyalty-card">
                    <div className="loyalty-header">
                        <span className="icon">🎗️</span>
                        <span>Loyalty Points</span>
                    </div>
                    <div className="points-display">
                        <span className="points">{memberData?.member_point || 0}</span>
                        <span className="unit">pts</span>
                    </div>
                    <div className="progress-section">
                        <div className="progress-labels">
                            <span>Progress to next point</span>
                            <span>0/100 THB</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: '30%' }}></div>
                        </div>
                        <p className="helper-text">Earn 1 point for every 100 THB spent on cards</p>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon graph-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M17 6H23V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="stat-label">Wallet Balance</span>
                        <span className="stat-value">฿{(memberData?.member_wallet || 0).toLocaleString()}</span>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                                <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <span className="stat-label">Cards Bought</span>
                        <span className="stat-value">0</span>
                    </div>
                </div>

                <div className="member-points-section">
                    <h3>My Member point</h3>
                    <div className="member-point-card">
                        <div className="card-header">
                            <div className="point-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3.27002 6.96002L12 12.01L20.73 6.96002" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 22.08V12" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className="point-details">
                                <span className="point-name">Member point</span>
                                <span className="point-type">money Card</span>
                            </div>
                        </div>
                        <div className="card-footer">
                            <div className="balance-info">
                                <span className="label">Balance</span>
                                <span className="amount">10 Points</span>
                            </div>
                            <div className="expiry-info">
                                <span className="label">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <line x1="16" y1="2" x2="16" y2="6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <line x1="8" y1="2" x2="8" y2="6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <line x1="3" y1="10" x2="21" y2="10" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Expires
                                </span>
                                <span className="date">Jan 20, 2026</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* All Cards Section with Filters */}
                <div className="all-cards-section">
                    <div className="section-header">
                        <h3>My Cards</h3>
                        <div className="filter-tabs">
                            <button
                                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All
                            </button>
                            <button
                                className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                                onClick={() => setFilter('active')}
                            >
                                Active
                            </button>
                            <button
                                className={`filter-tab ${filter === 'expired' ? 'active' : ''}`}
                                onClick={() => setFilter('expired')}
                            >
                                Expired
                            </button>
                        </div>
                    </div>

                    <div className="cards-list">
                        {isLoading ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>กำลังโหลด...</p>
                            </div>
                        ) : filteredCards.length > 0 ? (
                            filteredCards.map(card => {
                                const status = getCardStatus(card);
                                return (
                                    <div key={card.card_id} className={`member-point-card ${status === 'expired' ? 'expired' : ''}`}>
                                        <div className="card-header">
                                            <div className={`point-icon ${status === 'expired' ? 'grayscale' : ''}`}>
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="#4CAF50" strokeWidth="2" />
                                                    <line x1="2" y1="10" x2="22" y2="10" stroke="#4CAF50" strokeWidth="2" />
                                                </svg>
                                            </div>
                                            <div className="point-details">
                                                <span className="point-name">
                                                    {card.card_type === 1 ? 'Money Card' : 'Round Card'}
                                                </span>
                                                <span className="point-type">
                                                    <span className={`status-badge ${status}`}>
                                                        {status === 'active' ? 'Active' : 'Expired'}
                                                    </span>
                                                </span>
                                            </div>
                                            {!card.card_firstuse && (
                                                <span className="new-badge">New</span>
                                            )}
                                        </div>
                                        <div className="card-footer">
                                            <div className="balance-info">
                                                <span className="label">Balance</span>
                                                <span className="amount">
                                                    {card.card_type === 1
                                                        ? `฿${card.card_balance.toLocaleString()}`
                                                        : `${card.card_balance} Round${card.card_balance > 1 ? 's' : ''}`}
                                                </span>
                                            </div>
                                            <div className="expiry-info">
                                                <span className="label">Expires</span>
                                                <span className="date">{formatExpiry(card)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-cards-placeholder">
                                No {filter} cards found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
