// Card Store - Global state management for cards
import { createContext, useContext, useState, useCallback } from 'react';
import { checkCardByUuid } from '../services/cardService';

const CardContext = createContext(null);

export const CardProvider = ({ children }) => {
    const [cards, setCards] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastFetched, setLastFetched] = useState(null);

    /**
     * Fetch cards by user UUID
     * @param {string} uuid - LINE User ID
     */
    const fetchCardsByUuid = useCallback(async (uuid) => {
        if (!uuid) {
            console.warn('No UUID provided for fetching cards');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await checkCardByUuid(uuid);
            
            if (response.status === 'exist' && response.card) {
                setCards(response.card);
                console.log('Cards fetched successfully:', response.card.length, 'cards');
            } else {
                setCards([]);
                console.log('No cards found for user');
            }
            
            setLastFetched(new Date());
        } catch (err) {
            console.error('Error fetching cards:', err);
            setError(err.message);
            setCards([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Get cards filtered by type
     * @param {number} cardType - Card type (0 = round, 1 = money)
     * @returns {Array} Filtered cards
     */
    const getCardsByType = useCallback((cardType) => {
        return cards.filter(card => card.card_type === cardType);
    }, [cards]);

    /**
     * Get round cards (card_type = 0)
     */
    const getRoundCards = useCallback(() => {
        return getCardsByType(0);
    }, [getCardsByType]);

    /**
     * Get money cards (card_type = 1)
     */
    const getMoneyCards = useCallback(() => {
        return getCardsByType(1);
    }, [getCardsByType]);

    /**
     * Get total balance from all money cards
     */
    const getTotalBalance = useCallback(() => {
        const moneyCards = getMoneyCards();
        return moneyCards.reduce((sum, card) => sum + (card.card_balance || 0), 0);
    }, [getMoneyCards]);

    /**
     * Get total rounds from all round cards
     */
    const getTotalRounds = useCallback(() => {
        const roundCards = getRoundCards();
        return roundCards.reduce((sum, card) => sum + (card.card_balance || 0), 0);
    }, [getRoundCards]);

    /**
     * Clear all cards from store
     */
    const clearCards = useCallback(() => {
        setCards([]);
        setError(null);
        setLastFetched(null);
    }, []);

    /**
     * Refresh cards (re-fetch)
     * @param {string} uuid - LINE User ID
     */
    const refreshCards = useCallback((uuid) => {
        return fetchCardsByUuid(uuid);
    }, [fetchCardsByUuid]);

    const value = {
        // State
        cards,
        isLoading,
        error,
        lastFetched,
        
        // Actions
        fetchCardsByUuid,
        refreshCards,
        clearCards,
        
        // Getters
        getCardsByType,
        getRoundCards,
        getMoneyCards,
        getTotalBalance,
        getTotalRounds,
    };

    return (
        <CardContext.Provider value={value}>
            {children}
        </CardContext.Provider>
    );
};

/**
 * Hook to use card store
 * @returns {object} Card store context
 */
export const useCardStore = () => {
    const context = useContext(CardContext);
    if (!context) {
        throw new Error('useCardStore must be used within a CardProvider');
    }
    return context;
};

export default CardContext;
