import React from 'react';
import { useTranslation } from 'react-i18next';
import './TransactionDetailModal.css';

const TransactionDetailModal = ({ isOpen, onClose, transaction }) => {
    const { t } = useTranslation();

    if (!isOpen || !transaction) return null;

    // Helper to get formatted date
    const formatDate = (dateString) => {
        return dateString; // Initially just return string, update if real Date object logic needed
    };

    const isTopUp = transaction.rawType === 'topup';
    const isPurchase = transaction.rawType === 'purchase';

    return (
        <div className="transaction-modal-overlay" onClick={onClose}>
            <div className="transaction-modal-content" onClick={e => e.stopPropagation()}>
                <div className="transaction-modal-header">
                    <button className="btn-close-modal" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>

                <div className="transaction-icon-large" style={{
                    backgroundColor: isPurchase ? '#F3E8FF' : '#E6FFFA',
                    color: isPurchase ? '#9333EA' : '#059669'
                }}>
                    {isPurchase ? (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 7H4C3.4 7 3 7.4 3 8V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V8C21 7.4 20.6 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 7V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    ) : (
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 7L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M17 17H7V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>

                <div className="transaction-amount-large" style={{ color: isTopUp ? 'var(--success-color)' : 'var(--text-primary)' }}>
                    {transaction.amount}
                </div>
                <div className="transaction-title-large">
                    {transaction.title}
                </div>

                <div className="transaction-details-list">
                    <div className="detail-row">
                        <span className="detail-label">{t('transaction_detail.status')}</span>
                        <span className="detail-value status-valid">{t('transaction_detail.successful')}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">{t('transaction_detail.date_time')}</span>
                        <span className="detail-value">{formatDate(transaction.date)}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">{t('transaction_detail.transaction_id')}</span>
                        <span className="detail-value">#{String(transaction.id).padStart(8, '0')}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">{t('transaction_detail.type')}</span>
                        <span className="detail-value" style={{ textTransform: 'capitalize' }}>{transaction.type}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetailModal;
