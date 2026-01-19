import { useState } from 'react';
import SuccessModal from '../components/SuccessModal';
import { useTranslation } from 'react-i18next';
import './TopUp.css';

const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CardIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
    </svg>
);

const AppleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.5 10.5C14.5 9.5 15.5 9 15.5 9C14.5 7.5 13 7.5 12.5 7.5C11 7.5 10.5 8.5 9.5 8.5C8.5 8.5 8 7.5 7 7.5C5.5 7.5 3.5 9 3.5 12.5C3.5 15.5 5 18 6.5 18C7.5 18 8 17 9.5 17C10.5 17 11 18 12.5 18C14 18 15 17 16 16C16 16 14.5 15 14.5 13C14.5 11 16 10.5 16 10.5C16 10.5 15.5 9.5 14.5 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 6C12.5 5 12.5 4 12 3C11 3 10 4 9.5 5C9 6 10 7 12 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const PhoneIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const TopUp = ({ onBack, onPaymentSuccess }) => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState('');
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [isSuccess, setIsSuccess] = useState(false);

    const presets = [10, 20, 50, 100];

    const handleAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9.]/g, '');
        setAmount(value);
        setSelectedPreset(null);
    };

    const handlePresetClick = (value) => {
        setAmount(value.toString());
        setSelectedPreset(value);
    };

    const handlePay = () => {
        if (!amount || parseFloat(amount) <= 0) return;

        // Simulate payment processing
        setTimeout(() => {
            setIsSuccess(true);
            if (onPaymentSuccess) onPaymentSuccess(parseFloat(amount));
        }, 500);
    };

    const handleSuccessClose = () => {
        setIsSuccess(false);
        onBack(); // Go back to the previous screen (Home)
    };

    return (
        <div className="topup-container">
            <SuccessModal
                isOpen={isSuccess}
                onClose={handleSuccessClose}
                amount={amount}
            />

            <header className="topup-header">
                <button className="btn-back" onClick={onBack}>
                    <BackIcon />
                </button>
                <h1 className="header-title">{t('topup.title')}</h1>
            </header>

            <div className="topup-content">
                <div className="amount-section">
                    <label className="input-label">{t('topup.enter_amount')}</label>
                    <div className="amount-input-wrapper">
                        <span className="currency-symbol">฿</span>
                        <input
                            type="text"
                            className="amount-input"
                            placeholder="0.00"
                            value={amount}
                            onChange={handleAmountChange}
                        />
                    </div>
                </div>

                <div className="presets-grid">
                    {presets.map(val => (
                        <button
                            key={val}
                            className={`preset-btn ${selectedPreset === val ? 'active' : ''}`}
                            onClick={() => handlePresetClick(val)}
                        >
                            ฿{val}
                        </button>
                    ))}
                </div>

                <div className="payment-section">
                    <label className="section-label">{t('topup.payment_method')}</label>
                    <div className="payment-options">
                        <div
                            className={`payment-option ${paymentMethod === 'credit_card' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('credit_card')}
                        >
                            <div className="option-left">
                                <div className="option-icon">
                                    <CardIcon />
                                </div>
                                <div className="option-info">
                                    <span className="option-name">{t('topup.credit_card')}</span>
                                    <span className="option-sub">**** 4242</span>
                                </div>
                            </div>
                            <div className="option-radio">
                                <div className="radio-inner" />
                            </div>
                        </div>

                        <div
                            className={`payment-option ${paymentMethod === 'apple_pay' ? 'active' : ''}`}
                            onClick={() => setPaymentMethod('apple_pay')}
                        >
                            <div className="option-left">
                                <div className="option-icon">
                                    <PhoneIcon />
                                </div>
                                <span className="option-name">{t('topup.mobile_banking')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button className="btn-pay" onClick={handlePay}>
                {t('topup.pay_button', { amount: amount || '0.00' })}
            </button>
        </div>
    );
};

export default TopUp;
