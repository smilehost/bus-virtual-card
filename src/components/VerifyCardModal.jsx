import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './VerifyCardModal.css';

const VerifyCardModal = ({ isOpen, onClose, onVerify }) => {
    const { t } = useTranslation();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!code.trim()) {
            setError(t('verify_modal.error_empty') || 'Please enter code');
            return;
        }
        onVerify(code);
        setCode('');
        setError('');
    };

    return (
        <div className="verify-modal-overlay">
            {/* Close button moved outside content, top-left of screen */}
            <button className="verify-modal-close-btn-screen" onClick={onClose}>
                <span>&times;</span>
            </button>

            <div className="verify-modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="verify-modal-title">{t('verify_modal.title') || 'ยืนยันข้อมูลบัตร'}</h3>
                <p className="verify-modal-subtitle">{t('verify_modal.instruction') || 'กรุณากรอกรหัสหลังบัตรเพื่อยืนยัน'}</p>

                <form onSubmit={handleSubmit} className="verify-form">
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value);
                            setError('');
                        }}
                        placeholder={t('verify_modal.placeholder') || 'กรอกรหัสยืนยัน'}
                        className="verify-input"
                    />
                    {error && <p className="verify-error-msg">{error}</p>}

                    <button
                        type="submit"
                        className="verify-btn-confirm"
                    >
                        {t('common.verify') || 'ยืนยัน'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyCardModal;
