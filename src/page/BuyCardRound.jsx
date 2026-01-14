import { useState, useEffect } from 'react';
import SuccessModal from '../components/SuccessModal';
import './BuyCardRound.css';

const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const RefreshIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M23 4V10H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1 20V14H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.51 9.00008C4.01717 7.56686 4.87913 6.28548 6.01547 5.27549C7.1518 4.26551 8.52547 3.55984 9.98808 3.22433C11.4507 2.88883 12.9548 2.9348 14.3621 3.35792C15.7694 3.78104 17.0347 4.56792 18.04 5.64008L23 10.0001M1 14.0001L5.96 18.3601C6.96526 19.4322 8.23057 20.2191 9.63789 20.6422C11.0452 21.0654 12.5493 21.1113 14.0119 20.7758C15.4745 20.4403 16.8482 19.7347 17.9845 18.7247C19.1209 17.7147 19.9828 16.4333 20.49 15.0001" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const DollarIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3688 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ClockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BoxIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 16V8C20.9996 7.64927 20.9048 7.30481 20.7258 6.99955C20.5468 6.69429 20.29 6.43884 19.98 6.258L12.98 2.258C12.677 2.08466 12.3396 1.99365 11.9996 1.99365C11.6596 1.99365 11.3222 2.08466 11.0192 2.258L4.0192 6.258C3.70921 6.43884 3.45239 6.69429 3.27339 6.99955C3.09439 7.30481 2.9996 7.64927 2.9992 8V16C2.9996 16.3507 3.09439 16.6952 3.27339 17.0005C3.45239 17.3057 3.70921 17.5612 4.0192 17.742L11.0192 21.742C11.3222 21.9153 11.6596 22.0064 11.9996 22.0064C12.3396 22.0064 12.677 21.9153 12.98 21.742L19.98 17.742C20.29 17.5612 20.5468 17.3057 20.7258 17.0005C20.9048 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3.27002 6.96001L12 12.01L20.73 6.96001" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 22.08V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BuyCardRound = ({ onBack, onBuySuccess }) => {
    const [cardGroup, setCardGroup] = useState('Student');
    const [rounds, setRounds] = useState(30);
    const [quantity, setQuantity] = useState(1);
    const [expiryDate, setExpiryDate] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [totalCost, setTotalCost] = useState(0);
    const [cardType, setCardType] = useState('round'); // round | money

    // Fixed round options
    const roundOptions = [30, 40, 50, 60];

    // Card groups
    const cardGroups = ['Student', 'Adult', 'Senior'];

    useEffect(() => {
        // Calculate expiry date (Today + 30 days)
        const date = new Date();
        date.setDate(date.getDate() + 30);
        setExpiryDate(date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }));

        // Calculate cost
        // Pricing logic: Base price varies by group? 
        // For now assuming: 5 THB per round for everyone, generic logic
        const pricePerRound = 5;
        setTotalCost((rounds * pricePerRound * quantity).toFixed(2));
    }, [rounds, quantity]);

    const handleSuccessClose = () => {
        setIsSuccess(false);
        if (onBack) onBack();
    };

    const handleConfirm = () => {
        if (onBuySuccess) {
            onBuySuccess({
                name: `${cardGroup} Card`,
                type: cardType,
                balance: `${rounds} Rounds`,
                expires: expiryDate
            });
        }
        setIsSuccess(true);
    };

    return (
        <div className="buy-card-container">
            <SuccessModal
                isOpen={isSuccess}
                onClose={handleSuccessClose}
                message="Purchase Successful!"
                subMessage="You have purchased"
                amount={`${quantity} x ${cardGroup} Card (${rounds} rounds)`}
            />

            <header className="buy-card-header">
                <button className="btn-back" onClick={onBack}>
                    <BackIcon />
                </button>
                <h1 className="header-title">Buy Virtual Card</h1>
            </header>

            <div className="buy-card-content">
                {cardType === 'round' ? (
                    <>
                        <div className="form-group">
                            <label>Card Group</label>
                            <div className="card-group-selector">
                                {cardGroups.map(group => (
                                    <button
                                        key={group}
                                        className={`group-btn ${cardGroup === group ? 'active' : ''}`}
                                        onClick={() => setCardGroup(group)}
                                    >
                                        {group}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Select Rounds</label>
                            <div className="rounds-grid">
                                {roundOptions.map(opt => (
                                    <button
                                        key={opt}
                                        className={`round-btn ${rounds === opt ? 'active' : ''}`}
                                        onClick={() => setRounds(opt)}
                                    >
                                        <span className="round-val">{opt}</span>
                                        <span className="round-label">Rounds</span>
                                    </button>
                                ))}
                            </div>
                            <div className="expiry-hint">
                                <ClockIcon /> Valid until {expiryDate} (30 Days)
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Quantity</label>
                            <div className="quantity-selector">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="money-placeholder">
                        <p>Money based card options...</p>
                    </div>
                )}

                <div className="order-summary">
                    <h3 className="summary-title">Order Summary</h3>
                    <div className="summary-row">
                        <span>Card Type</span>
                        <span>{cardGroup} ({cardType === 'round' ? 'Round' : 'Money'})</span>
                    </div>
                    <div className="summary-row">
                        <span>Details</span>
                        <span>{quantity} x {rounds} Rounds</span>
                    </div>
                    <div className="summary-row">
                        <span>Expires</span>
                        <span>{expiryDate}</span>
                    </div>

                    <div className="summary-divider"></div>

                    <div className="total-row">
                        <span>Total Cost</span>
                        <span className="total-amount">฿{totalCost}</span>
                    </div>

                    <button className="btn-confirm" onClick={handleConfirm}>
                        Confirm Purchase
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BuyCardRound;
