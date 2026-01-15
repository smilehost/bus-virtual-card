import { get } from './api';

/**
 * Get member details by User ID
 * @param {string} userId - LINE User ID
 * @returns {Promise<{data: object}>} Member data
 */
export const getMemberByUserId = async (userId) => {
    try {
        const response = await get(`/member/getByUserId/${userId}`, {
            headers: {
                'com_id': '1'
            }
        });
        return response;
    } catch (error) {
        console.error('Error fetching member data:', error);
        throw error;
    }
};

export default {
    getMemberByUserId,
};
