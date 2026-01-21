// Base API Configuration
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Base fetch wrapper with error handling
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;

    const defaultHeaders = {
        'Content-Type': 'application/json',
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                // If body is not JSON, ignore
            }

            const error = new Error(errorData?.message || `HTTP error! status: ${response.status}`);
            error.status = response.status;
            error.data = errorData;
            throw error;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

/**
 * GET request helper
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>} Response data
 */
export const get = (endpoint, options = {}) => {
    return apiRequest(endpoint, { ...options, method: 'GET' });
};

/**
 * POST request helper
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
export const post = (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
        ...options
    });
};

/**
 * PUT request helper
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @param {object} options - Fetch options
 * @returns {Promise<any>} Response data
 */
export const put = (endpoint, data, options = {}) => {
    return apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(data),
        ...options
    });
};

/**
 * DELETE request helper
 * @param {string} endpoint - API endpoint
 * @returns {Promise<any>} Response data
 */
export const del = (endpoint) => {
    return apiRequest(endpoint, { method: 'DELETE' });
};

export default {
    get,
    post,
    put,
    del,
    apiRequest,
    BASE_URL,
};
