import { useState } from 'react';
import MainLayout from './layout/Mainlayout';
import Home from './page/Home';
import TopUp from './page/TopUp';
import './App.css';

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
        return <div style={{ color: '#fff', padding: '20px', textAlign: 'center' }}>Buy Card Page (Coming Soon)</div>;
      case 'history':
        return <div style={{ color: '#fff', padding: '20px', textAlign: 'center' }}>History Page (Coming Soon)</div>;
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

