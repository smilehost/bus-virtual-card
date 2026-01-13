
import React, { useState } from 'react';
import './History.css';

const History = () => {
    const [activeTab, setActiveTab] = useState('All');

    const transactions = [
        {
            id: 1,
            title: 'Purchased 1 Money Card(s)',
            date: 'Jan 13, 2026',
            amount: '$100.00',
            type: 'purchase',
            rawType: 'purchase'
        },
        {
            id: 2,
            title: 'Purchased 1 Round Card(s)',
            date: 'Jan 13, 2026',
            amount: '$50.00',
            type: 'purchase',
            rawType: 'purchase'
        },
        {
            id: 3,
            title: 'Top up via Credit Card',
            date: 'Jan 13, 2026',
            amount: '+ $50.00',
            type: 'topup',
            rawType: 'topup'
        },
        {
            id: 4,
            title: 'Top up via Credit Card',
            date: 'Jan 13, 2026',
            amount: '+ $50.00',
            type: 'topup',
            rawType: 'topup'
        },
        {
            id: 5,
            title: 'Purchased 1 Round Card(s)',
            date: 'Jan 13, 2026',
            amount: '$50.00',
            type: 'purchase',
            rawType: 'purchase'
        },
        {
            id: 6,
            title: 'Top up via Credit Card',
            date: 'Jan 13, 2026',
            amount: '+ $20.00',
            type: 'topup',
            rawType: 'topup'
        }
    ];

    const filteredTransactions = transactions.filter(t => {
        if (activeTab === 'All') return true;
        if (activeTab === 'Top Ups') return t.rawType === 'topup';
        if (activeTab === 'Purchases') return t.rawType === 'purchase';
        if (activeTab === 'Usage') return t.rawType === 'usage';
        return true;
    });

    // Custom Arrows for the icons based on visual instructions:
    // Purchase: Purple Bag.
    // Topup: Green Arrow pointing down-left.

    const IconWrapper = ({ type, children }) => {
        const bgColor = type === 'purchase' ? 'rgba(147, 51, 234, 0.1)' : 'rgba(16, 185, 129, 0.1)';
        const borderColor = type === 'purchase' ? 'rgba(147, 51, 234, 0.2)' : 'rgba(16, 185, 129, 0.2)';

        return (
            <div className="icon-wrapper" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
                {children}
            </div>
        );
    };

    return (
        <div className="history-page">
            <header className="history-header">
                <div className="header-icon">
                    {/* Blue Wallet Icon */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 12V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21 12H16C14.8954 12 14 12.8954 14 14V17C14 18.1046 14.8954 19 16 19H21V12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                </div>
                <h1>History</h1>
            </header>

            <div className="tabs-container">
                {['All', 'Top Ups', 'Purchases', 'Usage'].map((tab) => (
                    <button
                        key={tab}
                        className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
                {/* Animated underline could be done with CSS or inline styles, 
            but simple border-bottom on active class is easier and cleaner. */}
            </div>

            <div className="transactions-list">
                {filteredTransactions.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: 'rgba(255, 255, 255, 0.5)'
                    }}>
                        <div style={{
                            fontSize: '48px',
                            marginBottom: '16px'
                        }}>📭</div>
                        <div style={{
                            fontSize: '16px',
                            fontWeight: '500',
                            marginBottom: '8px',
                            color: 'rgba(255, 255, 255, 0.7)'
                        }}>
                            No transactions yet
                        </div>
                        <div style={{ fontSize: '14px' }}>
                            Your {activeTab.toLowerCase()} will appear here
                        </div>
                    </div>
                ) : (
                    filteredTransactions.map((t) => (
                        <div key={t.id} className="transaction-item">
                            <div className="transaction-left">
                                <IconWrapper type={t.rawType}>
                                    {t.rawType === 'purchase' ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 7H4C3.4 7 3 7.4 3 8V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V8C21 7.4 20.6 7 20 7Z" stroke="#D8B4FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M16 7V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7" stroke="#D8B4FE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="12" cy="14" r="2" stroke="#D8B4FE" strokeWidth="2" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17 7L7 17" stroke="#00E599" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M17 17H7V7" stroke="#00E599" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </IconWrapper>
                                <div className="transaction-info">
                                    <div className="transaction-title">{t.title}</div>
                                    <div className="transaction-date">{t.date}</div>
                                </div>
                            </div>
                            <div className="transaction-right">
                                <div className={`transaction-amount ${t.rawType === 'topup' ? 'positive' : ''}`}>
                                    {t.amount}
                                </div>
                                <div className="transaction-type">{t.type}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default History;
