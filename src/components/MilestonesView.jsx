import React, { useState } from 'react';
import { useStore } from '../lib/store';
import './MilestonesView.css';

const MilestonesView = () => {
  const { goals, addTask, toggleTask, addMilestone } = useStore();
  const [expandedMilestoneId, setExpandedMilestoneId] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', priority: 'Low', goalId: '' });

  const handleAddTask = (goalId, milestoneId) => {
    if (!newTaskTitle.trim()) return;
    const today = new Date().toISOString().split('T')[0];
    addTask(goalId, milestoneId, newTaskTitle, 0, today, 'Medium');
    setNewTaskTitle('');
  };

  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (!newMilestone.title.trim() || !newMilestone.goalId) return;
    addMilestone(newMilestone.goalId, newMilestone.title, newMilestone.priority);
    setNewMilestone({ title: '', priority: 'Low', goalId: '' });
    setIsAdding(false);
  };

  const allMilestones = (goals || []).flatMap(goal => 
    (goal.milestones || []).map(ms => ({
      ...ms,
      goalTitle: goal.title,
      goalId: goal.id
    }))
  );

  return (
    <div className="milestones-container safe-area animate-fade-in">
      <div className="milestones-header">
        <h1>Active Milestones</h1>
      </div>
      
      <div className="milestones-list">
        {allMilestones.length === 0 ? (
          <p className="empty-state">No active milestones yet.</p>
        ) : (
          allMilestones.map(ms => {
            const isExpanded = expandedMilestoneId === ms.id;
            const completedCount = (ms.tasks || []).filter(t => t.completed).length;
            const totalCount = (ms.tasks || []).length;
            const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
            
            return (
              <div 
                key={ms.id} 
                className={`milestone-card ${isExpanded ? 'expanded' : ''}`}
                onClick={() => setExpandedMilestoneId(isExpanded ? null : ms.id)}
              >
                <div className="milestone-content">
                  <span className="milestone-goal-tag">{ms.goalTitle}</span>
                  <h3 className="milestone-title">{ms.title}</h3>
                  
                  {!isExpanded && (
                    <div className="milestone-meta">
                      <span className="milestone-badge done">
                        {completedCount}/{totalCount} Done
                      </span>
                      <span className="milestone-badge priority">
                        {ms.priority} Priority
                      </span>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="milestone-tasks" onClick={e => e.stopPropagation()}>
                      <div className="tasks-header">TARGET ACTIONS</div>
                      <div className="tasks-container">
                        {totalCount === 0 ? (
                          <p className="empty-state">Define your first daily action below.</p>
                        ) : (
                          (ms.tasks || []).map(task => (
                            <div key={task.id} className="milestone-task-item">
                              <input 
                                type="checkbox" 
                                checked={task.completed} 
                                onChange={() => toggleTask(ms.goalId, ms.id, task.id)}
                              />
                              <span className={`milestone-task-title ${task.completed ? 'completed' : ''}`}>
                                {task.title}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <div className="add-task-inline">
                        <input 
                          type="text" 
                          placeholder="What's the next step?" 
                          value={newTaskTitle}
                          onChange={e => setNewTaskTitle(e.target.value)}
                        />
                        <button onClick={() => handleAddTask(ms.goalId, ms.id)}>Add</button>
                      </div>
                    </div>
                  )}
                </div>

                <div 
                  className="progress-mini-bar" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            );
          })
        )}
      </div>

      {isAdding && (
        <div className="modal-overlay glass" onClick={() => setIsAdding(false)}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2>New Milestone</h2>
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
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Milestone Title</label>
                <input 
                  type="text" 
                  value={newMilestone.title} 
                  onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })} 
                  className="modal-input" 
                  required 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button className="fab-btn smooth-all" onClick={() => setIsAdding(true)}>+</button>
    </div>
  );
};

export default MilestonesView;
