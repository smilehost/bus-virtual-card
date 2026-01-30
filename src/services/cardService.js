// Card Service - API calls related to cards
import { get, post, put } from './api';
import { getToken } from './authService';

/**
 * Check cards by user UUID (LINE User ID)
 * @param {string} uuid - LINE User ID
 * @returns {Promise<{status: string, card: Array}>} Card data
 */
export const checkCardByUuid = async (uuid) => {
    try {
        const response = await get(`/card/check-card/${uuid}`, {
            headers: {
                com_id: 1,
                'Authorization': `Bearer ${getToken()}`
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
 * Lock or unlock a card
 * @param {string|number} cardId - Card ID
 * @param {number} lockStatus - 0 = locked, 1 = unlocked
 * @returns {Promise<object>} Response data
 */
export const lockCard = async (cardId, lockStatus) => {
    try {
        const response = await put(`/card/lock/${cardId}`, 
            { card_lock: lockStatus },
            {
                headers: {
                    'com_id': '1',
                    'Authorization': `Bearer ${getToken()}`
                }
            }
        );
        return response;
    } catch (error) {
        console.error('Error locking/unlocking card:', error);
        throw error;
    }
};

/**
 * Set a card as main card
 * @param {string|number} cardId - Card ID
 * @param {string|number} cardUserId - Card User ID (member_id)
 * @returns {Promise<object>} Response data
 */
export const setCardMain = async (cardId, cardUserId) => {
    try {
        const response = await put(`/card/main/${cardId}`, 
            { card_user_id: cardUserId },
            {
                headers: {
                    'com_id': '1',
                    'Authorization': `Bearer ${getToken()}`
                }
            }
        );
        return response;
    } catch (error) {
        console.error('Error setting main card:', error);
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
                    'com_id': '1',
                    'Authorization': `Bearer ${getToken()}`
                }
            }
        );
        return response;
    } catch (error) {
        console.error('Error linking card:', error);
        throw error;
    }
};

/**
 * Verify Card QR Code and Bind to User
 * @param {string} cardHash - Card Hash
 * @param {string} cardQrcode - Code printed on card
 * @param {number} memberId - Member ID to bind card to
 * @returns {Promise<object>} Verification result
 */
export const verifyCardQrCode = async (cardHash, cardQrcode, memberId) => {
    try {
        const response = await post('/card/verify-qrcode', {
            card_hash: cardHash,
            card_qrcode: cardQrcode,
            member_id: memberId
        }, {
            headers: {
                com_id: 1,
                'Authorization': `Bearer ${getToken()}`
            }
        });
        return response;
    } catch (error) {
        console.error('Error verifying card:', error);
        throw error;
    }
};

/**
 * Find card by hash to check existence
 * @param {string} cardHash 
 * @returns {Promise<object>} Card data
 */
export const findCardByHash = async (cardHash) => {
    try {
        // Assuming GET /card/:hash or similar exists. 
        // Based on typical REST conventions and the need to check existence.
        // If this fails, we might need to adjust the endpoint.
        const response = await get(`/card/getCard/${cardHash}`, {
            headers: {
                com_id: 1,
                'Authorization': `Bearer ${getToken()}`
            }
        });
        return response;
    } catch (error) {
        // If 404, it means card not found.
        console.error('Error finding card by hash:', error);
        throw error;
    }
};

export default {
    checkCardByUuid,
    useCard,
    linkCardToUser,
    verifyCardQrCode,
     lockCard,
    setCardMain,
    findCardByHash,
};
