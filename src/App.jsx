
import { useState } from 'react';
import MainLayout from './layout/Mainlayout';
import Home from './page/Home';
import TopUp from './page/TopUp';
import History from './page/History';
import './App.css';
import BuyCardRound from './page/BuyCardRound';

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
        return <BuyCardRound onNavigate={handleTabChange} />;
      case 'history':
        return <History />;
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

