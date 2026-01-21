import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useCardStore } from '../store/cardStore';
import { useLiff } from '../context/LiffContext';
import { useTranslation } from 'react-i18next';
import './YourCard.css';
import CardImage from '../assets/FREE_SHUTTLE_Card.png';

const YourCard = ({ onNavigate }) => {
    const { t, i18n } = useTranslation();
    const { cards, isLoading, fetchCardsByUuid } = useCardStore();
    const { profile } = useLiff();
    const sliderRef = useRef(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    // Fetch cards when profile is loaded
    useEffect(() => {
        if (profile?.userId) {
            fetchCardsByUuid(profile.userId);
        }
    }, [profile?.userId, fetchCardsByUuid]);

    // Filter out expired cards and sort
    const activeCards = cards
        .filter(card => {
            const expiryDateStr = card.card_expire_date || card.card_expiredate;
            if (expiryDateStr) {
                const expiry = new Date(expiryDateStr);
                if (expiry < new Date()) return false;
            }
            if (card.card_type === 0 && card.card_balance <= 0) {
                return false;
            }
            return true;
        })
        .sort((a, b) => {
            const getSortDate = (c) => c.card_firstuse ? new Date(c.card_firstuse) : new Date(8640000000000000);
            return getSortDate(b) - getSortDate(a);
        });

    const currentCard = activeCards[currentCardIndex];

    // Helper to safely parse date
    const parseDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    };

    // Get card status
    const getCardStatus = (card) => {
        if (!card) return { label: '-', color: '#888' };

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

        return { label: t('card_detail.active'), color: '#4CAF50' };
    };

    // Format expiry date
    const formatExpiryDate = (card) => {
        if (!card) return '-';
        if (!card.card_firstuse) {
            return t('home.no_expiry');
        }

        const expiryDateStr = card.card_expire_date || card.card_expiredate;
        const date = parseDate(expiryDateStr);

        if (!date) return '-';

        return date.toLocaleDateString(i18n.language, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Calculate time remaining
    const getTimeRemaining = (card) => {
        if (!card) return '-';

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

        const expiryDateStr = card.card_expire_date || card.card_expiredate;
        const expiryDate = parseDate(expiryDateStr);

        if (!expiryDate) return '-';

        const now = new Date();
        const diffMs = expiryDate - now;

        if (diffMs <= 0) {
            return t('card_detail.expired');
        }

        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (diffDays > 0) {
            return `${diffDays} ${t('home.days_plural')} ${diffHours} ${t('home.hours_plural')}`;
        }
        return `${diffHours} ${t('home.hours_plural')}`;
    };

    // Format balance based on card type
    const formatBalance = (card) => {
        if (!card) return { value: '-', unit: '' };
        if (card.card_type === 1) {
            return { value: `฿${card.card_balance}`, unit: 'THB' };
        }
        // return `${card.card_balance} ${t('buy_card.rounds')}`;
        return { value: card.card_balance, unit: t('buy_card.rounds') };
    };

    const scrollToCard = (index) => {
        if (sliderRef.current) {
            const card = sliderRef.current.children[index];
            if (card) {
                const scrollLeft = card.offsetLeft - (sliderRef.current.clientWidth / 2) + (card.offsetWidth / 2);
                sliderRef.current.scrollTo({
                    left: scrollLeft,
                    behavior: 'smooth'
                });
            }
        }
    };

    const handleCardChange = (index) => {
        setCurrentCardIndex(index);
        setIsFlipped(false);
        scrollToCard(index);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleScroll = (e) => {
        const slider = e.target;
        const scrollLeft = slider.scrollLeft;

        // Dynamic card width calculation (card width + gap)
        const firstCard = slider.querySelector('.card-wrapper');
        const cardWidth = firstCard ? firstCard.offsetWidth + 16 : slider.offsetWidth * 0.8;

        const newIndex = Math.round(scrollLeft / cardWidth);

        if (newIndex !== currentCardIndex && newIndex >= 0 && newIndex < activeCards.length) {
            setCurrentCardIndex(newIndex);
            setIsFlipped(false);
        }
    };

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
                    <h1>{t('menu.yourcard')}</h1>
                </header>
                <div className="empty-state">
                    <p>{t('home.no_cards')}</p>
                    <button className="btn-buycard" onClick={() => onNavigate('buycard')}>
                        {t('home.buy_new_card')}
                    </button>
                </div>
            </div>
        );
    }

    const status = currentCard ? getCardStatus(currentCard) : null;
    const isSingleCard = activeCards.length === 1;

    return (
        <div className="yourcard-container">
            {/* Header */}
            <header className="yourcard-header">
                <h1>{t('menu.yourcard')}</h1>
            </header>

            {/* Card Display - Centered */}
            <div className="card-display-section">
                <div
                    ref={sliderRef}
                    className={`card-slider-vertical ${isSingleCard ? 'single-card' : ''}`}
                    onScroll={handleScroll}
                >
                    {activeCards.map((card, index) => (
                        <div
                            key={card.card_id}
                            className={`card-wrapper ${index === currentCardIndex ? 'active' : ''}`}
                            onClick={() => {
                                if (index === currentCardIndex) {
                                    handleFlip();
                                } else {
                                    handleCardChange(index);
                                }
                            }}
                        >
                            <div className={`flip-card ${index === currentCardIndex && isFlipped ? 'flipped' : ''}`}>
                                {/* Front Side - Card Image */}
                                <div className="flip-card-front">
                                    <img
                                        src={CardImage}
                                        alt="Card"
                                        className="card-image"
                                    />
                                </div>

                                {/* Back Side - QR Code */}
                                <div className="flip-card-back">
                                    <div className="card-back-blur">
                                        <img
                                            src={CardImage}
                                            alt="Card Background"
                                            className="card-image-blurred"
                                        />
                                    </div>
                                    <div className="card-back-qr">
                                        <h3>QR Code ของคุณ</h3>
                                        <div className="qr-wrapper">
                                            <QRCodeSVG
                                                value={card.card_hash || 'default-hash'}
                                                size={200}
                                                level="M"
                                                bgColor="#ffffff"
                                                fgColor="#2E7D32"
                                            />
                                        </div>
                                        <button className="flip-btn" onClick={(e) => { e.stopPropagation(); handleFlip(); }}>
                                            ↺ พลิกกลับ
                                        </button>
                                    </div>
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

                <p className="tap-hint">แตะบัตรเพื่อดู QR Code</p>
            </div>

            {/* Card Info Section - Below Card */}
            {currentCard && (
                <div className="card-info-panel">
                    {/* Balance Card */}
                    <div className="info-card balance-card">
                        <div className="info-card-header">
                            <span className="info-icon">�</span>
                            <span className="info-title">{t('home.balance')}</span>
                        </div>
                        <div className="balance-content">
                            <span className="balance-label">{t('home.balance')}</span>
                            <div className="balance-value-group">
                                <span className="balance-number">{formatBalance(currentCard).value}</span>
                                <span className="balance-unit">{formatBalance(currentCard).unit}</span>
                            </div>
                        </div>
                        <div className="balance-icon-bg">
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fillOpacity="0.2" />
                                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fillOpacity="0.1" />
                            </svg>
                        </div>
                    </div>

                    {/* Status & Details */}
                    <div className="info-card details-card">
                        <div className="detail-row">
                            <span className="detail-label">{t('card_detail.status')}</span>
                            <span className="detail-value" style={{ color: status?.color }}>{status?.label}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">{t('card_detail.expires_on')}</span>
                            <span className="detail-value">{formatExpiryDate(currentCard)}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">{t('card_detail.time_remaining')}</span>
                            <span className="detail-value">{getTimeRemaining(currentCard)}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">🔒 ล็อคบัตร</span>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={isLocked}
                                    onChange={(e) => setIsLocked(e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YourCard;
