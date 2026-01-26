import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './CardDetailModal.css'; // Reusing styles

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
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>

                <h3 className="modal-title">{t('verify_modal.title') || 'Verify Card'}</h3>
                <p className="modal-subtitle">{t('verify_modal.instruction') || 'Please enter the code printed on your card'}</p>

                <form onSubmit={handleSubmit} className="verify-form" style={{ marginTop: '20px' }}>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value);
                            setError('');
                        }}
                        placeholder={t('verify_modal.placeholder') || 'Enter card code logic...'}
                        className="verify-input"
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '12px',
                            border: '1px solid #ddd',
                            fontSize: '16px',
                            marginBottom: '10px'
                        }}
                    />
                    {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '10px' }}>{error}</p>}

                    <button
                        type="submit"
                        className="btn-buycard"
                        style={{ width: '100%', marginTop: '10px' }}
                    >
                        {t('common.verify') || 'Verify'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyCardModal;
