import React, { useEffect, useState } from 'react';
import { useLiff } from '../context/LiffContext';
import { useCardStore } from '../store/cardStore';
import { useTranslation } from 'react-i18next';
import './Profile.css';

// Format card expiry display (same logic as Home.jsx)
const formatExpiry = (card, t) => {
    // Card has been used - show actual expiry date
    if (card.card_firstuse && card.card_expire_date) {
        const expiryDate = new Date(card.card_expire_date);
        const now = new Date();

        // Check if expired
        if (expiryDate < now) {
            return t('home.expired', {
                date: expiryDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                })
            });
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
            return t('home.days_before_use', { days });
        }
        return t('home.hours_before_use', { hours });
    }

    return t('home.no_expiry');
};

// Virtual Card Icon Component
const VirtualCardIcon = ({ type }) => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="20" height="16" rx="3" fill={type === 1 ? "url(#moneyGradient)" : "url(#roundGradient)"} stroke="none" />
        <path d="M2 10H22" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <circle cx="19" cy="16" r="2" fill="rgba(255,255,255,0.5)" />
        <defs>
            <linearGradient id="moneyGradient" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4CAF50" />
                <stop offset="1" stopColor="#2E7D32" />
            </linearGradient>
            <linearGradient id="roundGradient" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#03A9F4" />
                <stop offset="1" stopColor="#01579B" />
            </linearGradient>
        </defs>
    </svg>
);

// Format card balance display
const formatBalance = (balance, cardType) => {
    if (cardType === 0) {
        return `${balance} Round${balance > 1 ? 's' : ''}`;
    }
    return `฿${balance.toLocaleString()}`;
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
import ProfileCardDetailModal from '../components/ProfileCardDetailModal'; // Import modal

const Profile = ({ onNavigate }) => {
    const { t, i18n } = useTranslation();
    const { profile, isLoading: liffLoading } = useLiff();
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

    // State for selected card detail
    const [selectedCard, setSelectedCard] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Filter cards based on status
    const filteredCards = cards.filter(card => {
        if (filter === 'all') return true;
        return getCardStatus(card) === filter;
    });

    const handleCardClick = (card) => {
        setSelectedCard(card);
        setIsDetailModalOpen(true);
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="profile-page">
            <header className="profile-header">
                <div className="header-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="4" width="20" height="16" rx="3" stroke="white" strokeWidth="2" />
                        <path d="M2 10H22" stroke="white" strokeWidth="2" />
                    </svg>
                </div>
                <h1>{t('profile.title')}</h1>
                <div className="header-actions">
                    <button className="lang-btn" onClick={() => changeLanguage(i18n.language === 'en' ? 'th' : 'en')}>
                        {i18n.language === 'en' ? 'TH' : 'EN'}
                    </button>
                    <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
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



                <div className="stats-grid">

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



                {/* All Cards Section with Filters */}
                <div className="all-cards-section">
                    <div className="section-header">
                        <h3>{t('home.my_cards')}</h3>
                        <div className="filter-tabs">
                            <button
                                className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                {t('home.filter_all')}
                            </button>
                            <button
                                className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
                                onClick={() => setFilter('active')}
                            >
                                {t('home.filter_in_use')}
                            </button>
                            <button
                                className={`filter-tab ${filter === 'expired' ? 'active' : ''}`}
                                onClick={() => setFilter('expired')}
                            >
                                {t('home.expires')}
                            </button>
                        </div>
                    </div>

                    <div className="cards-list">
                        {isLoading ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>{t('common.loading')}</p>
                            </div>
                        ) : filteredCards.length > 0 ? (
                            filteredCards.map(card => {
                                const status = getCardStatus(card);
                                return (
                                    <div
                                        key={card.card_id}
                                        className={`virtual-card ${card.card_type === 1 ? 'money-card' : 'round-card'} ${status === 'expired' ? 'expired' : ''}`}
                                        onClick={() => handleCardClick(card)}
                                    >
                                        <div className="card-top">
                                            <div className="card-icon-wrapper">
                                                <VirtualCardIcon type={card.card_type} />
                                            </div>
                                            <div className="card-info">
                                                <span className="card-name">
                                                    {card.card_type === 1 ? t('home.money_card') : t('home.round_card')}
                                                </span>
                                                <span className="card-type">
                                                    {card.card_type === 1 ? 'money' : 'round'} · {t('home.virtual')}
                                                </span>
                                            </div>
                                            {!card.card_firstuse && status !== 'expired' && (
                                                <span className="new-badge">{t('home.filter_new')}</span>
                                            )}
                                            {status === 'expired' && (
                                                <span className="card-status-badge expired" style={{ marginLeft: 'auto' }}>{t('home.expires')}</span>
                                            )}
                                        </div>
                                        <div className="card-bottom">
                                            <div className="card-balance">
                                                <span className="card-balance-label">{t('home.balance')}</span>
                                                <span className="card-balance-value">
                                                    {formatBalance(card.card_balance, card.card_type)}
                                                </span>
                                            </div>
                                            <div className="card-expires">
                                                <span className="card-expires-label">{t('home.expires')}</span>
                                                <span className="card-expires-value">
                                                    {status === 'expired' ? t('home.expires') : formatExpiry(card, t)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="no-cards-placeholder">
                                {t('home.no_cards')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {selectedCard && (
                <ProfileCardDetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    card={selectedCard}
                />
            )}
        </div>
    );
};
export default Profile;
