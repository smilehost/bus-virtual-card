import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './CardDetailModal.css';
import { useCard } from '../services/cardService';
import ScanSuccessModal from './ScanSuccessModal';
import { useCardStore } from '../store/cardStore';

// Back Arrow Icon
const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
    const [isLoading, setIsLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Get actions to refresh cards
    const { fetchCardsByUuid } = useCardStore();

    // Get the card hash for QR code
    const cardHash = card.card_hash || '4b1a97a120061ffac3f3b77abdd3c0ae842981ab84928a11572a5e8341280a7c';

    // Deduction amount based on card type
    const deductionAmount = getDeductionAmount(card.card_type);

    const handleSimulateScan = async () => {
        if (remainingBalance < deductionAmount) return;

        setIsLoading(true);
        try {
            // Payload as requested
            const payload = {
                hashed_input: card.card_hash || cardHash, // Use real hash if available
                used_amount: 1, // Fixed 1 as per request
                bus_id: 1,
                busround_id: 3132,
                card_transaction_lat: "16.4085321",
                card_transaction_long: "102.842083"
            };

            const response = await useCard(payload);

            if (response.status === 'success') {
                setSuccessData(response.data);
                setRemainingBalance(response.data.remaining_balance);
                setShowSuccess(true);

                // Add to local history
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

                // Refresh parent data if user ID is available
                // We don't have user ID directly here but we could pass it or fetch it from context
                // For now local update is good enough for simulation
            } else {
                alert('Scan Failed: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Scan Error:', error);
            alert('Scan Error: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseSuccess = () => {
        setShowSuccess(false);
        // Maybe close modal too? Or keep it open.
        // User didn't specify, but usually we stay on card detail.
    };

    // Card name based on card type
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
                <button
                    className="simulate-btn"
                    onClick={handleSimulateScan}
                    disabled={isLoading || remainingBalance < deductionAmount}
                >
                    {isLoading ? (
                        <div className="loading-spinner-small" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    ) : (
                        <ScanIcon />
                    )}
                    <span>
                        {isLoading ? 'Scanning...' : `Simulate Scan ( -${card.card_type === 0 ? `${deductionAmount} Round` : `$${deductionAmount.toFixed(2)}`} )`}
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

            <ScanSuccessModal
                isOpen={showSuccess}
                onClose={handleCloseSuccess}
                data={successData}
            />
        </div>
    );
}

export default CardDetailModal;


