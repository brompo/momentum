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
import featuremap from './data/featuremap.json';
import packageInfo from '../package.json';
import './App.css';

const SettingsView = () => {
  const {
    theme, toggleTheme, featureMap, addFeatureMapItem,
    updateFeatureMapItem, deleteFeatureMapItem
  } = useStore();
  const [activeTab, setActiveTab] = useState('general'); // 'general' or 'featuremap'
  const [featureSubTab, setFeatureSubTab] = useState('achieved'); // 'achieved' or 'pipeline'
  const [isDirty, setIsDirty] = useState(false);

  const handleInlineChange = (section, id, field, value) => {
    updateFeatureMapItem(section, id, { [field]: value });
    setIsDirty(true);
  };

  const handleListChange = (section, id, listField, idx, value) => {
    const list = [...(featureMap[section].find(i => i.id === id)?.[listField] || [])];
    list[idx] = value;
    updateFeatureMapItem(section, id, { [listField]: list });
    setIsDirty(true);
  };

  const handleAddListItem = (section, id, listField, idx) => {
    const list = [...(featureMap[section].find(i => i.id === id)?.[listField] || [])];
    list.splice(idx + 1, 0, '');
    updateFeatureMapItem(section, id, { [listField]: list });
    setIsDirty(true);
  };

  const handleRemoveListItem = (section, id, listField, idx) => {
    const list = [...(featureMap[section].find(i => i.id === id)?.[listField] || [])];
    if (list.length <= 1 && list[idx] === '') return; // Don't remove last empty one
    list.splice(idx, 1);
    updateFeatureMapItem(section, id, { [listField]: list });
    setIsDirty(true);
  };

  const cycleStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Planned' ? 'In Progress' : 'Planned';
    updateFeatureMapItem('pipeline', id, { status: nextStatus });
    setIsDirty(true);
  };

  const handleSaveToDisk = async () => {
    try {
      const response = await fetch('/api/save-feature-map', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(featureMap)
      });
      if (response.ok) {
        setIsDirty(false);
        alert('✅ Successfully saved to src/data/featuremap.json');
      } else {
        alert('❌ Failed to save: ' + await response.text());
      }
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return (
    <div className="safe-area animate-fade-in">
      <div className="header-row">
        <h1>Settings</h1>
      </div>

      <div className="settings-tabs">
        <button
          className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`tab-btn ${activeTab === 'featuremap' ? 'active' : ''}`}
          onClick={() => setActiveTab('featuremap')}
        >
          Feature Map
        </button>
      </div>

      {activeTab === 'general' ? (
        <div className="settings-list">
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

          <div className="app-version-footer">
            Momentum v{packageInfo.version}
          </div>
        </div>
      ) : (
        <div className="feature-map-view">
          <div className="settings-tabs" style={{ marginBottom: '20px', background: 'transparent', border: 'none', padding: 0, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
              <button
                className={`tab-btn ${featureSubTab === 'achieved' ? 'active' : ''}`}
                onClick={() => setFeatureSubTab('achieved')}
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                Achieved
              </button>
              <button
                className={`tab-btn ${featureSubTab === 'pipeline' ? 'active' : ''}`}
                onClick={() => setFeatureSubTab('pipeline')}
                style={{ borderRadius: 'var(--radius-lg)' }}
              >
                Pipeline
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {isLocal && (
                <button
                  className={`btn ${isDirty ? 'save-btn-active' : ''}`}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)'
                  }}
                  onClick={handleSaveToDisk}
                >
                  {isDirty ? 'Save to Code 💾' : 'Synced'}
                </button>
              )}
              <button
                className="action-icon"
                style={{ background: 'var(--primary)', color: 'white', border: 'none', width: '32px', height: '32px' }}
                onClick={() => {
                  const newItem = featureSubTab === 'achieved'
                    ? { version: '1.0.0', date: new Date().toISOString().split('T')[0], description: 'New Version', changes: ['Initial release point'] }
                    : { title: 'New Feature', status: 'Planned', features: ['Feature capability'] };
                  addFeatureMapItem(featureSubTab, newItem);
                  setIsDirty(true);
                }}
              >
                +
              </button>
            </div>
          </div>

          <div className="feature-list">
            {featureSubTab === 'achieved' ? (
              featureMap.achieved.map((ver, idx) => (
                <div key={ver.id} className="glass-card version-card animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="version-header">
                    <input
                      className="version-header editable-input"
                      value={ver.version}
                      onChange={(e) => handleInlineChange('achieved', ver.id, 'version', e.target.value)}
                    />
                    <input
                      type="date"
                      className="version-date editable-input"
                      value={ver.date}
                      style={{ textAlign: 'right', width: 'auto' }}
                      onChange={(e) => handleInlineChange('achieved', ver.id, 'date', e.target.value)}
                    />
                  </div>
                  <input
                    className="version-header editable-input"
                    value={ver.description}
                    onChange={(e) => handleInlineChange('achieved', ver.id, 'description', e.target.value)}
                  />
                  <ul className="change-list">
                    {ver.changes.map((change, cIdx) => (
                      <li key={cIdx} className="change-item">
                        <input
                          className="editable-input"
                          value={change}
                          onChange={(e) => handleListChange('achieved', ver.id, 'changes', cIdx, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddListItem('achieved', ver.id, 'changes', cIdx);
                            if (e.key === 'Backspace' && change === '') handleRemoveListItem('achieved', ver.id, 'changes', cIdx);
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                  <div className="version-actions">
                    <button className="action-icon delete" onClick={() => { deleteFeatureMapItem('achieved', ver.id); setIsDirty(true); }}>×</button>
                  </div>
                </div>
              ))
            ) : (
              featureMap.pipeline.map((item, idx) => (
                <div key={item.id} className="glass-card version-card animate-fade-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="version-header">
                    <input
                      className="version-number editable-input"
                      value={item.version || ''}
                      placeholder="v0.0.0"
                      onChange={(e) => handleInlineChange('pipeline', item.id, 'version', e.target.value)}
                    />
                    <span
                      className={`status-badge interactive ${item.status === 'In Progress' ? 'status-in-progress' : 'status-planned'}`}
                      onClick={() => cycleStatus(item.id, item.status)}
                    >
                      {item.status}
                    </span>
                  </div>
                  <input
                    className="version-desc editable-input"
                    value={item.title}
                    placeholder="Feature title"
                    onChange={(e) => handleInlineChange('pipeline', item.id, 'title', e.target.value)}
                  />
                  <ul className="change-list">
                    {item.features.map((feat, fIdx) => (
                      <li key={fIdx} className="change-item">
                        <input
                          className="editable-input"
                          value={feat}
                          onChange={(e) => handleListChange('pipeline', item.id, 'features', fIdx, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddListItem('pipeline', item.id, 'features', fIdx);
                            if (e.key === 'Backspace' && feat === '') handleRemoveListItem('pipeline', item.id, 'features', fIdx);
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                  <div className="version-actions">
                    <button className="action-icon delete" onClick={() => { deleteFeatureMapItem('pipeline', item.id); setIsDirty(true); }}>×</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
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
      default: return <GoalsView onSelectGoal={(goal) => setSelectedGoalId(goal.id)} />;
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
