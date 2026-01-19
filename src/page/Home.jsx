import { useState, useEffect } from 'react';
import './home.css';
import './authentic-card.css';
import CardDetailModal from '../components/CardDetailModal';
import { useLiff } from '../context/LiffContext';
import { useCardStore } from '../store/cardStore';
import { useTranslation } from 'react-i18next';

// Icons as SVG components
const WalletIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
        <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
        <circle cx="17" cy="14" r="2" fill="currentColor" />
    </svg>
);

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

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

// Format card expiry display
// If card has been used (card_firstuse exists), show actual expiry date
// If card has NOT been used, show "X Days left before first use"
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

// Format card balance display
const formatBalance = (balance, cardType) => {
    if (cardType === 0) {
        return `${balance} Round${balance > 1 ? 's' : ''}`;
    }
    return `฿${balance.toLocaleString()}`;
};

import { getMemberByUserId } from '../services/memberService';

function Home({ onNavigate }) {
    const { t } = useTranslation();
    const [selectedCard, setSelectedCard] = useState(null);
    const [filter, setFilter] = useState('all');


    // Get LIFF profile
    const { profile, isLoading: liffLoading } = useLiff();

    // Get card store
    const {
        cards,
        isLoading: cardsLoading,
        fetchCardsByUuid,
        getTotalBalance,
        error
    } = useCardStore();

    // Fetch cards and member data when profile is loaded
    useEffect(() => {
        if (profile?.userId) {
            console.log('Fetching cards for user:', profile.userId);
            fetchCardsByUuid(profile.userId);

            getMemberByUserId(profile.userId)
                .then(response => {
                    if (response?.status === 'error' || !response?.data) {
                        // User not found or error, redirect to register
                        // console.log('User not found, redirecting to register');
                        onNavigate('register');
                    } else if (response?.data) {
                        // User exists
                    }
                })
                .catch(err => {
                    console.error('Failed to fetch member data:', err);
                    // Check if error message indicates not found (depending on how axios/fetch wraps it)
                    // If the API returns 404 or specific error for not found, handle here
                    if (err.status === 404 || err.message?.includes('ไม่พบข้อมูลสมาชิก')) {
                        onNavigate('register');
                    }
                });
        }
    }, [profile?.userId, fetchCardsByUuid]);

    // Filter cards based on selection and existing logic
    const filteredCards = cards.filter(card => {
        // First Apply existing Logic: Hide 0 round cards
        if (card.card_type === 0 && card.card_balance === 0) return false;

        // Apply UI Filter
        if (filter === 'new') return !card.card_firstuse;
        if (filter === 'active') return card.card_firstuse;
        return true;
    });

    // If a card is selected, show the modal - logic moved to render
    // early return removed to allow overlay style

    const isLoading = liffLoading || cardsLoading;

    return (
        <div className="home-container">
            {/* Header
            <header className="home-header">
                <div className="header-content">
                    <h1 className="header-title">
                        {t('home.greeting', { name: profile?.displayName || t('home.guest') })} <span className="wave">👋</span>
                    </h1>
                    <p className="header-subtitle">{t('home.select_card_instruction')}</p>
                </div>
            </header> */}

            {/* My Cards Section */}
            <div className="cards-section">
                <div className="cards-header-row">
                    <div className="cards-header-top">
                        <h3 className="cards-title">{t('home.my_cards')}</h3>
                        <button className="btn-new-card" onClick={() => onNavigate('buycard')}>+ {t('home.new_card')}</button>
                    </div>
                    <div className="home-filter-tabs">
                        <button
                            className={`home-filter-tab ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            {t('home.filter_all')}
                        </button>
                        <button
                            className={`home-filter-tab ${filter === 'new' ? 'active' : ''}`}
                            onClick={() => setFilter('new')}
                        >
                            {t('home.filter_new')}
                        </button>
                        <button
                            className={`home-filter-tab ${filter === 'active' ? 'active' : ''}`}
                            onClick={() => setFilter('active')}
                        >
                            {t('home.filter_in_use')}
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="cards-loading">
                        <div className="loading-spinner"></div>
                        <p>{t('common.loading')}</p>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="cards-error">
                        <p>{t('common.error')}: {error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && cards.length === 0 && (
                    <div className="cards-empty">
                        <p>{t('home.no_cards')}</p>
                        <button className="btn-buycard" onClick={() => onNavigate('buycard')}>
                            {t('home.buy_new_card')}
                        </button>
                    </div>
                )}

                {/* Virtual Cards List */}
                {!isLoading && filteredCards.length > 0 && (
                    <div className="cards-list">
                        {[...filteredCards]
                            .sort((a, b) => new Date(b.card_create) - new Date(a.card_create))
                            .map(card => (
                                <div
                                    key={card.card_id}
                                    className={`authentic-card ${card.card_type === 1 ? 'authentic-card-adult' : 'authentic-card-student'}`}
                                    onClick={() => setSelectedCard(card)}
                                >
                                    {/* Sunburst Background */}
                                    <div className="authentic-card-sunburst"></div>

                                    {/* Card Content */}
                                    <div className="authentic-card-content">
                                        {/* Top Bus Illustration */}
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

                                        {/* Center with Large Text and Shapes */}
                                        <div className="authentic-card-center">
                                            <div className="authentic-shape authentic-shape-1"></div>
                                            <div className="authentic-shape authentic-shape-2"></div>
                                            <span className="authentic-text">ซิ่ง</span>
                                        </div>

                                        {/* Bottom Branding */}
                                        <div className="authentic-card-bottom">
                                            <span className="authentic-brand">บัตรซิ่ง</span>
                                        </div>

                                        {/* Info Badge */}
                                        <div className="authentic-info-badge">
                                            <div className="authentic-info-row">
                                                <span className="authentic-info-label">{t('home.balance')}</span>
                                                <span className="authentic-info-value">{formatBalance(card.card_balance, card.card_type)}</span>
                                            </div>
                                            <div className="authentic-info-row">
                                                <span className="authentic-info-label">{t('home.expires')}</span>
                                                <span className="authentic-info-value-small">{formatExpiry(card, t)}</span>
                                            </div>
                                        </div>

                                        {!card.card_firstuse && (
                                            <div className="authentic-new-badge">{t('home.filter_new')}</div>
                                        )}
                                    </div>

                                    {/* Right Vertical Text */}
                                    <div className="authentic-card-strip">
                                        <span className="authentic-strip-text">
                                            {card.card_type === 1 ? 'e-THAI ADULT' : 'NRMS STUDENT'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedCard && (
                <CardDetailModal
                    card={selectedCard}
                    onClose={() => setSelectedCard(null)}
                    isOpen={!!selectedCard}
                />
            )}
        </div>
    );
}

export default Home;
