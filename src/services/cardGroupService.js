// Card Group Service - API calls related to card groups
import { apiRequest } from './api';

/**
 * Get virtual card groups by company ID
 * @param {number} companyId - Company ID (default: 1)
 * @returns {Promise<{status: string, data: Array}>} Card group data
 */
export const getVirtualCardGroups = async (companyId = 1) => {
    try {
        const response = await apiRequest(`/cardGroup/virtual/${companyId}`, {
            method: 'GET',
        });
        return response;
    } catch (error) {
        console.error('Error fetching card groups:', error);
        throw error;
    }
};

/**
 * Create a new card by LINE
 * @param {object} cardData - Card data to create
 * @param {number} cardData.amount - Amount (always 1)
 * @param {number} cardData.balance - Card balance from card_group_balance
 * @param {number} cardData.card_group_id - Card group ID
 * @param {number} cardData.card_type - Card type (0 = round, 1 = money)
 * @param {number} cardData.card_expire - Card expiry in hours from card_group_expire
 * @param {string} cardData.card_user_id - LINE User ID
 * @returns {Promise<object>} Created card
 */
export const createCardByLine = async (cardData) => {
    try {
        const response = await apiRequest('/card/createByLine', {
            method: 'POST',
            headers: {
                'com_id': '1',
            },
            body: JSON.stringify(cardData),
        });
        return response;
    } catch (error) {
        console.error('Error creating card:', error);
        throw error;
    }
};

export default {
    getVirtualCardGroups,
    createCardByLine,
};
