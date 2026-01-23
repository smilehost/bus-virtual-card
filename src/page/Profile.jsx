import React, { useEffect, useState, useRef } from 'react';
import { useLiff } from '../context/LiffContext';
import { useCardStore } from '../store/cardStore';
import { useTranslation } from 'react-i18next';
import { linkCardToUser } from '../services/cardService';
import liff from '@line/liff';
import { Html5Qrcode } from 'html5-qrcode';
import './Profile.css';
import '../page/authentic-card.css';

// Import Card Images
import CardImage from '../assets/FREE_SHUTTLE_Card.png';
import CardBusAdult from '../assets/card_bus_adult.png';
import CardBusStudent from '../assets/card_bus_student.png';
import CardBusOneDayPass from '../assets/card_bus_onedaypass.png';

import { getMemberByUserId } from '../services/memberService';
import { useTheme } from '../context/ThemeContext';
// Import Modal
import ProfileCardDetailModal from '../components/ProfileCardDetailModal';
import AlertModal from '../components/AlertModal';

// Format card balance display
const formatBalance = (balance, cardType) => {
    if (cardType === 0) {
        return { value: balance, unit: 'Rounds' }; // Translations handled in component
    }
    return { value: `฿${balance.toLocaleString()}`, unit: 'THB' };
};

// Get card status based on expiry
const getCardStatus = (card) => {
    if (card.card_type === 0 && card.card_balance === 0) {
        return 'expired';
    }

    if (card.card_firstuse && card.card_expire_date) {
        const expiryDate = new Date(card.card_expire_date);
        const now = new Date();
        return expiryDate < now ? 'expired' : 'active';
    }
    return 'active';
};

// Helper to determine image
const getCardImage = (card) => {
    if (!card) return CardImage;

    // Type 1: Money Card / One-Day Pass (if distinguished)
    if (card.card_type === 1) {
        // Could distinguish One Day Pass if needed, for now use Adult or generic
        const name = (card.card_name || '').toLowerCase();
        if (name.includes('one-day') || name.includes('oneday')) return CardBusOneDayPass;
        return CardBusAdult;
    }

    const name = (card.card_name || '').toLowerCase();

    // Check specific names
    if (name.includes('adult') || name.includes('ผู้ใหญ่')) return CardBusAdult;
    if (name.includes('student') || name.includes('นักเรียน')) return CardBusStudent;

    // "forline" or default -> Free Shuttle Image
    return CardImage;
};

const Profile = ({ onNavigate }) => {
    const { t, i18n } = useTranslation();
    const { profile, isLoading: liffLoading } = useLiff();
    const { cards, isLoading: cardsLoading, fetchCardsByUuid } = useCardStore();
    const { theme, toggleTheme } = useTheme();
    const [filter, setFilter] = useState('all');
    const [memberData, setMemberData] = useState(null);

    // Carousel State
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const sliderRef = useRef(null);

    // Detail Modal State
    const [selectedCard, setSelectedCard] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Fetch cards
    useEffect(() => {
        if (profile?.userId) {
            fetchCardsByUuid(profile.userId);
        }
    }, [profile?.userId, fetchCardsByUuid]);

    // Member Data
    useEffect(() => {
        if (profile?.userId) {
            getMemberByUserId(profile.userId)
                .then(response => {
                    if (response?.data) setMemberData(response.data);
                })
                .catch(err => console.error('Failed member data:', err));
        }
    }, [profile]);

    const isLoading = liffLoading || cardsLoading;

    // Filter Logic
    const filteredCards = cards.filter(card => {
        const status = getCardStatus(card);
        if (filter === 'all') return true;
        if (filter === 'active') return status === 'active'; // 'new' is also active effectively
        if (filter === 'expired') return status === 'expired';
        return true;
    });

    const handleScroll = (e) => {
        const slider = e.target;
        const scrollLeft = slider.scrollLeft;

        const cardWidth = slider.querySelector('.profile-card-wrapper')?.offsetWidth || 0;
        if (cardWidth === 0) return;

        const gap = 16;
        const totalWidth = cardWidth + gap;
        const newIndex = Math.round(scrollLeft / totalWidth);

        if (newIndex !== currentCardIndex && newIndex >= 0 && newIndex < filteredCards.length) {
            setCurrentCardIndex(newIndex);
        }
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    const handleCardClick = (card) => {
        setSelectedCard(card);
        setIsDetailModalOpen(true);
    };

    // Alert State
    const [alertState, setAlertState] = useState({ isOpen: false, type: 'success', title: '', message: '' });
    const closeAlert = () => setAlertState({ ...alertState, isOpen: false });
    const showAlert = (type, title, message) => setAlertState({ isOpen: true, type, title, message });

    // Scanner Logic
    const [isScanning, setIsScanning] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [scanError, setScanError] = useState(null);
    const scannerRef = useRef(null);

    useEffect(() => {
        let scannerInstance = null;

        const initScanner = async () => {
            if (isScanning) {
                setScanError(null);
                // Give time for DOM to render
                await new Promise(resolve => setTimeout(resolve, 300));

                if (!document.getElementById("reader")) return;

                try {
                    scannerInstance = new Html5Qrcode("reader");
                    scannerRef.current = scannerInstance;

                    await scannerInstance.start(
                        { facingMode: "environment" },
                        { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
                        onScanSuccess,
                        onScanFailure
                    );
                } catch (err) {
                    console.error("Scanner Error", err);
                    setScanError(t('common.camera_permission_denied'));
                }
            }
        };

        if (isScanning) {
            initScanner();
        } else {
            // Ensure cleanup if isScanning becomes false
            if (scannerRef.current) {
                try {
                    scannerRef.current.stop().catch(() => { }).finally(() => {
                        try { scannerRef.current.clear(); } catch (e) { }
                        scannerRef.current = null;
                    });
                } catch (e) {
                    scannerRef.current = null;
                }
            }
        }

        return () => {
            if (scannerRef.current) {
                try {
                    scannerRef.current.stop().catch(() => { }).finally(() => {
                        try { scannerRef.current.clear(); } catch (e) { }
                        scannerRef.current = null;
                    });
                } catch (e) {
                    scannerRef.current = null;
                }
            }
        };
    }, [isScanning]);

    const onScanSuccess = async (decodedText) => {
        if (scannerRef.current) {
            try { await scannerRef.current.stop(); } catch (e) { }
        }
        setIsScanning(false);
        processScan(decodedText);
    };
    const onScanFailure = (err) => { };

    const handleScanButtonClick = async () => {
        if (!liff.isInClient()) { setIsScanning(true); return; }
        try {
            const result = await liff.scanCode();
            if (result.value) processScan(result.value);
        } catch (e) {
            setIsScanning(true); // Fallback
        }
    };

    const processScan = async (hash) => {
        if (isProcessing) return;
        if (!memberData?.member_id) { showAlert('error', 'Error', 'Member data not loaded'); return; }

        setIsProcessing(true);
        try {
            const lastPart = hash.split('/').pop();
            await linkCardToUser(lastPart, memberData.member_id);
            showAlert('success', 'Success', 'Card added!');
            fetchCardsByUuid(profile.userId);
        } catch (error) {
            console.error("Link Card Error:", error);
            const errorMessage = error?.message || "";
            if (errorMessage.includes("การ์ดนี้มีเจ้าของแล้ว")) {
                showAlert('error', t('profile.error_card_owned_title'), t('profile.error_card_owned_message'));
            } else {
                showAlert('error', 'Failed', 'Invalid card');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="profile-page">
            <header className="profile-header">
                <div className="avatar-small">
                    {profile?.pictureUrl ? <img src={profile.pictureUrl} alt="Avatar" /> : <div className="avatar-placeholder">?</div>}
                </div>
                <div className="header-info">
                    <h1>{profile?.displayName || 'Guest'}</h1>
                    <span className="account-type-badge">LINE User</span>
                </div>
                <div className="header-actions">
                    <button className="icon-btn" onClick={() => changeLanguage(i18n.language === 'en' ? 'th' : 'en')}>
                        {i18n.language === 'en' ? 'TH' : 'EN'}
                    </button>
                    <button className="icon-btn" onClick={toggleTheme}>
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
            </header>

            <div className="profile-body">
                {/* Primary Action */}
                <button className="scan-primary-btn" onClick={handleScanButtonClick}>
                    <div className="btn-content">
                        <span className="btn-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" /></svg>
                        </span>
                        <div className="btn-text">
                            <span className="btn-title">{t('profile.scan_qr')}</span>
                        </div>
                    </div>
                    <span className="btn-arrow">→</span>
                </button>

                {/* Filter Tabs */}
                <div className="filter-container">
                    <div className="segmented-control">
                        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>{t('home.filter_all')}</button>
                        <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>{t('home.filter_in_use')}</button>
                        <button className={filter === 'expired' ? 'active' : ''} onClick={() => setFilter('expired')}>{t('home.expires')}</button>
                    </div>
                </div>

                {/* Card Carousel */}
                <div className="profile-carousel-section">
                    {isLoading ? (
                        <div className="loading-state"><div className="spinner"></div></div>
                    ) : filteredCards.length === 0 ? (
                        <div className="empty-state-card">
                            <p>{t('home.no_cards')}</p>
                        </div>
                    ) : (
                        <>
                            <div className="profile-carousel" onScroll={handleScroll} ref={sliderRef}>
                                {filteredCards.map((card, index) => {
                                    const status = getCardStatus(card);
                                    return (
                                        <div
                                            key={card.card_id}
                                            className={`profile-card-wrapper ${index === currentCardIndex ? 'focused' : ''}`}
                                            onClick={() => handleCardClick(card)}
                                        >
                                            <div className={`profile-card ${status}`}>
                                                <div className="card-image-container">
                                                    <img src={getCardImage(card)} alt="Card" className="p-card-img" />
                                                    {status !== 'active' && <div className="card-overlay">{status}</div>}
                                                </div>
                                                <div className="card-mini-details">
                                                    <span className="p-card-name">{card.card_name || 'Card'}</span>
                                                    <span className="p-card-balance">
                                                        {formatBalance(card.card_balance, card.card_type).value}
                                                        <small>{card.card_type === 0 ? t('buy_card.rounds') : 'THB'}</small>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Dots */}
                            <div className="carousel-dots">
                                {filteredCards.map((_, idx) => (
                                    <span key={idx} className={`dot ${idx === currentCardIndex ? 'active' : ''}`} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Scanner Modal */}
            {isScanning && (
                <div className="scanner-modal-fullscreen">
                    <button className="scanner-close-btn-top" onClick={() => setIsScanning(false)}>✕</button>
                    {scanError ? (
                        <div className="error-view">
                            <p>{scanError}</p>
                            <button onClick={() => { setIsScanning(false); setTimeout(() => setIsScanning(true), 200); }}>{t('common.retry')}</button>
                        </div>
                    ) : (
                        <div id="reader" className="scanner-view"></div>
                    )}
                </div>
            )}

            {/* Detail Modal */}
            <ProfileCardDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                card={selectedCard}
            />

            <AlertModal isOpen={alertState.isOpen} onClose={closeAlert} type={alertState.type} title={alertState.title} message={alertState.message} />
        </div>
    );
};

export default Profile;
