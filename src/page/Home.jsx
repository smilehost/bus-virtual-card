import { useState } from 'react';
import './home.css';

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

const VirtualCardIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="4" width="20" height="16" rx="3" fill="url(#cardGradient)" stroke="#00d9ff" strokeWidth="1" />
        <path d="M2 10H22" stroke="#00d9ff" strokeWidth="1" />
        <defs>
            <linearGradient id="cardGradient" x1="2" y1="4" x2="22" y2="20" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1a3a4a" />
                <stop offset="1" stopColor="#0a1520" />
            </linearGradient>
        </defs>
    </svg>
);

function Home({ onNavigate }) {
    const [balance, setBalance] = useState(970.00);

    const cards = [
        {
            id: 1,
            name: 'My Virtual Card',
            type: 'round',
            subType: 'Card',
            balance: '10 Rounds',
            expires: 'Jan 20, 2026'
        }
    ];

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
                    <h2 className="balance-amount">${balance.toFixed(2)}</h2>
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
                    <button className="btn-new-card">+ New Card</button>
                </div>

                {/* Virtual Cards List */}
                <div className="cards-list">
                    {cards.map(card => (
                        <div key={card.id} className="virtual-card">
                            <div className="card-top">
                                <div className="card-icon-wrapper">
                                    <VirtualCardIcon />
                                </div>
                                <div className="card-info">
                                    <span className="card-name">{card.name}</span>
                                    <span className="card-type">{card.type} · {card.subType}</span>
                                </div>
                            </div>
                            <div className="card-bottom">
                                <div className="card-balance">
                                    <span className="card-balance-label">Balance</span>
                                    <span className="card-balance-value">{card.balance}</span>
                                </div>
                                <div className="card-expires">
                                    <span className="card-expires-label">Expires</span>
                                    <span className="card-expires-value">{card.expires}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Home;

