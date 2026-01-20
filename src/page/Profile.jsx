import React, { useEffect, useState } from 'react';
import { useLiff } from '../context/LiffContext';
import { useCardStore } from '../store/cardStore';
import { useTranslation } from 'react-i18next';
import { linkCardToUser } from '../services/cardService';
import liff from '@line/liff';
import { Html5Qrcode } from 'html5-qrcode';
import './Profile.css';
import './authentic-card.css';

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
import ProfileCardDetailModal from '../components/ProfileCardDetailModal';
import AlertModal from '../components/AlertModal';

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

    // Alert State
    const [alertState, setAlertState] = useState({
        isOpen: false,
        type: 'success',
        title: '',
        message: ''
    });

    const closeAlert = () => setAlertState(prev => ({ ...prev, isOpen: false }));

    const showAlert = (type, title, message) => {
        setAlertState({
            isOpen: true,
            type,
            title,
            message
        });
    };

    // Scanner Logic
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        let html5QrCode = null;

        if (isScanning) {
            // Give a small delay to ensure DOM is ready
            const timer = setTimeout(() => {
                html5QrCode = new Html5Qrcode("reader");
                const config = {
                    fps: 10,
                    qrbox: { width: 200, height: 200 },
                    aspectRatio: 1.0
                };

                // Use back camera by default
                html5QrCode.start(
                    { facingMode: "environment" },
                    config,
                    onScanSuccess,
                    onScanFailure
                ).catch(err => {
                    console.error("Error starting scanner", err);
                    showAlert('error', t('common.error'), 'Could not access camera. Please allow camera permissions.');
                    setIsScanning(false);
                });
            }, 100);

            return () => clearTimeout(timer);
        }

        return () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().then(() => {
                    html5QrCode.clear();
                }).catch(err => console.error("Failed to stop scanner", err));
            }
        };
    }, [isScanning]);

    const onScanSuccess = (decodedText) => {
        setIsScanning(false);
        processScan(decodedText);
    };

    const onScanFailure = (error) => {
        // console.warn(error);
    };

    const handleScan = async () => {
        try {
            if (!liff.isInClient()) {
                setIsScanning(true);
                return;
            }
            if (liff.scanCode) {
                const result = await liff.scanCode();
                if (result.value) processScan(result.value);
            }
        } catch (error) {
            console.error('Scan Error:', error);
            showAlert('error', t('common.error'), 'Failed to open scanner.');
        }
    };

    const processScan = async (hash) => {
        if (!memberData?.member_id) {
            showAlert('error', 'Error', 'Member data not loaded.');
            return;
        }
        try {
            const lastPart = hash.split('/').pop();
            await linkCardToUser(lastPart, memberData.member_id);
            showAlert('success', 'Success', 'Card added successfully!');
            if (profile?.userId) fetchCardsByUuid(profile.userId);
        } catch (error) {
            console.error(error);
            showAlert('error', 'Failed', 'Failed to add card. Invalid or used.');
        }
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
                    {/* Scan button removed from here */}
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
                {/* Prominent Scan Button */}
                <div className="scan-section">
                    <button className="scan-card-btn" onClick={handleScan}>
                        <div className="scan-icon-container">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4 8V6C4 4.89543 4.89543 4 6 4H8M16 4H18C19.1046 4 20 4.89543 20 6V8M20 16V18C20 19.1046 19.1046 20 18 20H16M8 20H6C4.89543 20 4 19.1046 4 18V16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="scan-btn-text">
                            <span className="scan-title">{t('profile.scan_qr')}</span>
                            <span className="scan-desc">{t('profile.scan_description')}</span>
                        </div>
                        <div className="scan-chevron">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </button>
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
                                        className={`authentic-card ${card.card_type === 1 ? 'authentic-card-adult' : 'authentic-card-student'}`}
                                        onClick={() => handleCardClick(card)}
                                        style={{ marginBottom: '16px', opacity: status === 'expired' ? 0.7 : 1 }}
                                    >
                                        <div className="authentic-card-sunburst"></div>
                                        <div className="authentic-card-content">
                                            <div className="authentic-card-bus-top">
                                                <svg width="100%" height="50" viewBox="0 0 200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect x="40" y="10" width="120" height="30" rx="3" fill="rgba(0,0,0,0.3)" />
                                                    <rect x="50" y="15" width="20" height="12" rx="1" fill="rgba(255,255,255,0.4)" />
                                                    <rect x="75" y="15" width="20" height="12" rx="1" fill="rgba(255,255,255,0.4)" />
                                                    <rect x="105" y="15" width="20" height="12" rx="1" fill="rgba(255,255,255,0.4)" />
                                                    <rect x="130" y="15" width="20" height="12" rx="1" fill="rgba(255,255,255,0.4)" />
                                                    <circle cx="60" cy="42" r="6" fill="rgba(0,0,0,0.5)" />
                                                    <circle cx="140" cy="42" r="6" fill="rgba(0,0,0,0.5)" />
                                                </svg>
                                            </div>
                                            <div className="authentic-card-center">
                                                <div className="authentic-shape authentic-shape-1"></div>
                                                <div className="authentic-shape authentic-shape-2"></div>
                                                <span className="authentic-text">
                                                    {card.card_type === 1 ? t('home.authentic-card-adult') : t('home.authentic-card-student')}
                                                </span>
                                            </div>
                                            <div className="authentic-card-bottom">
                                                <span className="authentic-brand">บัตรซิ่ง</span>
                                            </div>

                                            {/* Status Badges */}
                                            {status === 'expired' ? (
                                                <div className="authentic-new-badge" style={{ backgroundColor: '#F44336', boxShadow: '0 2px 8px rgba(244, 67, 54, 0.4)' }}>
                                                    {t('home.expires')}
                                                </div>
                                            ) : !card.card_firstuse ? (
                                                <div className="authentic-new-badge">
                                                    {t('home.filter_new')}
                                                </div>
                                            ) : null}

                                            <div className="authentic-info-badge">
                                                <div className="authentic-info-row">
                                                    <span className="authentic-info-label">{t('home.balance')}</span>
                                                    <span className="authentic-info-value">{formatBalance(card.card_balance, card.card_type)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="authentic-card-strip">
                                            <span className="authentic-strip-text">
                                                {card.card_type === 1 ? 'e-THAI ADULT' : 'NRMS STUDENT'}
                                            </span>
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
            {/* Scanner Modal */}
            {isScanning && (
                <div className="scanner-modal-fullscreen">
                    {/* Close Button */}
                    <button className="scanner-close-btn-top" onClick={() => setIsScanning(false)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    {/* Scan Frame Container */}
                    <div className="scanner-frame-container">
                        {/* Corner Brackets */}
                        <div className="scanner-corner scanner-corner-tl"></div>
                        <div className="scanner-corner scanner-corner-tr"></div>
                        <div className="scanner-corner scanner-corner-bl"></div>
                        <div className="scanner-corner scanner-corner-br"></div>

                        {/* QR Reader */}
                        <div id="reader" className="scanner-reader-area"></div>
                    </div>

                    {/* Bottom Instruction */}
                    <div className="scanner-bottom-instruction">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4 8V6C4 4.89543 4.89543 4 6 4H8M16 4H18C19.1046 4 20 4.89543 20 6V8M20 16V18C20 19.1046 19.1046 20 18 20H16M8 20H6C4.89543 20 4 19.1046 4 18V16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <rect x="9" y="9" width="6" height="6" rx="1" stroke="white" strokeWidth="2" />
                        </svg>
                        <span>{t('profile.scan_qr') || "Scan QR Code"}</span>
                    </div>
                </div>
            )}

            <AlertModal
                isOpen={alertState.isOpen}
                onClose={closeAlert}
                type={alertState.type}
                title={alertState.title}
                message={alertState.message}
            />
        </div>
    );
};
export default Profile;
