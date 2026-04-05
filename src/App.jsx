import React, { useState } from 'react';
import TabBar from './components/TabBar';
import GoalsView from './components/GoalsView';
import GoalDetailView from './components/GoalDetailView';
import ActionsView from './components/ActionsView';
import NotesView from './components/NotesView';
import MilestonesView from './components/MilestonesView';
import VisionView from './components/VisionView';
import ReloadPrompt from './components/ReloadPrompt';
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
  const { activeTab, selectedGoalId, setSelectedGoalId, goals, previousTab, setPreviousTab, setActiveTab } = useStore();

  const selectedGoal = goals.find(g => g.id === selectedGoalId);

  const renderContent = () => {
    switch (activeTab) {
      case 'Actions': return <ActionsView />;
      case 'Vision': return <VisionView />;
      case 'Goals': 
        return selectedGoal ? (
          <GoalDetailView 
            goal={selectedGoal} 
            onBack={() => {
              if (previousTab) {
                setActiveTab(previousTab);
                setPreviousTab(null);
              }
              setSelectedGoalId(null);
            }} 
          />
        ) : (
          <GoalsView onSelectGoal={(goal) => setSelectedGoalId(goal.id)} />
        );
      case 'Milestones': return <MilestonesView />;
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
      <ReloadPrompt />
    </div>
  );
}

export default App;
