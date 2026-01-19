import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './SuccessModal.css';

const ScanSuccessModal = ({ isOpen, onClose, data }) => {
    const { t } = useTranslation();

    useEffect(() => {
        if (isOpen) {
            // Auto close after 3 seconds or keep it open? User said "message Successfully", "remaining", "expire".
            // Usually scan result should stay or have an explicit close.
            // I'll leave it to manual close or click outside. But I will add a timeout just in case like the other one.
            // Actually, let's make it manual close for better readability of data.
        }
    }, [isOpen]);

    if (!isOpen || !data) return null;

    const { remaining_balance, expire_date } = data;

    // Formatting date
    const formattedDate = new Date(expire_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="success-modal-overlay">
            <div className="success-modal-content">
                <div className="success-circle">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="#4CAF50" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <h2 className="success-title">{t('scan_success.title')}</h2>

                <div className="success-details-box">
                    <div className="detail-row">
                        <span className="detail-label">{t('scan_success.remaining_balance')}</span>
                        <span className="detail-value">{remaining_balance} {t('buy_card.rounds')}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">{t('scan_success.expires_on')}</span>
                        <span className="detail-value">{formattedDate}</span>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="btn-success-close"
                >
                    {t('common.close')}
                </button>
            </div>
        </div>
    );
};

export default ScanSuccessModal;
