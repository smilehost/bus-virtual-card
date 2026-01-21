import { useState } from 'react';
import { useLiff } from '../context/LiffContext';
import { createMember } from '../services/memberService';
import { useTranslation } from 'react-i18next';
import './Register.css';

const Register = ({ onNavigate }) => {
    const { t, i18n } = useTranslation();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (!formData.birthYear) {
                throw new Error(t('register.error_birth_year'));
            }

            const currentYear = new Date().getFullYear();
            // Assuming input is Buddhist Era (BE) year as per example "2450" (if user enters 2540) or just pass as is?
            // The example in user request was "member_age": 2450. Ideally this is Year of Birth.
            // Let's assume the user enters the year directly.

            const payload = {
                member_user_id: profile?.userId,
                member_gender: formData.member_gender,
                member_age: parseInt(formData.birthYear) // Using birthYear as member_age per API example
            };

            const response = await createMember(payload);

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
            <header className="register-header">
                <h1>{t('register.welcome')}</h1>
                <p>{t('register.subtitle')}</p>
            </header>

            <form className="register-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="member_gender">{t('register.gender')}</label>
                    <select
                        id="member_gender"
                        name="member_gender"
                        value={formData.member_gender}
                        onChange={handleChange}
                        className="form-input"
                    >
                        <option value="male">{t('register.male')}</option>
                        <option value="female">{t('register.female')}</option>
                        <option value="other">{t('register.other')}</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="birthYear">{t('register.birth_year')}</label>
                    <input
                        type="number"
                        id="birthYear"
                        name="birthYear"
                        value={formData.birthYear}
                        onChange={handleChange}
                        placeholder={t('register.birth_year_placeholder')}
                        className="form-input"
                        min="2400"
                        max="2600"
                    />
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
