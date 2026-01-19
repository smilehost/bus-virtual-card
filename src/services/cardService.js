// Card Service - API calls related to cards
import { get, post, put } from './api';

/**
 * Check cards by user UUID (LINE User ID)
 * @param {string} uuid - LINE User ID
 * @returns {Promise<{status: string, card: Array}>} Card data
 */
export const checkCardByUuid = async (uuid) => {
    try {
        const response = await get(`/card/check-card/${uuid}`, {
            headers: {
                com_id: 1
            }
        });
        return response;
    } catch (error) {
        console.error('Error checking card:', error);
        throw error;
    }
};

/**
 * Use card (Simulate Scan)
 * @param {object} data - Transaction data
 * @returns {Promise<{status: string, message: string, data: object}>} Transaction result
 */
export const useCard = async (data) => {
    try {
        const response = await post('/card/use', data);
        return response;
    } catch (error) {
        console.error('Error using card:', error);
        throw error;
    }
};

/**
 * Link card to user (Add Card via Scan)
 * @param {string} cardHash - Hash obtained from QR Code
 * @param {number} memberId - Member ID
 * @returns {Promise<object>} Response data
 */
export const linkCardToUser = async (cardHash, memberId) => {
    try {
        const response = await put(`/card/updateUser/${cardHash}`,
            { member_id: memberId },
            {
                headers: {
                    'com_id': '1'
                }
            }
        );
        return response;
    } catch (error) {
        console.error('Error linking card:', error);
        throw error;
    }
};

export default {
    checkCardByUuid,
    useCard,
    linkCardToUser,
};
