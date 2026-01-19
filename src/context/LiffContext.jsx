import { createContext, useContext, useState, useEffect } from 'react';
import { initializeLiff, getLiffProfile, liff } from '../lib/liff';

const LiffContext = createContext(null);

export const LiffProvider = ({ children }) => {
    const [liffState, setLiffState] = useState({
        isInitialized: false,
        isLoggedIn: false,
        profile: null,
        error: null,
        isLoading: true,
    });

    useEffect(() => {
        const init = async () => {
            try {
                await initializeLiff();

                const isLoggedIn = liff.isLoggedIn();
                let profile = null;

                if (isLoggedIn) {
                    profile = await getLiffProfile();
                }

                setLiffState({
                    isInitialized: true,
                    isLoggedIn,
                    profile,
                    error: null,
                    isLoading: false,
                });
            } catch (error) {
                setLiffState({
                    isInitialized: false,
                    isLoggedIn: false,
                    profile: null,
                    error: error.message,
                    isLoading: false,
                });
            }
        };

        init();
    }, []);

    const login = () => {
        if (!liffState.isLoggedIn) {
            liff.login();
        }
    };

    const logout = () => {
        if (liffState.isLoggedIn) {
            liff.logout();
            window.location.reload();
        }
    };

    const value = {
        ...liffState,
        liff,
        login,
        logout,
    };

    return (
        <LiffContext.Provider value={value}>
            {children}
        </LiffContext.Provider>
    );
};

export const useLiff = () => {
    const context = useContext(LiffContext);
    if (!context) {
        throw new Error('useLiff must be used within a LiffProvider');
    }
    return context;
};

export default LiffContext;
