
import { useState, useEffect } from 'react';
import MainLayout from './layout/Mainlayout';
import Home from './page/home';
import History from './page/History';
import './App.css';
import BuyCardRound from './page/BuyCardRound';
import Profile from './page/Profile';
import Register from './page/Register';

import { useLiff } from './context/LiffContext';
import { getMemberByUserId } from './services/memberService';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const { profile, isLoggedIn } = useLiff();
  const [isCheckingMember, setIsCheckingMember] = useState(false);

  // Check if member exists when profile is loaded
  useEffect(() => {
    const checkMemberStatus = async () => {
      if (isLoggedIn && profile?.userId) {
        try {
          setIsCheckingMember(true);
          // Try to get member data
          await getMemberByUserId(profile.userId);
          // If successful, user is registered. Stay on current tab or default relative to logic
          // But if they are NOT registered, getMemberByUserId usually throws or returns error?
          // Based on service implementation: "throw error" on catch.
        } catch (error) {
          // If error (likely 404 or not found), force register
          console.log("User not found, redirecting to register");
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
      {renderPage()}
    </MainLayout>
  );
}

export default App;

