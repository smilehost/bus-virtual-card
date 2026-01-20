import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useCardStore } from '../store/cardStore';
import { useLiff } from '../context/LiffContext';
import { useTranslation } from 'react-i18next';
import './home.css';
import '../page/authentic-card.css';

const Home = ({ onNavigate }) => {
    const { t, i18n } = useTranslation();
    const { cards, isLoading, fetchCardsByUuid } = useCardStore();
    const { profile } = useLiff();
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    // Fetch cards when profile is loaded
    useEffect(() => {
        if (profile?.userId) {
            fetchCardsByUuid(profile.userId);
        }
    }, [profile?.userId, fetchCardsByUuid]);

    // Filter out expired cards with zero balance
    // Filter out expired cards and sort
    const activeCards = cards
        .filter(card => {
            // 1. Check strict expiry date
            const expiryDateStr = card.card_expire_date || card.card_expiredate;
            if (expiryDateStr) {
                const expiry = new Date(expiryDateStr);
                if (expiry < new Date()) return false;
            }

            // 2. Check round card balance
            if (card.card_type === 0 && card.card_balance <= 0) {
                return false;
            }

            return true;
        })
        .sort((a, b) => {
            // Sort: New Cards (null firstuse) -> Recent First Use -> Old First Use
            // Treat null/undefined firstuse as "Future/New" (Max Date)
            const getSortDate = (c) => c.card_firstuse ? new Date(c.card_firstuse) : new Date(8640000000000000);
            return getSortDate(b) - getSortDate(a);
        });

    const currentCard = activeCards[currentCardIndex];

    // Format balance based on card type
    const formatBalance = (balance, cardType) => {
        if (cardType === 1) { // Money card
            return `฿${balance}`;
        }
        return `${balance} ${t('buy_card.rounds')}`;
    };

    // Helper to safely parse date
    const parseDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    };

    // Calculate time remaining (matches Home logic)
    const getTimeRemaining = (card) => {
        // Case 1: Card NOT used yet - show validity period
        if (!card.card_firstuse) {
            if (card.card_expire) {
                const hours = parseInt(card.card_expire);
                if (hours >= 24) {
                    const days = Math.floor(hours / 24);
                    return t('home.days_before_use', { days });
                }
                return t('home.hours_before_use', { hours });
            }
            return '-';
        }

        // Case 2: Card used - show days remaining until expiry
        const expiryDateStr = card.card_expire_date || card.card_expiredate; // Handle both potential keys
        const expiryDate = parseDate(expiryDateStr);

        if (!expiryDate) {
            return '-';
        }

        const now = new Date();
        const diffMs = expiryDate - now;

        if (diffMs <= 0) {
            return t('card_detail.expired');
        }

        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return `${diffDays} ${t('home.days_plural')} ${t('card_detail.left')}`;
    };

    // Get card status
    const getCardStatus = (card) => {
        // Logic from Home: Filter New vs Active
        if (!card.card_firstuse) {
            return { label: t('card_detail.new'), color: '#4CAF50' };
        }

        const expiryDateStr = card.card_expire_date || card.card_expiredate;
        const expiryDate = parseDate(expiryDateStr);
        const now = new Date();

        if (expiryDate && expiryDate <= now) {
            return { label: t('card_detail.expired'), color: '#F44336' };
        }

        if (card.card_type === 0 && card.card_balance === 0) {
            return { label: t('card_detail.expired'), color: '#F44336' };
        }

        return { label: t('card_detail.active'), color: '#2196F3' };
    };

    // Format expiry date
    const formatExpiryDate = (card) => {
        if (!card.card_firstuse) {
            return t('home.no_expiry');
        }

        const expiryDateStr = card.card_expire_date || card.card_expiredate;
        const date = parseDate(expiryDateStr);

        if (!date) {
            return '-';
        }

        return date.toLocaleDateString(i18n.language, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleCardChange = (index) => {
        setCurrentCardIndex(index);
    };

    // Detect scroll position and auto-update current card
    const handleScroll = (e) => {
        const slider = e.target;
        const scrollLeft = slider.scrollLeft;
        const cardWidth = slider.offsetWidth * 0.9 + 16; // 90% width + gap
        const newIndex = Math.round(scrollLeft / cardWidth);

        if (newIndex !== currentCardIndex && newIndex >= 0 && newIndex < activeCards.length) {
            setCurrentCardIndex(newIndex);
        }
    };

    // Fetch/update card data when current card changes
    useEffect(() => {
        if (currentCard && profile?.userId) {
            // console.log('Current card changed:', currentCard.card_id);
        }
    }, [currentCardIndex, currentCard, profile?.userId]);

    if (isLoading) {
        return (
            <div className="home-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (activeCards.length === 0) {
        return (
            <div className="home-container">
                <header className="home-header">
                    <h1>{t('home.title')}</h1>
                </header>
                <div className="empty-state">
                    <p>{t('home.no_cards')}</p>
                    <button className="btn-buycard" onClick={() => onNavigate('buycard')} style={{
                        marginTop: '16px',
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'var(--primary-color)',
                        color: 'white',
                        fontWeight: '600'
                    }}>
                        {t('home.buy_new_card')}
                    </button>
                </div>
            </div>
        );
    }

    const status = currentCard ? getCardStatus(currentCard) : null;

    return (
        <div className="home-container">
            {/* Header */}
            <header className="home-header">
                <h1>{t('home.title')}</h1>
            </header>

            {/* Card Slider */}
            <div className="card-slider-section">
                <div className="card-slider" onScroll={handleScroll}>
                    {activeCards.map((card, index) => (
                        <div
                            key={card.card_id}
                            className={`slider-card-wrapper ${index === currentCardIndex ? 'active' : ''}`}
                            onClick={() => handleCardChange(index)}
                        >
                            <div className={`authentic-card ${card.card_type === 1 ? 'authentic-card-adult' : 'authentic-card-student'}`}>
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
                        </div>
                    ))}
                </div>

                {/* Slider Indicators */}
                {activeCards.length > 1 && (
                    <div className="slider-indicators">
                        {activeCards.map((_, index) => (
                            <button
                                key={index}
                                className={`indicator-dot ${index === currentCardIndex ? 'active' : ''}`}
                                onClick={() => handleCardChange(index)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Card Details */}
            {currentCard && (
                <div className="card-details-section">
                    {/* QR Code */}
                    <div className="detail-card qr-card">
                        <div className="qr-scanner-frame">
                            <div className="qr-code-wrapper">
                                <QRCodeSVG
                                    value={currentCard.card_hash || '4b1a97a120061ffac3f3b77abdd3c0ae842981ab84928a11572a5e8341280a7c'}
                                    size={160}
                                    level="M"
                                    includeMargin={false}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                />
                            </div>
                            <div className="scanner-corner top-left"></div>
                            <div className="scanner-corner top-right"></div>
                            <div className="scanner-corner bottom-left"></div>
                            <div className="scanner-corner bottom-right"></div>
                        </div>
                        <p className="qr-label">{t('card_detail.scan_to_use')}</p>
                    </div>

                    {/* Balance */}
                    <div className="detail-card">
                        <div className="detail-content">
                            <span className="detail-label">{t('home.balance')}</span>
                            <span className="detail-value">{formatBalance(currentCard.card_balance, currentCard.card_type)}</span>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="detail-card">
                        <div className="detail-content">
                            <span className="detail-label">{t('card_detail.status')}</span>
                            <span className="detail-value" style={{ color: status?.color }}>{status?.label}</span>
                        </div>
                    </div>

                    {/* Expiry Date */}
                    <div className="detail-card">
                        <div className="detail-content">
                            <span className="detail-label">{t('card_detail.expires_on')}</span>
                            <span className="detail-value">{formatExpiryDate(currentCard)}</span>
                        </div>
                    </div>

                    {/* Time Remaining */}
                    <div className="detail-card">
                        <div className="detail-content">
                            <span className="detail-label">{t('card_detail.time_remaining')}</span>
                            <span className="detail-value">{getTimeRemaining(currentCard)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
