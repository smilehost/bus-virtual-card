import React, { useEffect } from 'react';
import './AlertModal.css';

const SuccessIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#E8F5E9" />
        <path d="M16 9L10.5 14.5L8 12" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ErrorIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" fill="#FFEBEE" />
        <path d="M15 9L9 15" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 9L15 15" stroke="#F44336" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const AlertModal = ({ isOpen, onClose, type = 'success', title, message }) => {

    if (!isOpen) return null;

    return (
        <div className="alert-modal-overlay" onClick={onClose}>
            <div className="alert-modal-content" onClick={e => e.stopPropagation()}>
                <div className="alert-icon-wrapper">
                    {type === 'success' ? <SuccessIcon /> : <ErrorIcon />}
                </div>
                <h3 className="alert-title">{title}</h3>
                <p className="alert-message">{message}</p>
                <button
                    className={`alert-btn ${type}`}
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default AlertModal;
