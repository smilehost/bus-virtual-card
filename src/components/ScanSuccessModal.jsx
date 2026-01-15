import React, { useEffect } from 'react';
import './SuccessModal.css';

const ScanSuccessModal = ({ isOpen, onClose, data }) => {
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
                <h2 className="success-title">Successfully</h2>

                <div className="success-details" style={{ marginTop: '1rem', textAlign: 'left', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#aaa' }}>Remaining Balance:</span>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{remaining_balance} Rounds</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#aaa' }}>Expires On:</span>
                        <span style={{ color: '#fff', fontWeight: 'bold' }}>{formattedDate}</span>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    style={{
                        marginTop: '1.5rem',
                        background: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '25px',
                        width: '100%',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default ScanSuccessModal;
