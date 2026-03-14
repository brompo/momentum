import React from 'react';
import { useStore } from '../lib/store';
import './TabBar.css';

const tabs = [
  { name: 'Calendar', icon: '📅' },
  { name: 'Goals', icon: '🎯' },
  { name: 'Notes', icon: '📝' },
  { name: 'Settings', icon: '⚙️' }
];

const TabBar = () => {
  const { activeTab, setActiveTab } = useStore();

  return (
    <nav className="tab-bar glass">
      {tabs.map(tab => (
        <button
          key={tab.name}
          className={`tab-item smooth-all ${activeTab === tab.name ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.name)}
        >
          <span className="tab-icon">{tab.icon}</span>
          <span className="tab-label">{tab.name}</span>
          {activeTab === tab.name && <div className="active-indicator" />}
        </button>
      ))}
    </nav>
  );
};

export default TabBar;
