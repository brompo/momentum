import React, { useState } from 'react';
import { useStore } from '../lib/store';
import './GoalDetailView.css';

const GoalDetailView = ({ goal, onBack }) => {
  const { addMilestone, addTask } = useStore();
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  
  const [activeMilestoneId, setActiveMilestoneId] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (newMilestoneTitle.trim()) {
      addMilestone(goal.id, newMilestoneTitle);
      setNewMilestoneTitle('');
      setIsAddingMilestone(false);
    }
  };

  const handleAddTask = (e, milestoneId) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(goal.id, milestoneId, newTaskTitle);
      setNewTaskTitle('');
      setActiveMilestoneId(null);
    }
  };

  return (
    <div className="goal-detail-view safe-area animate-fade-in">
      <button className="back-btn" onClick={onBack}>← Back</button>
      
      <div className="detail-header">
        <div className="header-meta">
          <span className="badge badge-primary">{goal.year}</span>
          {goal.startDate && goal.endDate && (
            <span className="date-range">
              {new Date(goal.startDate).toLocaleDateString()} — {new Date(goal.endDate).toLocaleDateString()}
            </span>
          )}
        </div>
        <h1>{goal.title}</h1>
        {goal.targetNumber && (
          <div className="target-badge glass">
            <span className="label">Target</span>
            <span className="value">{goal.targetNumber}</span>
          </div>
        )}
        {goal.note && <p className="goal-note">{goal.note}</p>}
      </div>

      <div className="milestones-section">
        <div className="section-header">
          <h2>Milestones</h2>
          <button className="add-small-btn" onClick={() => setIsAddingMilestone(true)}>+</button>
        </div>

        {isAddingMilestone && (
          <form className="inline-add glass-card" onSubmit={handleAddMilestone}>
            <input 
              autoFocus
              placeholder="Enter milestone..." 
              value={newMilestoneTitle}
              onChange={e => setNewMilestoneTitle(e.target.value)}
            />
            <div className="inline-actions">
              <button type="button" onClick={() => setIsAddingMilestone(false)}>Cancel</button>
              <button type="submit" className="active">Add</button>
            </div>
          </form>
        )}

        <div className="milestone-list">
          {goal.milestones.length === 0 ? (
            <p className="empty-substate">No milestones yet. Break down your goal!</p>
          ) : (
            goal.milestones.map(ms => (
              <div key={ms.id} className="milestone-card glass-card">
                <div className="ms-header">
                  <h3>{ms.title}</h3>
                  <button className="add-task-btn" onClick={() => setActiveMilestoneId(ms.id)}>+</button>
                </div>

                <div className="tasks-list">
                  {ms.tasks.map(task => (
                    <div key={task.id} className="task-item">
                      <div className={`check-circle ${task.completed ? 'completed' : ''}`}></div>
                      <span>{task.title}</span>
                    </div>
                  ))}
                  
                  {activeMilestoneId === ms.id ? (
                    <form className="task-input-row" onSubmit={(e) => handleAddTask(e, ms.id)}>
                      <input 
                        autoFocus
                        placeholder="Add task..." 
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                      />
                    </form>
                  ) : (
                    <button className="add-task-placeholder" onClick={() => setActiveMilestoneId(ms.id)}>
                      + Add a task
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalDetailView;
