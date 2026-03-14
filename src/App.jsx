import React, { useState } from 'react';
import TabBar from './components/TabBar';
import GoalsView from './components/GoalsView';
import GoalDetailView from './components/GoalDetailView';
import CalendarView from './components/CalendarView';
import NotesView from './components/NotesView';
import { useStore } from './lib/store';
import './App.css';

const SettingsView = () => {
  const { theme, toggleTheme } = useStore();
  
  return (
    <div className="safe-area animate-fade-in">
      <h1>Settings</h1>
      <div className="settings-list" style={{ marginTop: '24px' }}>
        <div className="setting-item glass-card">
          <span>Theme</span>
          <div 
            className={`toggle ${theme === 'light' ? 'active' : ''}`}
            onClick={toggleTheme}
            style={{ cursor: 'pointer' }}
          ></div>
        </div>
        <div className="setting-item glass-card">
          <span>Assistant Voice</span>
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Nova</span>
        </div>
        <div className="setting-item glass-card">
          <span>Daily Reminders</span>
          <div className="toggle active"></div>
        </div>
        <div className="setting-item glass-card">
          <span>Sync to Cloud</span>
          <div className="toggle"></div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { activeTab } = useStore();
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const { goals } = useStore();

  const selectedGoal = goals.find(g => g.id === selectedGoalId);

  const renderContent = () => {
    switch (activeTab) {
      case 'Calendar': return <CalendarView />;
      case 'Goals': 
        return selectedGoal ? (
          <GoalDetailView goal={selectedGoal} onBack={() => setSelectedGoalId(null)} />
        ) : (
          <GoalsView onSelectGoal={(goal) => setSelectedGoalId(goal.id)} />
        );
      case 'Notes': return <NotesView />;
      case 'Settings': return <SettingsView />;
      default: return <GoalsView />;
    }
  };

  return (
    <div className="app-container">
      <main className="main-content">
        {renderContent()}
      </main>
      <TabBar />
    </div>
  );
}

export default App;
