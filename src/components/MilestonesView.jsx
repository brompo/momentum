import React, { useState } from 'react';
import { useStore } from '../lib/store';
import './MilestonesView.css';

const MilestonesView = () => {
  const { goals, pillars, setSelectedGoalId, setSelectedMilestoneId, setActiveTab } = useStore();
  const [collapsedPillars, setCollapsedPillars] = useState({});

  const handleMilestoneClick = (goalId, milestoneId) => {
    setSelectedGoalId(goalId);
    setSelectedMilestoneId(milestoneId);
    setActiveTab('GoalDetail');
  };

  const togglePillar = (id) => {
    setCollapsedPillars(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getActiveMilestones = () => {
    return (goals || []).flatMap(goal => 
      (goal.milestones || [])
        .filter(ms => ms.active === true)
        .map(ms => ({
          ...ms,
          goalTitle: goal.title,
          goalId: goal.id,
          pillarId: goal.pillarId || 'personal'
        }))
    );
  };

  const activeMilestones = getActiveMilestones();

  return (
    <div className="milestones-view-modern safe-area animate-fade-in">
      <div className="milestones-modern-header">
        <h1>Active Milestones</h1>
      </div>
      
      <div className="pillars-container" style={{ paddingBottom: '110px' }}>
        {pillars.map(pillar => {
          const pillarMilestones = activeMilestones.filter(ms => ms.pillarId === pillar.id);
          const isCollapsed = collapsedPillars[pillar.id];
          
          if (pillarMilestones.length === 0) return null;

          return (
            <div key={pillar.id} className="pillar-group" style={{ marginBottom: '16px' }}>
              <div 
                className="pillar-group-header" 
                onClick={() => togglePillar(pillar.id)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '8px', 
                  borderBottom: '1px solid rgba(0,0,0,0.03)', 
                  paddingBottom: '4px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '1rem', opacity: 0.8 }}>{pillar.icon}</span>
                <h2 style={{ fontSize: '0.7rem', fontWeight: 900, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1 }}>{pillar.title}</h2>
                <svg 
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="3" 
                  style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {!isCollapsed && (
                <div className="milestones-modern-grid" style={{ gap: '8px' }}>
                  {pillarMilestones.map(ms => {
                    const completedCount = (ms.tasks || []).filter(t => t.completed).length;
                    const totalCount = (ms.tasks || []).length;
                    
                    return (
                      <div 
                        key={ms.id} 
                        className="milestone-modern-card glass-card"
                        onClick={() => handleMilestoneClick(ms.goalId, ms.id)}
                        style={{ padding: '12px 16px', borderRadius: '16px' }}
                      >
                        <div className="milestone-goal-pill" style={{ fontSize: '0.6rem', marginBottom: '2px' }}>{ms.goalTitle.toUpperCase()}</div>
                        <h3 className="milestone-title-text" style={{ fontSize: '1rem', marginBottom: '10px' }}>{ms.title}</h3>
                        
                        <div className="milestone-modern-status">
                          <span className="status-badge done" style={{ padding: '3px 8px', fontSize: '0.65rem' }}>
                            {completedCount}/{totalCount} Done
                          </span>
                          <span className={`status-badge priority ${(ms.priority || 'Low').toLowerCase()}`} style={{ padding: '3px 8px', fontSize: '0.65rem' }}>
                            {ms.priority || 'Low'}
                          </span>
                        </div>
                        
                        {totalCount > 0 && (
                          <div className="progress-mini-rail" style={{ height: '3px' }}>
                            <div 
                              className="progress-mini-fill" 
                              style={{ width: `${(completedCount / totalCount) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {activeMilestones.length === 0 && (
          <div className="empty-state-modern">
            <p>No active milestones. Pin them from your achievements to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestonesView;
