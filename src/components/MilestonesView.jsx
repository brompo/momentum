import React, { useState } from 'react';
import { useStore } from '../lib/store';
import './MilestonesView.css';

const MilestonesView = () => {
  const { goals, addMilestone, setActiveTab, setSelectedGoalId, setSelectedMilestoneId } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', priority: 'Low', goalId: '' });

  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (!newMilestone.title.trim() || !newMilestone.goalId) return;
    addMilestone(newMilestone.goalId, newMilestone.title, newMilestone.priority);
    setNewMilestone({ title: '', priority: 'Low', goalId: '' });
    setIsAdding(false);
  };

  const handleMilestoneClick = (goalId, milestoneId) => {
    setSelectedGoalId(goalId);
    setSelectedMilestoneId(milestoneId);
    setActiveTab('GoalDetail');
  };

  const activeMilestones = (goals || []).flatMap(goal => 
    (goal.milestones || [])
      .filter(ms => ms.active === true)
      .map(ms => ({
        ...ms,
        goalTitle: goal.title,
        goalId: goal.id
      }))
  );

  return (
    <div className="milestones-view-modern safe-area animate-fade-in">
      <div className="milestones-modern-header">
        <h1>Active Milestones</h1>
      </div>
      
      <div className="milestones-modern-grid">
        {activeMilestones.length === 0 ? (
          <div className="empty-state-modern">
            <p>No active milestones. Pin them from your achievements to see them here.</p>
          </div>
        ) : (
          activeMilestones.map(ms => {
            const completedCount = (ms.tasks || []).filter(t => t.completed).length;
            const totalCount = (ms.tasks || []).length;
            
            return (
              <div 
                key={ms.id} 
                className="milestone-modern-card glass-card"
                onClick={() => handleMilestoneClick(ms.goalId, ms.id)}
              >
                <div className="milestone-goal-pill">{ms.goalTitle.toUpperCase()}</div>
                <h3 className="milestone-title-text">{ms.title}</h3>
                
                <div className="milestone-modern-status">
                  <span className="status-badge done">
                    {completedCount}/{totalCount} Done
                  </span>
                  <span className={`status-badge priority ${(ms.priority || 'Low').toLowerCase()}`}>
                    {ms.priority || 'Low'}
                  </span>
                </div>
                
                {totalCount > 0 && (
                  <div className="progress-mini-rail">
                    <div 
                      className="progress-mini-fill" 
                      style={{ width: `${(completedCount / totalCount) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <button className="fab-btn-modern" onClick={() => setIsAdding(true)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>

      {isAdding && (
        <div className="modal-overlay glass" onClick={() => setIsAdding(false)}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Milestone</h2>
              <button className="close-btn" onClick={() => setIsAdding(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddMilestone} className="expanded-form">
              <div className="form-group">
                <label>Parent Achievement</label>
                <select 
                  value={newMilestone.goalId} 
                  onChange={e => setNewMilestone({ ...newMilestone, goalId: e.target.value })} 
                  className="modal-input" 
                  required
                >
                  <option value="">Select Achievement...</option>
                  {(goals || []).map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Milestone Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Phase 1 Reach"
                  value={newMilestone.title} 
                  onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })} 
                  className="modal-input" 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select 
                  value={newMilestone.priority} 
                  onChange={e => setNewMilestone({ ...newMilestone, priority: e.target.value })} 
                  className="modal-input"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div className="modal-actions" style={{ marginTop: '20px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestonesView;
