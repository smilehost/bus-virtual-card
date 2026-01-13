import { useState } from 'react';
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

// QR Code Component (simplified visual representation)
const QRCode = () => (
    <div className="qr-code-container">
        <div className="qr-code">
            <svg viewBox="0 0 200 200" width="180" height="180">
                {/* QR Code pattern - simplified representation */}
                <rect x="0" y="0" width="200" height="200" fill="white" />

                {/* Corner squares */}
                <rect x="10" y="10" width="50" height="50" fill="black" />
                <rect x="15" y="15" width="40" height="40" fill="white" />
                <rect x="20" y="20" width="30" height="30" fill="black" />

                <rect x="140" y="10" width="50" height="50" fill="black" />
                <rect x="145" y="15" width="40" height="40" fill="white" />
                <rect x="150" y="20" width="30" height="30" fill="black" />

                <rect x="10" y="140" width="50" height="50" fill="black" />
                <rect x="15" y="145" width="40" height="40" fill="white" />
                <rect x="20" y="150" width="30" height="30" fill="black" />

                {/* Random pattern for QR effect */}
                <rect x="70" y="10" width="10" height="10" fill="black" />
                <rect x="90" y="10" width="10" height="10" fill="black" />
                <rect x="110" y="10" width="10" height="10" fill="black" />
                <rect x="70" y="30" width="10" height="10" fill="black" />
                <rect x="100" y="30" width="10" height="10" fill="black" />
                <rect x="120" y="30" width="10" height="10" fill="black" />

                <rect x="10" y="70" width="10" height="10" fill="black" />
                <rect x="30" y="70" width="10" height="10" fill="black" />
                <rect x="10" y="90" width="10" height="10" fill="black" />
                <rect x="40" y="90" width="10" height="10" fill="black" />
                <rect x="10" y="110" width="10" height="10" fill="black" />
                <rect x="30" y="110" width="10" height="10" fill="black" />
                <rect x="50" y="110" width="10" height="10" fill="black" />

                {/* Center pattern */}
                <rect x="70" y="70" width="60" height="60" fill="black" />
                <rect x="75" y="75" width="50" height="50" fill="white" />
                <rect x="80" y="80" width="40" height="40" fill="black" />
                <rect x="85" y="85" width="30" height="30" fill="white" />

                {/* Center blue dot */}
                <circle cx="100" cy="100" r="12" fill="#00d9ff" />

                {/* More random pattern */}
                <rect x="140" y="70" width="10" height="10" fill="black" />
                <rect x="160" y="70" width="10" height="10" fill="black" />
                <rect x="180" y="70" width="10" height="10" fill="black" />
                <rect x="150" y="90" width="10" height="10" fill="black" />
                <rect x="170" y="90" width="10" height="10" fill="black" />
                <rect x="140" y="110" width="10" height="10" fill="black" />
                <rect x="160" y="110" width="10" height="10" fill="black" />
                <rect x="180" y="110" width="10" height="10" fill="black" />

                <rect x="70" y="140" width="10" height="10" fill="black" />
                <rect x="90" y="140" width="10" height="10" fill="black" />
                <rect x="110" y="140" width="10" height="10" fill="black" />
                <rect x="80" y="160" width="10" height="10" fill="black" />
                <rect x="100" y="160" width="10" height="10" fill="black" />
                <rect x="120" y="160" width="10" height="10" fill="black" />
                <rect x="70" y="180" width="10" height="10" fill="black" />
                <rect x="90" y="180" width="10" height="10" fill="black" />
                <rect x="110" y="180" width="10" height="10" fill="black" />

                <rect x="140" y="140" width="10" height="10" fill="black" />
                <rect x="160" y="140" width="10" height="10" fill="black" />
                <rect x="180" y="140" width="10" height="10" fill="black" />
                <rect x="150" y="160" width="10" height="10" fill="black" />
                <rect x="170" y="160" width="10" height="10" fill="black" />
                <rect x="140" y="180" width="10" height="10" fill="black" />
                <rect x="160" y="180" width="10" height="10" fill="black" />
                <rect x="180" y="180" width="10" height="10" fill="black" />
            </svg>
        </div>
        <span className="qr-label">Scan to redeem</span>
    </div>
);

function CardDetailModal({ card, onClose }) {
    const [remainingBalance, setRemainingBalance] = useState(100.00);
    const [usageHistory, setUsageHistory] = useState([]);

    const handleSimulateScan = () => {
        if (remainingBalance >= 10) {
            setRemainingBalance(prev => prev - 10);
            setUsageHistory(prev => [
                {
                    id: Date.now(),
                    amount: -10,
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

    // Calculate days left until expiry
    const calculateDaysLeft = () => {
        const expiryDate = new Date('2026-01-20');
        const today = new Date();
        const diffTime = expiryDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? `${diffDays} days left` : 'Expired';
    };

    return (
        <div className="card-detail-modal">
            {/* Header */}
            <header className="modal-header">
                <button className="back-button" onClick={onClose}>
                    <BackIcon />
                </button>
                <h1 className="modal-title">{card.name}</h1>
                <div className="header-spacer"></div>
            </header>

            {/* QR Code Section */}
            <div className="qr-section">
                <QRCode />
                <button className="simulate-btn" onClick={handleSimulateScan}>
                    <ScanIcon />
                    <span>Simulate Scan ( -$10.00 )</span>
                </button>
            </div>

            {/* Info Cards */}
            <div className="info-cards">
                <div className="info-card">
                    <span className="info-label">Remaining Balance</span>
                    <span className="info-value">${remainingBalance.toFixed(2)}</span>
                    <span className="info-sublabel">Credit</span>
                </div>
                <div className="info-card">
                    <span className="info-label">Expires On</span>
                    <span className="info-value">{card.expires}</span>
                    <span className="info-sublabel">{calculateDaysLeft()}</span>
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
                                <span className="usage-amount">${item.amount.toFixed(2)}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default CardDetailModal;
