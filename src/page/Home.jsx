import { useState, useEffect } from 'react';
import './home.css';
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
    const [memberData, setMemberData] = useState(null);

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
                        setMemberData(response.data);
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

    // Calculate total balance from money cards
    const totalBalance = getTotalBalance();

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
            {/* Header */}
            <header className="home-header">
                <div className="header-icon">
                    <WalletIcon />
                </div>
                <h1 className="header-title">{t('home.title')}</h1>
            </header>

            {/* Balance Card */}
            <div className="balance-card">
                <div className="balance-content">
                    <span className="balance-label">{t('home.total_balance')}</span>
                    <h2 className="balance-amount">
                        {isLoading || !memberData ? '...' : `฿${(memberData.member_wallet || 0).toLocaleString()}`}
                    </h2>
                    <div className="balance-points">
                        <span className="points-label">{t('home.points')}:</span>
                        <span className="points-value">
                            {isLoading || !memberData ? '...' : (memberData.member_point || 0).toLocaleString()}
                        </span>
                    </div>
                    <div className="balance-actions">
                        <button className="btn-topup" onClick={() => onNavigate('topup')}>
                            <PlusIcon />
                            <span>{t('home.top_up')}</span>
                        </button>
                        <button className="btn-buycard" onClick={() => onNavigate('buycard')}>
                            <span>{t('home.buy_card')}</span>
                        </button>
                    </div>
                </div>
            </div>

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
                                    className={`virtual-card ${card.card_type === 1 ? 'money-card' : 'round-card'}`}
                                    onClick={() => setSelectedCard(card)}
                                    style={{ cursor: 'pointer' }}
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
                                        {!card.card_firstuse && (
                                            <span className="new-badge">{t('home.filter_new')}</span>
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
                                                {formatExpiry(card, t)}
                                            </span>
                                        </div>
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
