import { get, post } from './api';
import { getToken } from './authService';

/**
 * Get member details by User ID
 * @param {string} userId - LINE User ID
 * @returns {Promise<{data: object}>} Member data
 */
export const getMemberByUserId = async (userId, comId = 1) => {
    try {
        const response = await get(`/member/getByUserId/${userId}`, {
            headers: {
                'com_id': comId.toString(),
                'Authorization': `Bearer ${getToken()}`
            }
        });
        return response;
    } catch (error) {
        console.error('Error fetching member data:', error);
        throw error;
    }
};

/**
 * Create a new member
 * @param {object} data - Member data
 * @returns {Promise<{data: object}>} Created member data
 */
export const createMember = async (data) => {
    try {
        // Ensure member_com_id is 1
        const payload = {
            ...data,
            member_com_id: 1
        };
        const response = await post('/member/', payload);
        return response;
    } catch (error) {
        console.error('Error creating member:', error);
        throw error;
    }
};

export default {
    getMemberByUserId,
    createMember,
};
