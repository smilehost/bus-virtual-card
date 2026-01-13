import React, { useEffect } from 'react';
import './SuccessModal.css';

const CheckIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke="#02db88" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const SuccessModal = ({ isOpen, onClose, amount, message = "Top Up Successful!", subMessage = "Your wallet has been funded with" }) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="success-modal-overlay">
            <div className="success-modal-content">
                <div className="success-circle">
                    <CheckIcon />
                </div>
                <h2 className="success-title">{message}</h2>
                <p className="success-desc">
                    {subMessage} ฿ {amount}.
                </p>
            </div>
        </div>
    );
};

export default SuccessModal;
