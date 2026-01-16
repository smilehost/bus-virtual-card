
import { useState } from 'react';
import MainLayout from './layout/Mainlayout';
import Home from './page/home';
import TopUp from './page/TopUp';
import History from './page/History';
import './App.css';
import BuyCardRound from './page/BuyCardRound';
import Profile from './page/Profile';
import Register from './page/Register';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home onNavigate={handleTabChange} />;
      case 'topup':
        return <TopUp onBack={() => setActiveTab('home')} />;
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

