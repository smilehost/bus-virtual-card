import React from 'react';
import './Profile.css';

const Profile = () => {
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
            </header>

            <div className="profile-content">
                <div className="user-section">
                    <div className="avatar-container">
                        <div className="avatar">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                    <div className="user-info">
                        <h2>Guest User</h2>
                        <p>Member since Jan 13, 2026</p>
                    </div>
                </div>

                <div className="loyalty-card">
                    <div className="loyalty-header">
                        <span className="icon">🎗️</span>
                        <span>Loyalty Points</span>
                    </div>
                    <div className="points-display">
                        <span className="points">10</span>
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
                                <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="#00D1FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M17 6H23V12" stroke="#00D1FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <span className="stat-label">Total Spent</span>
                        <span className="stat-value">$0.00</span>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon card-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="5" width="20" height="14" rx="2" stroke="#00FFA3" strokeWidth="2" />
                                <line x1="2" y1="10" x2="22" y2="10" stroke="#00FFA3" strokeWidth="2" />
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
                                    <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M3.27002 6.96002L12 12.01L20.73 6.96002" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 22.08V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
            </div>
        </div>
    );
};

export default Profile;
