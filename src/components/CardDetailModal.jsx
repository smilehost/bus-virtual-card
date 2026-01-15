import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './CardDetailModal.css';
import { useCard } from '../services/cardService';
import ScanSuccessModal from './ScanSuccessModal';
import CooldownModal from './CooldownModal';
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
import { useLiff } from '../context/LiffContext'; // Import Liff

// ... existing code ...

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

// Get card status
const getCardStatus = (card, remainingBalance) => {
    // Round cards with 0 balance are expired
    if (card.card_type === 0 && remainingBalance === 0) return 'expired';

    // Check time-based expiry
    if (card.card_firstuse && card.card_expire_date) {
        const expiryDate = new Date(card.card_expire_date);
        const now = new Date();
        return expiryDate < now ? 'expired' : 'active';
    }

    // Not used yet = New
    return 'new';
};

function CardDetailModal({ card, onClose, onScanSuccess, isOpen }) {
    if (isOpen === false) return null;

    const [remainingBalance, setRemainingBalance] = useState(card.card_balance || 0);
    const [usageHistory, setUsageHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [successData, setSuccessData] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const [showCooldown, setShowCooldown] = useState(false);
    const [cooldownMinutes, setCooldownMinutes] = useState(5);

    const { fetchCardsByUuid } = useCardStore();
    const { profile } = useLiff();

    const cardHash = card.card_hash || '4b1a97a120061ffac3f3b77abdd3c0ae842981ab84928a11572a5e8341280a7c';
    const deductionAmount = getDeductionAmount(card.card_type);

    // Determine status
    const status = getCardStatus(card, remainingBalance);

    const handleSimulateScan = async () => {
        if (remainingBalance < deductionAmount) return;

        setIsLoading(true);
        try {
            const payload = {
                hashed_input: card.card_hash || cardHash,
                used_amount: 1,
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

                // Add to history
                setUsageHistory(prev => [{
                    id: Date.now(),
                    amount: -deductionAmount,
                    date: new Date().toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    }),
                    type: 'Bus Ride'
                }, ...prev]);
            } else {
                alert('Scan Failed: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Scan Error:', error);
            if (error.status === 403) {
                setCooldownMinutes(5);
                setShowCooldown(true);
            } else {
                alert('Scan Error: ' + (error.message || 'Something went wrong'));
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseSuccess = () => {
        setShowSuccess(false);
        if (profile?.userId) fetchCardsByUuid(profile.userId);
        onClose();
        if (onScanSuccess) onScanSuccess();
    };

    const cardName = card.card_type === 1 ? 'Money Card' : 'Round Card';

    const handleBackClick = () => {
        if (profile?.userId) fetchCardsByUuid(profile.userId);
        onClose();
    };

    return (
        <div className="card-detail-overlay" onClick={handleBackClick}>
            <div className="card-detail-content" onClick={e => e.stopPropagation()}>
                <div className="card-modal-header">
                    <button className="btn-close-modal" onClick={handleBackClick}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                <div className="qr-display-section">
                    <div className="qr-wrapper">
                        <QRCodeSVG value={cardHash} size={180} level="M" includeMargin={false} bgColor="#ffffff" fgColor="#000000" />
                    </div>
                    <div className="card-title-large">{cardName}</div>
                    <div className="card-subtitle">Scan to use card</div>
                </div>

                <div className="card-details-list">
                    <div className="detail-row">
                        <span className="detail-label">Balance</span>
                        <span className="detail-value" style={{ fontSize: '18px', color: 'var(--primary-color)' }}>
                            {formatBalance(remainingBalance, card.card_type)}
                        </span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">Status</span>
                        <span className={`status-badge ${status}`}>
                            {status === 'active' ? 'Active' : status === 'new' ? 'New' : 'Expired'}
                        </span>
                    </div>

                    {/* Status specific details */}
                    {status === 'new' && (
                        <div className="detail-row">
                            <span className="detail-label">Validity</span>
                            <span className="detail-value">
                                Starts on first use ({card.card_expire} hours)
                            </span>
                        </div>
                    )}

                    {status !== 'new' && (
                        <>
                            <div className="detail-row">
                                <span className="detail-label">Expires On</span>
                                <span className="detail-value">
                                    {formatExpiry(card.card_expire)}
                                </span>
                            </div>
                            {status === 'active' && (
                                <div className="detail-row">
                                    <span className="detail-label">Time Remaining</span>
                                    <span className="detail-value">
                                        {calculateDaysLeft(card.card_expire)}
                                    </span>
                                </div>
                            )}
                        </>
                    )}

                    {usageHistory.length > 0 && (
                        <div className="detail-row">
                            <span className="detail-label">Recent Usage</span>
                            <span className="detail-value">{usageHistory[0].date.split(',')[0]}</span>
                        </div>
                    )}
                </div>

                {/* Scan Action */}
                <div className="card-actions">
                    <button
                        className="btn-scan"
                        onClick={handleSimulateScan}
                        disabled={isLoading || remainingBalance < deductionAmount}
                    >
                        {isLoading ? (
                            <div className="loading-spinner-small" style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        ) : (
                            <ScanIcon />
                        )}
                        <span>
                            {isLoading ? 'Scanning...' : `Simulate Scan (-${card.card_type === 0 ? `${deductionAmount}` : `$${deductionAmount}`})`}
                        </span>
                    </button>
                </div>

                {/* Modals */}
                <ScanSuccessModal
                    isOpen={showSuccess}
                    onClose={handleCloseSuccess}
                    data={successData}
                />

                <CooldownModal
                    isOpen={showCooldown}
                    onClose={() => setShowCooldown(false)}
                    minutes={cooldownMinutes}
                />
            </div>
        </div>
    );
}

export default CardDetailModal;


