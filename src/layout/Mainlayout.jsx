import { useState } from 'react';
import './MainLayout.css';

// Navigation Icons
const HomeIcon = ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const TopUpIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const BuyCardIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
        <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
    </svg>
);

const HistoryIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const ProfileIcon = ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
        <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

function MainLayout({ children, activeTab, onTabChange }) {
    return (
        <div className="main-layout">
            {/* Main Content */}
            <div className="main-content">
                {children}
            </div>

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <button
                    className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                    onClick={() => onTabChange('home')}
                >
                    <HomeIcon active={activeTab === 'home'} />
                    <span>Home</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'topup' ? 'active' : ''}`}
                    onClick={() => onTabChange('topup')}
                >
                    <TopUpIcon />
                    <span>Top Up</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'buycard' ? 'active' : ''}`}
                    onClick={() => onTabChange('buycard')}
                >
                    <BuyCardIcon />
                    <span>Buy Card</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => onTabChange('history')}
                >
                    <HistoryIcon />
                    <span>History</span>
                </button>
                <button
                    className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => onTabChange('profile')}
                >
                    <ProfileIcon active={activeTab === 'profile'} />
                    <span>Profile</span>
                </button>
            </nav>
        </div>
    );
}

export default MainLayout;
