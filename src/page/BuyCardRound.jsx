import { useState, useEffect } from 'react';
import SuccessModal from '../components/SuccessModal';
import CountdownModal from '../components/CountdownModal';
import { getVirtualCardGroups, createCardByLine } from '../services/cardGroupService';
import { useLiff } from '../context/LiffContext';
import { useCardStore } from '../store/cardStore';
import './BuyCardRound.css';

const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ClockIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Format expiry hours to days
const formatExpiryDays = (expireHours) => {
    if (!expireHours) return 'No expiry';
    const hours = parseInt(expireHours);
    const days = Math.floor(hours / 24);
    return `${days} Day${days > 1 ? 's' : ''}`;
};

// Calculate expiry date from hours
const calculateExpiryDate = (expireHours) => {
    const date = new Date();
    const hours = parseInt(expireHours) || 0;
    date.setHours(date.getHours() + hours);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const BuyCardRound = ({ onBack, onBuySuccess }) => {
    const [cardGroups, setCardGroups] = useState([]);
    const [selectedCardGroup, setSelectedCardGroup] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isCountdownOpen, setIsCountdownOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Get user profile from LIFF
    const { profile } = useLiff();
    const { fetchCardsByUuid } = useCardStore(); // Import fetch function from store

    // Fetch card groups on mount
    useEffect(() => {
        const fetchCardGroups = async () => {
            try {
                setIsLoading(true);
                const response = await getVirtualCardGroups(1);
                if (response.status === 'success' && response.data) {
                    setCardGroups(response.data);
                    // Auto-select first card group if available
                    if (response.data.length > 0) {
                        setSelectedCardGroup(response.data[0]);
                    }
                }
            } catch (err) {
                console.error('Error fetching card groups:', err);
                setError('Failed to load card groups');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCardGroups();
    }, []);

    const handleSelectCardGroup = (cardGroup) => {
        setSelectedCardGroup(cardGroup);
        setIsDropdownOpen(false);
    };

    const handleSuccessClose = () => {
        setIsSuccess(false);
        // Do not navigate back immediately, let user decide or auto-redirect after countdown
    };

    const handleCountdownComplete = () => {
        setIsCountdownOpen(false);
        if (onBack) onBack(); // Go back to Home/Previous screen after countdown
    };

    const handleConfirm = async () => {
        if (!selectedCardGroup || !profile?.userId) {
            setError('Missing required information');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const payload = {
                amount: 1,
                balance: selectedCardGroup.card_group_balance,
                card_group_id: selectedCardGroup.card_group_id,
                card_type: 0, // Round = 0
                card_expire: parseInt(selectedCardGroup.card_group_expire),
                card_user_id: profile.userId
            };

            const response = await createCardByLine(payload);

            if (response.status === 'success') {
                if (onBuySuccess) {
                    onBuySuccess({
                        name: selectedCardGroup.card_group_name,
                        type: 'round',
                        balance: `${selectedCardGroup.card_group_balance} Rounds`,
                        expires: calculateExpiryDate(selectedCardGroup.card_group_expire)
                    });
                }

                // Fetch latest cards immediately
                if (profile?.userId) {
                    fetchCardsByUuid(profile.userId);
                }

                setIsSuccess(true);
                setIsCountdownOpen(true); // Open countdown modal
            } else {
                setError(response.message || 'Failed to create card');
            }
        } catch (err) {
            console.error('Error creating card:', err);
            setError('Failed to create card. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Derived values from selected card group
    const rounds = selectedCardGroup?.card_group_balance || 0;
    const expiryDays = formatExpiryDays(selectedCardGroup?.card_group_expire);
    const expiryDate = calculateExpiryDate(selectedCardGroup?.card_group_expire);
    const totalCost = selectedCardGroup?.card_group_price || 0;

    return (
        <div className="buy-card-container">
            {/* Reusing CountdownModal as the main Success Display Modal */}
            <CountdownModal
                isOpen={isCountdownOpen}
                onClose={() => {
                    setIsCountdownOpen(false);
                    if (onBack) onBack(); // Navigate back on close
                }}
                purchaseDetails={selectedCardGroup ? {
                    name: selectedCardGroup.card_group_name,
                    balance: `${rounds} Rounds`
                } : null}
            />

            <header className="buy-card-header">
                <button className="btn-back" onClick={onBack}>
                    <BackIcon />
                </button>
                <h1 className="header-title">Buy Virtual Card</h1>
            </header>

            <div className="buy-card-content">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading card groups...</p>
                    </div>
                ) : error && cardGroups.length === 0 ? (
                    <div className="error-state">
                        <p>{error}</p>
                    </div>
                ) : (
                    <>
                        {/* Card Group Dropdown */}
                        <div className="form-group">
                            <label>Card Group</label>
                            <div className="dropdown-container">
                                <button
                                    className="dropdown-trigger"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span>{selectedCardGroup?.card_group_name || 'Select Card Group'}</span>
                                    <ChevronDownIcon />
                                </button>
                                {isDropdownOpen && (
                                    <div className="dropdown-menu">
                                        {cardGroups.map(group => (
                                            <div
                                                key={group.card_group_id}
                                                className={`dropdown-item ${selectedCardGroup?.card_group_id === group.card_group_id ? 'active' : ''}`}
                                                onClick={() => handleSelectCardGroup(group)}
                                            >
                                                <span className="dropdown-item-name">{group.card_group_name}</span>
                                                <span className="dropdown-item-info">
                                                    {group.card_group_balance} Rounds · ฿{group.card_group_price}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Select Rounds - Display only */}
                        <div className="form-group">
                            <label>Select Rounds</label>
                            <div className="rounds-display">
                                <div className="round-btn active">
                                    <span className="round-val">{rounds}</span>
                                    <span className="round-label">Rounds</span>
                                </div>
                            </div>
                            <div className="expiry-hint">
                                <ClockIcon />
                                Valid until {expiryDate} ({expiryDays})
                            </div>
                        </div>

                        {/* Quantity - Fixed at 1 */}
                        <div className="form-group">
                            <label>Quantity</label>
                            <div className="quantity-selector">
                                <span>1</span>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="order-summary">
                            <h3 className="summary-title">Order Summary</h3>
                            <div className="summary-row">
                                <span>Card Type</span>
                                <span>{selectedCardGroup?.card_group_name || '-'} (Round)</span>
                            </div>
                            <div className="summary-row">
                                <span>Details</span>
                                <span>1 x {rounds} Rounds</span>
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

                            {error && (
                                <div className="error-message">
                                    {error}
                                </div>
                            )}

                            <button
                                className="btn-confirm"
                                onClick={handleConfirm}
                                disabled={isSubmitting || !selectedCardGroup}
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm Purchase'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BuyCardRound;
