import liff from '@line/liff';

// Replace this with your actual LIFF ID from LINE Developers Console
const LIFF_ID = import.meta.env.VITE_LIFF_ID || 'YOUR_LIFF_ID';

export const initializeLiff = async () => {
    try {
        await liff.init({ liffId: LIFF_ID });
        console.log('LIFF initialized successfully');

        if (!liff.isLoggedIn()) {
            // If not logged in, redirect to LINE login
            liff.login();
        }

        return true;
    } catch (error) {
        console.error('LIFF initialization failed:', error);
        throw error;
    }
};

export const getLiffProfile = async () => {
    if (!liff.isLoggedIn()) {
        return null;
    }

    try {
        const profile = await liff.getProfile();
        return profile;
    } catch (error) {
        console.error('Failed to get profile:', error);
        return null;
    }
};

export const getAccessToken = () => {
    return liff.getAccessToken();
};

export const isInClient = () => {
    return liff.isInClient();
};

export const closeLiff = () => {
    if (liff.isInClient()) {
        liff.closeWindow();
    }
};

export { liff };
