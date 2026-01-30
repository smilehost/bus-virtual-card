import { useState, useEffect } from 'react';
import SuccessModal from '../components/SuccessModal';
import CountdownModal from '../components/CountdownModal';
import { getVirtualCardGroups, createCardByLine } from '../services/cardGroupService';
import { useLiff } from '../context/LiffContext';
import { useCardStore } from '../store/cardStore';
import { useTranslation } from 'react-i18next';
import { getMemberData } from '../services/authService';
import './BuyCardRound.css';
import AsyncImage from '../components/AsyncImage'; // Import AsyncImage
import { getUploadUrl } from '../services/api';


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
    const { t } = useTranslation();
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
                setError(t('buy_card.error_fetch'));
            } finally {
                setIsLoading(false);
            }
        };

        fetchCardGroups();
    }, [t]);

    const handleSelectCardGroup = (cardGroup) => {
        setSelectedCardGroup(cardGroup);
        setIsDropdownOpen(false);
    };

    const handleCountdownComplete = () => {
        setIsCountdownOpen(false);
        if (onBack) onBack(); // Go back to Home/Previous screen after countdown
    };

    const handleConfirm = async () => {
        if (!selectedCardGroup || !profile?.userId) {
            setError(t('buy_card.error_missing_info'));
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
                        balance: `${selectedCardGroup.card_group_balance} ${t('buy_card.rounds')}`,
                        expires: calculateExpiryDate(selectedCardGroup.card_group_expire)
                    });
                }

                // Fetch latest cards immediately
                const memberData = getMemberData();
                if (memberData?.member_id) {
                    fetchCardsByUuid(memberData.member_id);
                }

                setIsSuccess(true);
                setIsCountdownOpen(true); // Open countdown modal
            } else {
                setError(response.message || t('buy_card.error_create'));
            }
        } catch (err) {
            console.error('Error creating card:', err);
            setError(t('buy_card.error_create_retry'));
        } finally {
            setIsSubmitting(false);
        }
    };

    // Derived values from selected card group
    const rounds = selectedCardGroup?.card_group_balance || 0;
    const expiryDate = calculateExpiryDate(selectedCardGroup?.card_group_expire);
    const totalCost = selectedCardGroup?.card_group_price || 0;

    // Check if it's a "forline" / Free Shuttle card
    const isFreeShuttle = selectedCardGroup && (
        (selectedCardGroup.card_group_name || '').toLowerCase().includes('forline') ||
        (selectedCardGroup.card_group_name || '').toLowerCase().includes('free shuttle')
    );

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
                    balance: `${rounds} ${t('buy_card.rounds')}`
                } : null}
            />



            <div className="buy-card-content-wrapper">
                {isLoading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>{t('common.loading')}</p>
                    </div>
                ) : error && cardGroups.length === 0 ? (
                    <div className="error-state">
                        <p>{error}</p>
                    </div>
                ) : (
                    <>
                        {/* Card Preview Section */}


                        {/* Selection Card */}
                        <div className="content-card selection-card">
                            {/* Card Preview Inside */}
                            {selectedCardGroup && selectedCardGroup.card_group_image && (
                                <div className="preview-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '0px', paddingBottom: '0px' }}>
                                    <div className="preview-card-image-wrapper">
                                        <AsyncImage
                                            src={getUploadUrl(selectedCardGroup.card_group_image)}
                                            alt={selectedCardGroup.card_group_name}
                                            className="preview-card-img"
                                            style={{
                                                width: '100%',
                                                maxWidth: '140px', // Reduced size as requested
                                                borderRadius: '12px',
                                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            {/* Card Group Dropdown */}
                            <div className="form-group">
                                <label>{t('buy_card.card_group')}</label>
                                <div className="dropdown-container">
                                    <button
                                        className="dropdown-trigger"
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    >
                                        <span>{selectedCardGroup?.card_group_name || t('buy_card.select_group')}</span>
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
                                                        {group.card_group_balance} {t('buy_card.rounds')} · ฿{group.card_group_price}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Select Rounds - Display only */}
                            {/* Select Rounds - Summary Style */}
                            <div className="summary-row" style={{ marginTop: '16px', marginBottom: '12px' }}>
                                <span>{t('buy_card.select_rounds')}</span>
                                <span style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{rounds} {t('buy_card.rounds')}</span>
                            </div>

                            {/* Expiry Date - Summary Style */}
                            <div className="summary-row" style={{ marginTop: '0', marginBottom: '0' }}>
                                <span>{t('buy_card.valid_until_label')}</span>
                                <span>{expiryDate}</span>
                            </div>

                            {/* Quantity - Fixed at 1 */}
                            <div className="summary-row" style={{ marginTop: '16px', marginBottom: '0' }}>
                                <span>{t('buy_card.quantity')}</span>
                                <span>1</span>
                            </div>
                        </div>

                        {/* Order Summary Card */}
                        <div className="content-card order-summary-card">
                            <h3 className="summary-title">{t('buy_card.order_summary')}</h3>
                            <div className="summary-row">
                                <span>{t('buy_card.card_type')}</span>
                                <span>{selectedCardGroup?.card_group_name || '-'} ({t('home.round_card')})</span>
                            </div>
                            <div className="summary-row">
                                <span>{t('buy_card.details')}</span>
                                <span>1 x {rounds} {t('buy_card.rounds')}</span>
                            </div>
                            <div className="summary-row">
                                <span>{t('home.expires')}</span>
                                <span>{expiryDate}</span>
                            </div>

                            <div className="summary-divider"></div>

                            <div className="total-row">
                                <span>{t('buy_card.total_cost')}</span>
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
                                {isSubmitting ? t('buy_card.processing') : t('buy_card.confirm_purchase')}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BuyCardRound;
