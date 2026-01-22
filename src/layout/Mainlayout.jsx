import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLiff } from '../context/LiffContext';
import './MainLayout.css';

// Navigation Icons

// Navigation Icons
// Navigation Icons (Filled / Flaticon Style)
const HomeIcon = ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "currentColor"} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.1L1 12H4V21H9V14H15V21H20V12H23L12 2.1ZM12 4.35L19 10.65V19H17V12H7V19H5V10.65L12 4.35Z" fillOpacity={active ? 1 : 0.8} />
    </svg>
);

const BuyCardIcon = ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "currentColor"} xmlns="http://www.w3.org/2000/svg">
        <path d="M3 4C1.895 4 1 4.895 1 6V18C1 19.105 1.895 20 3 20H21C22.105 20 23 19.105 23 18V6C23 4.895 22.105 4 21 4H3ZM3 6H21V8H3V6ZM3 12H21V18H3V12ZM4 13H8V16H4V13Z" fillOpacity={active ? 1 : 0.8} />
    </svg>
);

const HistoryIcon = ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "currentColor"} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fillOpacity={active ? 1 : 0.8} />
        <path d="M11 7H13V13H17V15H11V7Z" fill={active ? "currentColor" : "currentColor"} />
    </svg>
);

const ProfileIcon = ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "currentColor"} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12C14.761 12 17 9.761 17 7C17 4.239 14.761 2 12 2C9.239 2 7 4.239 7 7C7 9.761 9.239 12 12 12ZM12 14C9.33 14 4 15.34 4 18V22H20V18C20 15.34 14.67 14 12 14Z" fillOpacity={active ? 1 : 0.8} />
    </svg>
);

const CardIcon = ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "currentColor"} xmlns="http://www.w3.org/2000/svg">
        <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fillOpacity={active ? 1 : 0.8} />
    </svg>
);



/*
const CardIcon = ({ active }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
        <circle cx="6" cy="15" r="1" fill="currentColor" />
    </svg>
);
*/

function MainLayout({ children, activeTab, onTabChange }) {
    const { t } = useTranslation();
    const { profile } = useLiff();

    return (
        <div className="main-layout">
            {/* Main Content */}
            <div className="main-content">
                {children}
            </div>

            {/* Bottom Navigation - Hidden on Register page */}
            {activeTab !== 'register' && (
                <nav className="bottom-nav">
                    <button
                        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
                        onClick={() => onTabChange('home')}
                    >
                        <HomeIcon active={activeTab === 'home'} />
                        <span>{t('menu.home')}</span>
                    </button>

                    <button
                        className={`nav-item ${activeTab === 'buycard' ? 'active' : ''}`}
                        onClick={() => onTabChange('buycard')}
                    >
                        <BuyCardIcon />
                        <span>{t('menu.buy_card')}</span>
                    </button>

                    <button
                        className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => onTabChange('history')}
                    >
                        <HistoryIcon />
                        <span>{t('menu.history')}</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'yourcard' ? 'active' : ''}`}
                        onClick={() => onTabChange('yourcard')}
                    >
                        <CardIcon active={activeTab === 'yourcard'} />
                        <span>{t('menu.yourcard') || 'บัตรของฉัน'}</span>
                    </button>
                    <button
                        className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => onTabChange('profile')}
                    >
                        <ProfileIcon active={activeTab === 'profile'} />
                        <span>{t('menu.profile')}</span>
                    </button>
                </nav>
            )}
        </div>
    );
};
export default MainLayout;
