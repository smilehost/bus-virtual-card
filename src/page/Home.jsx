import { useState, useEffect } from 'react';
import './home.css';
import CardDetailModal from '../components/CardDetailModal';
import { useLiff } from '../context/LiffContext';
import { useCardStore } from '../store/cardStore';

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
        <rect x="2" y="4" width="20" height="16" rx="3" fill={type === 1 ? "url(#moneyGradient)" : "url(#roundGradient)"} stroke={type === 1 ? "#00ffa3" : "#00d9ff"} strokeWidth="1" />
        <path d="M2 10H22" stroke={type === 1 ? "#00ffa3" : "#00d9ff"} strokeWidth="1" />
        <defs>
            <linearGradient id="moneyGradient" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1a4a3a" />
                <stop offset="1" stopColor="#0a2015" />
            </linearGradient>
            <linearGradient id="roundGradient" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1a3a4a" />
                <stop offset="1" stopColor="#0a1520" />
            </linearGradient>
        </defs>
    </svg>
);

// Format card expiry display
const formatExpiry = (expireHours) => {
    if (!expireHours) return 'No expiry';
    const hours = parseInt(expireHours);
    if (hours >= 24) {
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} left`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
};

// Format card balance display
const formatBalance = (balance, cardType) => {
    if (cardType === 0) {
        return `${balance} Round${balance > 1 ? 's' : ''}`;
    }
    return `฿${balance.toLocaleString()}`;
};

function Home({ onNavigate }) {
    const [selectedCard, setSelectedCard] = useState(null);

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

    // Fetch cards when profile is loaded
    useEffect(() => {
        if (profile?.userId) {
            console.log('Fetching cards for user:', profile.userId);
            fetchCardsByUuid(profile.userId);
        }
    }, [profile?.userId, fetchCardsByUuid]);

    // Calculate total balance from money cards
    const totalBalance = getTotalBalance();

    // If a card is selected, show the modal
    if (selectedCard) {
        return (
            <CardDetailModal
                card={selectedCard}
                onClose={() => setSelectedCard(null)}
            />
        );
    }

    const isLoading = liffLoading || cardsLoading;

    return (
        <div className="home-container">
            {/* Header */}
            <header className="home-header">
                <div className="header-icon">
                    <WalletIcon />
                </div>
                <h1 className="header-title">Digital Wallet</h1>
            </header>

            {/* Balance Card */}
            <div className="balance-card">
                <div className="balance-content">
                    <span className="balance-label">Total Balance</span>
                    <h2 className="balance-amount">
                        {isLoading ? '...' : `฿${totalBalance.toLocaleString()}`}
                    </h2>
                    <div className="balance-actions">
                        <button className="btn-topup" onClick={() => onNavigate('topup')}>
                            <PlusIcon />
                            <span>Top Up</span>
                        </button>
                        <button className="btn-buycard" onClick={() => onNavigate('buycard')}>
                            <span>Buy Card</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* My Cards Section */}
            <div className="cards-section">
                <div className="cards-header">
                    <h3 className="cards-title">My Cards</h3>
                    <button className="btn-new-card" onClick={() => onNavigate('buycard')}>+ New Card</button>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="cards-loading">
                        <div className="loading-spinner"></div>
                        <p>กำลังโหลดบัตร...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="cards-error">
                        <p>เกิดข้อผิดพลาด: {error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && !error && cards.length === 0 && (
                    <div className="cards-empty">
                        <p>ยังไม่มีบัตร</p>
                        <button className="btn-buycard" onClick={() => onNavigate('buycard')}>
                            ซื้อบัตรใหม่
                        </button>
                    </div>
                )}

                {/* Virtual Cards List */}
                {!isLoading && cards.length > 0 && (
                    <div className="cards-list">
                        {[...cards]
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
                                                {card.card_type === 1 ? 'Money Card' : 'Round Card'}
                                            </span>
                                            <span className="card-type">
                                                {card.card_type === 1 ? 'money' : 'round'} · Virtual
                                            </span>
                                        </div>
                                    </div>
                                    <div className="card-bottom">
                                        <div className="card-balance">
                                            <span className="card-balance-label">Balance</span>
                                            <span className="card-balance-value">
                                                {formatBalance(card.card_balance, card.card_type)}
                                            </span>
                                        </div>
                                        <div className="card-expires">
                                            <span className="card-expires-label">Expires</span>
                                            <span className="card-expires-value">
                                                {formatExpiry(card.card_expire)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;
