import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useCardStore } from '../store/cardStore';
import { useLiff } from '../context/LiffContext';
import { useTranslation } from 'react-i18next';
import './YourCard.css';
import '../page/authentic-card.css';

const YourCard = () => {
    const { t } = useTranslation();
    const { cards, isLoading } = useCardStore();
    const { profile } = useLiff();
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [lockCard, setLockCard] = useState(false);

    // Filter out expired cards with zero balance
    const activeCards = cards.filter(card => {
        if (card.card_type === 0) { // Round card
            return card.card_balance > 0;
        }
        return true; // Money cards always show
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

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleCardChange = (index) => {
        setCurrentCardIndex(index);
    };

    // Detect scroll position and auto-update current card
    useEffect(() => {
        const slider = document.querySelector('.card-slider');
        if (!slider) return;

        const handleScroll = () => {
            const scrollLeft = slider.scrollLeft;
            const cardWidth = slider.offsetWidth * 0.9 + 16; // 90% width + gap
            const newIndex = Math.round(scrollLeft / cardWidth);

            if (newIndex !== currentCardIndex && newIndex >= 0 && newIndex < activeCards.length) {
                setCurrentCardIndex(newIndex);
            }
        };

        slider.addEventListener('scroll', handleScroll);
        return () => slider.removeEventListener('scroll', handleScroll);
    }, [currentCardIndex, activeCards.length]);

    // Fetch/update card data when current card changes
    useEffect(() => {
        if (currentCard && profile?.userId) {
            console.log('Current card changed:', currentCard.card_id);
        }
    }, [currentCardIndex, currentCard, profile?.userId]);

    if (isLoading) {
        return (
            <div className="yourcard-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (activeCards.length === 0) {
        return (
            <div className="yourcard-container">
                <header className="yourcard-header">
                    <h1>{t('yourcard.title')}</h1>
                </header>
                <div className="empty-state">
                    <p>{t('home.no_cards')}</p>
                </div>
            </div>
        );
    }

    const status = currentCard ? getCardStatus(currentCard) : null;

    return (
        <div className="yourcard-container">
            {/* Header */}
            <header className="yourcard-header">
                <h1>{t('yourcard.title')}</h1>
            </header>

            {/* Card Slider */}
            <div className="card-slider-section">
                <div className="card-slider">
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
                                        <span className="authentic-text">ซิ่ง</span>
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
                        <p className="qr-label">{t('yourcard.scan_to_use')}</p>
                    </div>

                    {/* Balance */}
                    <div className="detail-card">
                        <div className="detail-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="detail-content">
                            <span className="detail-label">{t('home.balance')}</span>
                            <span className="detail-value">{formatBalance(currentCard.card_balance, currentCard.card_type)}</span>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="detail-card">
                        <div className="detail-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <div className="detail-content">
                            <span className="detail-label">{t('card_detail.status')}</span>
                            <span className="detail-value" style={{ color: status?.color }}>{status?.label}</span>
                        </div>
                    </div>

                    {/* Expiry Date */}
                    <div className="detail-card">
                        <div className="detail-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="6" width="18" height="15" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
                                <path d="M7 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M17 3V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div className="detail-content">
                            <span className="detail-label">{t('card_detail.expires_on')}</span>
                            <span className="detail-value">{formatExpiryDate(currentCard)}</span>
                        </div>
                    </div>

                    {/* Time Remaining */}
                    <div className="detail-card">
                        <div className="detail-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <div className="detail-content">
                            <span className="detail-label">{t('card_detail.time_remaining')}</span>
                            <span className="detail-value">{getTimeRemaining(currentCard)}</span>
                        </div>
                    </div>

                    {/* Lock Card Toggle */}
                    <div className="detail-card toggle-card">
                        <div className="detail-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </div>
                        <div className="detail-content">
                            <span className="detail-label">{t('yourcard.lock_card')}</span>
                            <span className="detail-subtitle">{t('yourcard.lock_subtitle')}</span>
                        </div>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={lockCard}
                                onChange={(e) => setLockCard(e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YourCard;
