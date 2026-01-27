import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useCardStore } from '../store/cardStore';
import { useLiff } from '../context/LiffContext';
import { useTranslation } from 'react-i18next';
import { lockCard, setCardMain } from '../services/cardService';
import './home.css';
import CardImage from '../assets/FREE_SHUTTLE_Card.png';
import CardBusAdult from '../assets/card_bus_adult.png';
import CardBusStudent from '../assets/card_bus_student.png';
import CardBusOneDayPass from '../assets/card_bus_onedaypass.png';
import useImageColor from '../hooks/useImageColor';

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

const Home = ({ onNavigate }) => {
    const { t, i18n } = useTranslation();
    const { cards, isLoading, fetchCardsByUuid } = useCardStore();
    const { profile, member } = useLiff();
    const sliderRef = useRef(null);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Lock states - track lock status per card
    const [cardLockStates, setCardLockStates] = useState({});
    const [showLockConfirm, setShowLockConfirm] = useState(false);
    const [lockAction, setLockAction] = useState(null); // 'lock' or 'unlock'
    const [isLocking, setIsLocking] = useState(false);

    // Main card states
    const [showMainCardConfirm, setShowMainCardConfirm] = useState(false);
    const [isSettingMain, setIsSettingMain] = useState(false);
    const [hasExistingMainCard, setHasExistingMainCard] = useState(false);

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
            // Main card always comes first (card_main === 1)
            const aMain = a.card_main === 1;
            const bMain = b.card_main === 1;
            if (aMain && !bMain) return -1;
            if (!aMain && bMain) return 1;

            // Check lock status (card_lock: 0 = locked, 1 = unlocked)
            const aLocked = a.card_lock === 0;
            const bLocked = b.card_lock === 0;

            // Locked cards go to the end
            if (aLocked && !bLocked) return 1;
            if (!aLocked && bLocked) return -1;

            // Same lock status, sort by first use date
            const getSortDate = (c) => c.card_firstuse ? new Date(c.card_firstuse) : new Date(8640000000000000);
            return getSortDate(b) - getSortDate(a);
        });

    // Check if there's an existing main card
    const existingMainCard = activeApiCards.find(card => card.card_main === 1);

    // Combine active API cards with static mock cards
    const displayCards = [...activeApiCards, ...staticCards];

    const currentCard = displayCards[currentCardIndex];

    // Dynamic Color Extraction
    const activeCardImage = currentCard ? getCardImage(currentCard) : null;
    const { color: extractedColor } = useImageColor(activeCardImage);

    // Dynamic style for balance card
    const balanceCardStyle = currentCard ? {
        background: `linear-gradient(135deg, ${extractedColor} 0%, rgba(0,0,0,0.8) 120%)`,
        border: '1px solid rgba(255,255,255,0.1)'
    } : {};

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

    // Check if current card is locked
    const isCardLocked = (card) => {
        if (!card) return false;
        // Check from API response first (card_lock: 0 = locked, 1 = unlocked)
        if (card.card_lock !== undefined) {
            return card.card_lock === 0;
        }
        // Fall back to local state
        return cardLockStates[card.card_id] === true;
    };

    // Handle lock toggle click - show confirmation
    const handleLockToggle = () => {
        if (!currentCard) return;
        const currentlyLocked = isCardLocked(currentCard);
        setLockAction(currentlyLocked ? 'unlock' : 'lock');
        setShowLockConfirm(true);
    };

    // Handle confirm lock/unlock
    const handleConfirmLock = async () => {
        if (!currentCard || isLocking) return;

        setIsLocking(true);
        try {
            // card_lock: 0 = locked, 1 = unlocked
            const newLockStatus = lockAction === 'lock' ? 0 : 1;

            // Skip API call for mock cards (card_id could be number from API)
            const cardIdStr = String(currentCard.card_id);
            if (!cardIdStr.startsWith('mock-')) {
                await lockCard(currentCard.card_id, newLockStatus);
            }

            // Update local state
            setCardLockStates(prev => ({
                ...prev,
                [currentCard.card_id]: lockAction === 'lock'
            }));

            // Reset flip state if locking
            if (lockAction === 'lock') {
                setIsFlipped(false);
            }

            // Refresh cards data from server
            if (profile?.userId) {
                await fetchCardsByUuid(profile.userId);
            }
        } catch (error) {
            console.error('Failed to lock/unlock card:', error);
        } finally {
            setIsLocking(false);
            setShowLockConfirm(false);
            setLockAction(null);
        }
    };

    // Cancel lock confirmation
    const handleCancelLock = () => {
        setShowLockConfirm(false);
        setLockAction(null);
    };

    // Handle set main card button click
    const handleSetMainCard = () => {
        // Check if there's already a main card (that's not the current card)
        if (existingMainCard && existingMainCard.card_id !== currentCard?.card_id) {
            setHasExistingMainCard(true);
        } else {
            setHasExistingMainCard(false);
        }
        setShowMainCardConfirm(true);
    };

    // Confirm set main card
    const handleConfirmMainCard = async () => {
        if (!currentCard || isSettingMain) return;

        setIsSettingMain(true);
        try {
            const cardIdStr = String(currentCard.card_id);
            // Skip API call for mock cards
            if (!cardIdStr.startsWith('mock-')) {
                // Use member_id from member context
                const cardUserId = member?.member_id || currentCard.card_user_id;
                await setCardMain(currentCard.card_id, cardUserId);
            }

            // Refresh cards data from server
            if (profile?.userId) {
                await fetchCardsByUuid(profile.userId);
                // Reset to first card since main card will be at the front
                setCurrentCardIndex(0);
            }
        } catch (error) {
            console.error('Failed to set main card:', error);
        } finally {
            setIsSettingMain(false);
            setShowMainCardConfirm(false);
        }
    };

    // Cancel main card confirmation
    const handleCancelMainCard = () => {
        setShowMainCardConfirm(false);
    };

    // Handle card click - block flip if locked
    const handleCardClick = (index) => {
        if (index === currentCardIndex) {
            // Only allow flip if not locked
            if (!isCardLocked(currentCard)) {
                handleFlip();
            }
        } else {
            handleCardChange(index);
        }
    };

    const currentCardIsLocked = isCardLocked(currentCard);

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
                    {displayCards.map((card, index) => {
                        const cardIsLocked = isCardLocked(card);
                        return (
                            <div
                                key={card.card_id}
                                className={`card-wrapper ${index === currentCardIndex ? 'active' : ''} ${cardIsLocked ? 'locked' : ''}`}
                                onClick={() => handleCardClick(index)}
                            >
                                <div className={`flip-card ${index === currentCardIndex && isFlipped && !cardIsLocked ? 'flipped' : ''}`}>
                                    {/* Front Side - Card Image */}
                                    <div className="flip-card-front">
                                        <img
                                            src={getCardImage(card)}
                                            alt="Card"
                                            className="card-image"
                                        />
                                        {/* Main Card Star Icon */}
                                        {!String(card.card_id).startsWith('mock-') && (
                                            <div
                                                className={`main-card-star ${card.card_main === 1 ? 'is-main' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (card.card_main !== 1) {
                                                        // Set this card as current and trigger set main
                                                        setCurrentCardIndex(index);
                                                        handleSetMainCard();
                                                    }
                                                }}
                                            >
                                                {card.card_main === 1 ? (
                                                    // Filled Star
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                ) : (
                                                    // Outline Star
                                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                    </svg>
                                                )}
                                            </div>
                                        )}
                                        {/* Lock Overlay */}
                                        {cardIsLocked && (
                                            <div className="card-lock-overlay">
                                                <div className="lock-icon">
                                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                                    </svg>
                                                </div>
                                                <p className="lock-text">{t('card_detail.card_is_locked')}</p>
                                            </div>
                                        )}
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
                        );
                    })}
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
                    {/* Show different UI based on lock state */}
                    {currentCardIsLocked ? (
                        /* Locked State - Show only unlock button */
                        <div className="info-card locked-card-info">
                            <div className="locked-message">
                                <div className="locked-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                    </svg>
                                </div>
                                <h3>{t('card_detail.card_is_locked')}</h3>
                                <p>{t('card_detail.card_locked_description')}</p>
                            </div>
                            <button
                                className="btn-unlock"
                                onClick={handleLockToggle}
                                disabled={isLocking}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z" />
                                </svg>
                                {t('card_detail.unlock_button')}
                            </button>
                        </div>
                    ) : (
                        /* Unlocked State - Show full info */
                        <>
                            {/* Balance Card */}
                            <div
                                className={`info-card balance-card ${getCardGradientClass(currentCard)}`}
                                style={balanceCardStyle}
                            >
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
                                            checked={currentCardIsLocked}
                                            onChange={handleLockToggle}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Lock Confirmation Modal */}
            {showLockConfirm && (
                <div className="lock-modal-overlay" onClick={handleCancelLock}>
                    <div className="lock-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="lock-modal-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                {lockAction === 'lock' ? (
                                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                                ) : (
                                    <path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm6-9h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z" />
                                )}
                            </svg>
                        </div>
                        <h3 className="lock-modal-title">
                            {lockAction === 'lock'
                                ? t('card_detail.lock_confirm_title')
                                : t('card_detail.unlock_confirm_title')
                            }
                        </h3>
                        <p className="lock-modal-message">
                            {lockAction === 'lock'
                                ? t('card_detail.lock_confirm_message')
                                : t('card_detail.unlock_confirm_message')
                            }
                        </p>
                        <div className="lock-modal-buttons">
                            <button
                                className="btn-cancel"
                                onClick={handleCancelLock}
                                disabled={isLocking}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                className={`btn-confirm ${lockAction === 'lock' ? 'danger' : 'success'}`}
                                onClick={handleConfirmLock}
                                disabled={isLocking}
                            >
                                {isLocking ? t('common.loading') : t('common.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Card Confirmation Modal */}
            {showMainCardConfirm && (
                <div className="lock-modal-overlay" onClick={handleCancelMainCard}>
                    <div className="lock-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="lock-modal-icon main-card-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                        <h3 className="lock-modal-title">
                            {hasExistingMainCard
                                ? t('card_detail.main_card_replace_title')
                                : t('card_detail.main_card_confirm_title')
                            }
                        </h3>
                        <p className="lock-modal-message">
                            {hasExistingMainCard
                                ? t('card_detail.main_card_replace_message')
                                : t('card_detail.main_card_confirm_message')
                            }
                        </p>
                        <div className="lock-modal-buttons">
                            <button
                                className="btn-cancel"
                                onClick={handleCancelMainCard}
                                disabled={isSettingMain}
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                className="btn-confirm success"
                                onClick={handleConfirmMainCard}
                                disabled={isSettingMain}
                            >
                                {isSettingMain ? t('common.loading') : t('common.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;

