import React, { useState } from 'react';
import TransactionDetailModal from '../components/TransactionDetailModal';
import { useTranslation } from 'react-i18next';
import './History.css';

const History = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('All');

    const transactions = [
        {
            id: 1,
            title: t('history.purchased_money_card', { count: 1 }),
            date: 'Jan 13, 2026',
            amount: '฿100.00',
            type: t('common.purchase'),
            rawType: 'purchase'
        },
        {
            id: 2,
            title: t('history.purchased_round_card', { count: 1 }),
            date: 'Jan 13, 2026',
            amount: '฿50.00',
            type: t('common.purchase'),
            rawType: 'purchase'
        },
        {
            id: 3,
            title: t('history.topup_credit_card'),
            date: 'Jan 13, 2026',
            amount: '+ ฿50.00',
            type: t('common.topup'),
            rawType: 'topup'
        },
        {
            id: 4,
            title: t('history.topup_credit_card'),
            date: 'Jan 13, 2026',
            amount: '+ ฿50.00',
            type: t('common.topup'),
            rawType: 'topup'
        },
        {
            id: 5,
            title: t('history.purchased_round_card', { count: 1 }),
            date: 'Jan 13, 2026',
            amount: '฿50.00',
            type: t('common.purchase'),
            rawType: 'purchase'
        },
        {
            id: 6,
            title: t('history.topup_credit_card'),
            date: 'Jan 13, 2026',
            amount: '+ ฿20.00',
            type: t('common.topup'),
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
        // Use theme standard background colors instead of arbitrary rgba
        const bgColor = type === 'purchase' ? '#F3E8FF' : '#E6FFFA'; // Light Purple / Light Green
        const borderColor = type === 'purchase' ? '#E9D5FF' : '#B2F5EA';

        return (
            <div className="icon-wrapper" style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}>
                {children}
            </div>
        );
    };

    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const handleTransactionClick = (transaction) => {
        setSelectedTransaction(transaction);
        setIsDetailModalOpen(true);
    };

    // Helper to request tab name based on translation
    const getTabName = (tabKey) => {
        switch (tabKey) {
            case 'All': return t('history.tab_all');
            case 'Top Ups': return t('history.tab_topups');
            case 'Purchases': return t('history.tab_purchases');
            case 'Usage': return t('history.tab_usage');
            default: return tabKey;
        }
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
                <h1>{t('history.title')}</h1>
            </header>

            <div className="tabs-container">
                {['All', 'Top Ups', 'Purchases', 'Usage'].map((tab) => (
                    <button
                        key={tab}
                        className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {getTabName(tab)}
                    </button>
                ))}
            </div>

            <div className="transactions-list">
                {filteredTransactions.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">📭</span>
                        <div className="empty-title">
                            {t('history.no_transactions')}
                        </div>
                        <div className="empty-subtitle">
                            {t('history.no_transactions_subtitle', { tab: getTabName(activeTab).toLowerCase() })}
                        </div>
                    </div>
                ) : (
                    filteredTransactions.map((tx) => (
                        <div
                            key={tx.id}
                            className="transaction-item"
                            onClick={() => handleTransactionClick(tx)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="transaction-left">
                                <IconWrapper type={tx.rawType}>
                                    {tx.rawType === 'purchase' ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 7H4C3.4 7 3 7.4 3 8V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V8C21 7.4 20.6 7 20 7Z" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M16 7V5C16 3.9 15.1 3 14 3H10C8.9 3 8 3.9 8 5V7" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <circle cx="12" cy="14" r="2" stroke="#9333EA" strokeWidth="2" />
                                        </svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M17 7L7 17" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M17 17H7V7" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </IconWrapper>
                                <div className="transaction-info">
                                    <div className="transaction-title">{tx.title}</div>
                                    <div className="transaction-date">{tx.date}</div>
                                </div>
                            </div>
                            <div className="transaction-right">
                                <div className={`transaction-amount ${tx.rawType === 'topup' ? 'positive' : ''}`}>
                                    {tx.amount}
                                </div>
                                <div className="transaction-type">{tx.type}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <TransactionDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                transaction={selectedTransaction}
            />
        </div>
    );
};

export default History;
