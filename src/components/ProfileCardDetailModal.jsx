import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './CardDetailModal.css';
import { useCardStore } from '../store/cardStore';
import { useLiff } from '../context/LiffContext';
import { useTranslation } from 'react-i18next';

// Back Arrow Icon
const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// Format balance display
const formatBalance = (balance, cardType, t) => {
    if (cardType === 0) {
        return `${balance} ${balance > 1 ? t('card_detail.rounds_plural') : t('card_detail.rounds_singular')}`;
    }
    return `$${balance.toFixed(2)}`;
};

// Calculate days left until expiry
const calculateDaysLeft = (expireHours, t) => {
    if (!expireHours) return t('home.no_expiry');
    const hours = parseInt(expireHours);
    if (hours >= 24) {
        const days = Math.floor(hours / 24);
        return `${days} ${days > 1 ? t('home.days_plural') : t('home.days_singular')} ${t('card_detail.left')}`;
    }
    return `${hours} ${hours > 1 ? t('home.hours_plural') : t('home.hours_singular')} ${t('card_detail.left')}`;
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

function ProfileCardDetailModal({ card, onClose, isOpen }) {
    const { t } = useTranslation();
    const { fetchCardsByUuid } = useCardStore();
    const { profile } = useLiff();

    const [remainingBalance, setRemainingBalance] = useState(card?.card_balance || 0);

    // Sync state with card prop
    useEffect(() => {
        if (card) {
            setRemainingBalance(card.card_balance || 0);
        }
    }, [card]);

    if (isOpen === false || !card) return null;

    const cardHash = card.card_hash || '4b1a97a120061ffac3f3b77abdd3c0ae842981ab84928a11572a5e8341280a7c';

    // Determine status
    const status = getCardStatus(card, remainingBalance);

    const cardName = card.card_type === 1 ? t('home.money_card') : t('home.round_card');

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
                    <div className="card-subtitle">{t('card_detail.scan_to_use')}</div>
                </div>

                <div className="card-details-list">
                    <div className="detail-row">
                        <span className="detail-label">{t('card_detail.balance')}</span>
                        <span className="detail-value" style={{ fontSize: '18px', color: 'var(--primary-color)' }}>
                            {formatBalance(remainingBalance, card.card_type, t)}
                        </span>
                    </div>

                    <div className="detail-row">
                        <span className="detail-label">{t('card_detail.status')}</span>
                        <span className={`status-badge ${status}`}>
                            {status === 'active' ? t('card_detail.active') : status === 'new' ? t('card_detail.new') : t('card_detail.expired')}
                        </span>
                    </div>

                    {/* Status specific details */}
                    {status === 'new' && (
                        <div className="detail-row">
                            <span className="detail-label">{t('card_detail.validity')}</span>
                            <span className="detail-value">
                                {t('card_detail.starts_on_first_use', { hours: card.card_expire })}
                            </span>
                        </div>
                    )}

                    {status !== 'new' && (
                        <>
                            <div className="detail-row">
                                <span className="detail-label">{t('card_detail.expires_on')}</span>
                                <span className="detail-value">
                                    {formatExpiry(card.card_expire)}
                                </span>
                            </div>
                            {status === 'active' && (
                                <div className="detail-row">
                                    <span className="detail-label">{t('card_detail.time_remaining')}</span>
                                    <span className="detail-value">
                                        {calculateDaysLeft(card.card_expire, t)}
                                    </span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProfileCardDetailModal;
