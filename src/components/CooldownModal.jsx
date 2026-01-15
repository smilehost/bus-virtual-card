import React from 'react';
import './CountdownModal.css'; // Reusing countdown styles for consistency

const CooldownModal = ({ isOpen, onClose, minutes = 5 }) => {
    if (!isOpen) return null;

    return (
        <div className="countdown-modal-overlay">
            <div className="countdown-modal-content">
                <div className="countdown-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <h2 className="countdown-title">Please Wait</h2>

                <p className="countdown-desc" style={{ marginBottom: '8px' }}>
                    You have scanned recently.
                </p>
                <p className="countdown-desc">
                    Please wait <strong style={{ color: '#EF4444' }}>{minutes} minutes</strong> before scanning again.
                </p>

                <button className="btn-close-countdown" onClick={onClose} style={{ marginTop: '16px' }}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default CooldownModal;
