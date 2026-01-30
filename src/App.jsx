
import { useState, useEffect } from 'react';
import MainLayout from './layout/Mainlayout';
import Home from './page/Home';
import History from './page/History';
import './App.css';
import BuyCardRound from './page/BuyCardRound';
import Profile from './page/Profile';
import Register from './page/Register';

import { useLiff } from './context/LiffContext';
import { checkOrRegister } from './services/authService';
import { ToastProvider, useToast } from './context/ToastContext';
import useSSE from './hooks/useSSE';

// Component to run the hook inside the provider
const SSEListener = () => {
  useSSE();
};


function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const { profile, isLoggedIn } = useLiff();
  const [isCheckingMember, setIsCheckingMember] = useState(false);

  // Check if member exists when profile is loaded
  useEffect(() => {
    const checkMemberStatus = async () => {
      if (isLoggedIn && profile?.userId) {
        try {
          setIsCheckingMember(true);
          // Call check-or-register API
          const response = await checkOrRegister(profile.userId);

          // Check member status from response
          if (response.data?.member?.member_status === 'inactive') {
            // User needs to complete registration
            console.log("Member inactive, redirecting to register");
            setActiveTab('register');
          }
          // If active, stay on current tab (home by default)
        } catch (error) {
          // If error, redirect to register
          console.log("Auth error, redirecting to register:", error);
          setActiveTab('register');
        } finally {
          setIsCheckingMember(false);
        }
      }
    };

    checkMemberStatus();
  }, [isLoggedIn, profile]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigate={handleTabChange} />;
      case 'buycard':
        return <BuyCardRound onBack={() => setActiveTab('home')} />;
      case 'history':
        return <History />;

      case 'profile':
        return <Profile onNavigate={handleTabChange} />;
      case 'register':
        return <Register onNavigate={handleTabChange} />;
      default:
        return <Home onNavigate={handleTabChange} />;
    }
  };

  return (
    <MainLayout activeTab={activeTab} onTabChange={handleTabChange}>
      <SSEListener />
      {renderPage()}
    </MainLayout>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default App;
