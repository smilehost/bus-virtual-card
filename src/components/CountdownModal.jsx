import React from 'react';
import './CountdownModal.css';

const CountdownModal = ({ isOpen, onClose, purchaseDetails }) => {
    // Timer logic removed as per request

    if (!isOpen) return null;

    return (
        <div className="countdown-modal-overlay">
            <div className="countdown-modal-content">
                <div className="countdown-icon" style={{ background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <h2 className="countdown-title">Purchase Successful!</h2>

                {purchaseDetails && (
                    <div className="countdown-details" style={{ marginBottom: '16px', background: 'var(--bg-secondary)', padding: '12px', borderRadius: '12px', width: '100%', textAlign: 'left', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Item:</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{purchaseDetails.name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Balance:</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{purchaseDetails.balance}</span>
                        </div>
                    </div>
                )}

                <p className="countdown-desc" style={{ marginBottom: '24px' }}>
                    Your card is ready to use.
                </p>

                <button className="btn-close-countdown" onClick={onClose}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default CountdownModal;
