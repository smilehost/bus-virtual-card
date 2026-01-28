import React from 'react';
import './Toast.css';

const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const Toast = ({ id, type = 'info', title, data, onClose }) => {

    const handleClose = () => {
        onClose(id);
    };

    return (
        <div className="sse-modal-overlay" onClick={handleClose}>
            <div className="sse-modal-content" onClick={e => e.stopPropagation()}>
                <div className="sse-modal-icon">
                    <CheckIcon />
                </div>
                <h3 className="sse-modal-title">{title || 'สแกนบัตรสำเร็จ!'}</h3>

                <div className="sse-modal-details">
                    <div className="sse-modal-row">
                        <span className="sse-modal-label">คงเหลือ:</span>
                        <span className="sse-modal-value">{data?.remaining_balance || 0} เที่ยว</span>
                    </div>
                    <div className="sse-modal-row">
                        <span className="sse-modal-label">หมดอายุ:</span>
                        <span className="sse-modal-value">{data?.expire_date || '-'}</span>
                    </div>
                </div>

                <p className="sse-modal-message">บัตรของคุณถูกใช้งานแล้ว</p>

                <button className="sse-modal-btn" onClick={handleClose}>
                    ปิด
                </button>
            </div>
        </div>
    );
};

export default Toast;
