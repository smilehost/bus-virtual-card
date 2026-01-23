import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useCardStore } from '../store/cardStore';
import { useLiff } from '../context/LiffContext';
import { useTranslation } from 'react-i18next';
import './home.css';
import CardImage from '../assets/FREE_SHUTTLE_Card.png';
import CardBusAdult from '../assets/card_bus_adult.png';
import CardBusStudent from '../assets/card_bus_student.png';
import CardBusOneDayPass from '../assets/card_bus_onedaypass.png';

// Static card data for display (UI only - Mock data) - Matches YourCard.jsx
const staticCards = [
    {
        card_id: 'mock-adult-001',
        card_name: 'บัตรซิ่ง ผู้ใหญ่',
        image: CardBusAdult,
        card_type: 0,
        card_balance: 30,
        card_hash: 'MOCK-ADULT-HASH-001',
        card_firstuse: '2026-01-15T10:00:00Z',
        card_expire_date: '2026-02-15T23:59:59Z',
    },
    {
        card_id: 'mock-student-002',
        card_name: 'บัตรซิ่ง นักเรียน',
        image: CardBusStudent,
        card_type: 0,
        card_balance: 50,
        card_hash: 'MOCK-STUDENT-HASH-002',
        card_firstuse: '2026-01-10T08:00:00Z',
        card_expire_date: '2026-03-10T23:59:59Z',
    },
    {
        card_id: 'mock-onedaypass-003',
        card_name: 'บัตรซิ่ง One-Day Pass',
        image: CardBusOneDayPass,
        card_type: 1,
        card_balance: 100,
        card_hash: 'MOCK-ONEDAYPASS-HASH-003',
        card_firstuse: null, // ยังไม่เคยใช้
        card_expire: '24', // อายุ 24 ชั่วโมงหลังใช้ครั้งแรก
    },
];

const Home = ({ onNavigate }) => {
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
    const activeApiCards = cards
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

    // Combine active API cards with static mock cards
    const displayCards = [...activeApiCards, ...staticCards];

    const currentCard = displayCards[currentCardIndex];

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
        return { value: card.card_balance, unit: t('buy_card.rounds') };
    };

    // Get card image based on card type
    const getCardImage = (card) => {
        if (!card) return CardImage;
        if (card.image) return card.image;

        // Determine image based on card_type
        if (card.card_type === 1) {
            const name = (card.card_name || '').toLowerCase();
            if (name.includes('one-day') || name.includes('oneday')) return CardBusOneDayPass;
            return CardBusAdult; // Money card defaults to adult if not one-day
        }

        // For round cards, check card name or default to student
        const name = (card.card_name || '').toLowerCase();
        if (name.includes('adult') || name.includes('ผู้ใหญ่')) return CardBusAdult;
        if (name.includes('student') || name.includes('นักเรียน')) return CardBusStudent;

        return CardImage; // Default Free Shuttle/General
    };

    // Get card gradient class
    const getCardGradientClass = (card) => {
        if (!card) return '';
        if (card.card_type === 1) return 'oneday';

        const name = (card.card_name || '').toLowerCase();
        if (name.includes('adult') || name.includes('ผู้ใหญ่')) return 'adult';
        if (name.includes('student') || name.includes('นักเรียน')) return 'student';

        return '';
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

        const firstCard = slider.querySelector('.card-wrapper');
        const cardWidth = firstCard ? firstCard.offsetWidth + 16 : slider.offsetWidth * 0.8;

        const newIndex = Math.round(scrollLeft / cardWidth);

        if (newIndex !== currentCardIndex && newIndex >= 0 && newIndex < displayCards.length) {
            setCurrentCardIndex(newIndex);
            setIsFlipped(false);
        }
    };

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

    if (displayCards.length === 0) {
        return (
            <div className="home-container">
                <header className="home-header">
                    <h1>{t('home.title')}</h1>
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
    const isSingleCard = displayCards.length === 1;

    return (
        <div className="home-container">
            {/* Header */}
            <header className="home-header">
                <h1>{t('home.title')}</h1>
            </header>

            {/* Card Display - Centered */}
            <div className="card-display-section">
                <div
                    ref={sliderRef}
                    className={`card-slider-vertical ${isSingleCard ? 'single-card' : ''}`}
                    onScroll={handleScroll}
                >
                    {displayCards.map((card, index) => (
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
                                        src={getCardImage(card)}
                                        alt="Card"
                                        className="card-image"
                                    />
                                </div>

                                {/* Back Side - QR Code */}
                                <div className="flip-card-back">
                                    <div className="card-back-blur">
                                        <img
                                            src={getCardImage(card)}
                                            alt="Card Background"
                                            className="card-image-blurred"
                                        />
                                    </div>
                                    <div className="card-back-qr">
                                        <h3>{t('card_detail.your_qr_code')}</h3>
                                        <div className="qr-wrapper">
                                            <QRCodeSVG
                                                value={card.card_hash || 'default-hash'}
                                                size={200}
                                                level="M"
                                                bgColor="#ffffff"
                                                fgColor="#000000"
                                            />
                                        </div>
                                        <button className="flip-btn" onClick={(e) => { e.stopPropagation(); handleFlip(); }}>
                                            ↺ {t('card_detail.flip_back')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Slider Indicators */}
                {displayCards.length > 1 && (
                    <div className="slider-indicators">
                        {displayCards.map((_, index) => (
                            <button
                                key={index}
                                className={`indicator-dot ${index === currentCardIndex ? 'active' : ''}`}
                                onClick={() => handleCardChange(index)}
                            />
                        ))}
                    </div>
                )}

                <p className="tap-hint">{t('home.tap_to_see_qr')}</p>
            </div>

            {/* Card Info Section - Below Card */}
            {currentCard && (
                <div className="card-info-panel">
                    {/* Balance Card */}
                    <div className={`info-card balance-card ${getCardGradientClass(currentCard)}`}>
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
                            <span className="detail-label">{t('card_detail.lock_card')}</span>
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

export default Home;
