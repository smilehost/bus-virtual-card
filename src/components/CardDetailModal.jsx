import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './CardDetailModal.css';

// Back Arrow Icon
const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Refresh/Scan Icon
const ScanIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M23 4V1H20M1 4V1H4M23 20V23H20M1 20V23H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
    </svg>
);

// Format balance display
const formatBalance = (balance, cardType) => {
    if (cardType === 0) {
        return `${balance} Round${balance > 1 ? 's' : ''}`;
    }
    return `$${balance.toFixed(2)}`;
};

// Format balance unit
const formatBalanceUnit = (cardType) => {
    return cardType === 0 ? 'Rounds' : 'Credit';
};

// Calculate deduction amount
const getDeductionAmount = (cardType) => {
    return cardType === 0 ? 1 : 10;
};

// Calculate days left until expiry
const calculateDaysLeft = (expireHours) => {
    if (!expireHours) return 'No expiry';
    const hours = parseInt(expireHours);
    if (hours >= 24) {
        const days = Math.floor(hours / 24);
        return `${days} day${days > 1 ? 's' : ''} left`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''} left`;
};

// Format expiry display
const formatExpiry = (expireHours) => {
    if (!expireHours) return 'N/A';
    const now = new Date();
    const hours = parseInt(expireHours);
    const expiryDate = new Date(now.getTime() + hours * 60 * 60 * 1000);
    return expiryDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

function CardDetailModal({ card, onClose }) {
    const [remainingBalance, setRemainingBalance] = useState(card.card_balance || 0);
    const [usageHistory, setUsageHistory] = useState([]);

    // Get the card hash for QR code
    const cardHash = card.card_hash || '4b1a97a120061ffac3f3b77abdd3c0ae842981ab84928a11572a5e8341280a7c';

    // Deduction amount based on card type
    const deductionAmount = getDeductionAmount(card.card_type);

    const handleSimulateScan = () => {
        if (remainingBalance >= deductionAmount) {
            setRemainingBalance(prev => prev - deductionAmount);
            setUsageHistory(prev => [
                {
                    id: Date.now(),
                    amount: -deductionAmount,
                    date: new Date().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    type: 'Bus Ride'
                },
                ...prev
            ]);
        }
    };

    // Card name based on type
    const cardName = card.card_type === 1 ? 'Money Card' : 'Round Card';

    return (
        <div className="card-detail-modal">
            {/* Header */}
            <header className="modal-header">
                <button className="back-button" onClick={onClose}>
                    <BackIcon />
                </button>
                <h1 className="modal-title">{cardName}</h1>
                <div className="header-spacer"></div>
            </header>

            {/* QR Code Section */}
            <div className="qr-section">
                <div className="qr-code-container">
                    <div className="qr-code">
                        <QRCodeSVG
                            value={cardHash}
                            size={180}
                            level="M"
                            includeMargin={false}
                            bgColor="#ffffff"
                            fgColor="#000000"
                        />
                    </div>
                    <span className="qr-label">Scan to redeem</span>
                </div>
                <button className="simulate-btn" onClick={handleSimulateScan}>
                    <ScanIcon />
                    <span>
                        Simulate Scan ( -{card.card_type === 0 ? `${deductionAmount} Round` : `$${deductionAmount.toFixed(2)}`} )
                    </span>
                </button>
            </div>

            {/* Info Cards */}
            <div className="info-cards">
                <div className="info-card">
                    <span className="info-label">Remaining Balance</span>
                    <span className="info-value">{formatBalance(remainingBalance, card.card_type)}</span>
                    <span className="info-sublabel">{formatBalanceUnit(card.card_type)}</span>
                </div>
                <div className="info-card">
                    <span className="info-label">Expires On</span>
                    <span className="info-value">{formatExpiry(card.card_expire)}</span>
                    <span className="info-sublabel">{calculateDaysLeft(card.card_expire)}</span>
                </div>
            </div>

            {/* Usage History */}
            <div className="usage-history">
                <h3 className="usage-title">Usage History</h3>
                <div className="usage-list">
                    {usageHistory.length === 0 ? (
                        <div className="no-history">
                            <span>No usage history yet</span>
                        </div>
                    ) : (
                        usageHistory.map(item => (
                            <div key={item.id} className="usage-item">
                                <div className="usage-info">
                                    <span className="usage-type">{item.type}</span>
                                    <span className="usage-date">{item.date}</span>
                                </div>
                                <span className="usage-amount">
                                    {card.card_type === 0
                                        ? `${item.amount} Round`
                                        : `$${item.amount.toFixed(2)}`
                                    }
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default CardDetailModal;
