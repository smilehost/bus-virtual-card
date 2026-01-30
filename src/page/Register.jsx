import { useState } from 'react';
import { useLiff } from '../context/LiffContext';
import { completeProfile } from '../services/authService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import './Register.css';

const Register = ({ onNavigate }) => {
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const { profile } = useLiff();
    const [formData, setFormData] = useState({
        member_gender: 'female',
        birthYear: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'th' : 'en';
        i18n.changeLanguage(newLang);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGenderSelect = (gender) => {
        setFormData(prev => ({
            ...prev,
            member_gender: gender
        }));
    };

    // Generate years (2500 to Current BE) by calendar
    const currentYearBE = new Date().getFullYear() + 543;


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (!formData.birthYear) {
                throw new Error(t('register.error_birth_year'));
            }

            // Calculate age from birth year (assuming Buddhist Era)
            const currentYearBE = new Date().getFullYear() + 543;
            const age = currentYearBE - parseInt(formData.birthYear);

            const payload = {
                member_gender: formData.member_gender,
                member_age: age
            };

            const response = await completeProfile(payload);

            if (response.status === 'success') {
                onNavigate('home');
            } else {
                throw new Error(response.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.message || t('register.failed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            <button className="register-lang-btn" onClick={toggleLanguage}>
                {i18n.language === 'en' ? 'TH' : 'EN'}
            </button>
            <button className="register-theme-btn" onClick={toggleTheme}>
                {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <header className="register-header">
                <h1>{t('register.welcome')}</h1>
                <p>{t('register.subtitle')}</p>
            </header>

            <form className="register-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>{t('register.gender')}</label>
                    <div className="gender-selector">
                        {['male', 'female', 'other'].map((gender) => (
                            <button
                                key={gender}
                                type="button"
                                className={`gender-btn ${formData.member_gender === gender ? 'active' : ''}`}
                                onClick={() => handleGenderSelect(gender)}
                            >
                                {t(`register.${gender}`)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="birthYear">{t('register.birth_year')}</label>
                    <select
                        id="birthYear"
                        name="birthYear"
                        value={formData.birthYear}
                        onChange={handleChange}
                        className="form-input"
                    >
                        <option value="">{t('register.birth_year_placeholder')}</option>
                        {(() => {
                            const currentYearBE = new Date().getFullYear() + 543;
                            const years = [];
                            for (let i = 0; i < 100; i++) {
                                const year = currentYearBE - i;
                                years.push(
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                );
                            }
                            return years;
                        })()}
                    </select>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button
                    type="submit"
                    className="btn-submit"
                    disabled={isLoading}
                >
                    {isLoading ? t('register.registering') : t('register.submit')}
                </button>
            </form>
        </div>
    );
};

export default Register;
