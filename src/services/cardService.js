// Card Service - API calls related to cards
import { get } from './api';

/**
 * Check cards by user UUID (LINE User ID)
 * @param {string} uuid - LINE User ID
 * @returns {Promise<{status: string, card: Array}>} Card data
 */
export const checkCardByUuid = async (uuid) => {
    try {
        const response = await get(`/card/check-card/${uuid}`);
        return response;
    } catch (error) {
        console.error('Error checking card:', error);
        throw error;
    }
};

export default {
    checkCardByUuid,
};

