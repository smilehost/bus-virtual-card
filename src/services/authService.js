import { post } from './api';

// Token storage keys
const TOKEN_KEY = 'member_auth_token';
const MEMBER_KEY = 'member_data';

/**
 * Get auth token from localStorage
 * @returns {string|null} Token or null
 */
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * Set auth token in localStorage
 * @param {string} token - JWT token
 */
export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Clear auth token from localStorage
 */
export const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(MEMBER_KEY);
};

/**
 * Get member data from localStorage
 * @returns {object|null} Member data or null
 */
export const getMemberData = () => {
    const data = localStorage.getItem(MEMBER_KEY);
    return data ? JSON.parse(data) : null;
};

/**
 * Set member data in localStorage
 * @param {object} member - Member data
 */
export const setMemberData = (member) => {
    localStorage.setItem(MEMBER_KEY, JSON.stringify(member));
};

/**
 * Check or register member with LINE User ID
 * Called on app load to authenticate/register user
 * @param {string} lineUserId - LINE User ID
 * @param {number} comId - Company ID (default: 1)
 * @returns {Promise<{status: string, token: string, is_new_member: boolean, member: object}>}
 */
export const checkOrRegister = async (lineUserId, comId = 1) => {
    try {
        const response = await post('/member-auth/check-or-register', 
            { line_user_id: lineUserId },
            {
                headers: {
                    'com_id': comId.toString()
                }
            }
        );

        // Store token and member data
        if (response.data?.token) {
            setToken(response.data.token);
        }
        if (response.data?.member) {
            setMemberData(response.data.member);
        }

        return response;
    } catch (error) {
        console.error('Error in checkOrRegister:', error);
        throw error;
    }
};

/**
 * Complete member profile (for registration)
 * @param {object} data - Profile data { member_age, member_gender }
 * @param {number} comId - Company ID (default: 1)
 * @returns {Promise<{status: string, token: string, member: object}>}
 */
export const completeProfile = async (data, comId = 1) => {
    const token = getToken();
    
    if (!token) {
        throw new Error('No auth token found. Please login first.');
    }

    try {
        const response = await post('/member-auth/complete-profile', data, {
            headers: {
                'com_id': comId.toString(),
                'Authorization': `Bearer ${token}`
            }
        });

        // Update token and member data
        if (response.data?.token) {
            setToken(response.data.token);
        }
        if (response.data?.member) {
            setMemberData(response.data.member);
        }

        return response;
    } catch (error) {
        console.error('Error in completeProfile:', error);
        throw error;
    }
};

export default {
    getToken,
    setToken,
    clearToken,
    getMemberData,
    setMemberData,
    checkOrRegister,
    completeProfile,
};
