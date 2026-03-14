import React, { useState } from 'react';
import { useStore } from '../lib/store';
import './GoalDetailView.css';

const GoalDetailView = ({ goal, onBack }) => {
  const { addMilestone, addTask, toggleTask } = useStore();
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  
  const [activeMilestoneId, setActiveMilestoneId] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskValue, setNewTaskValue] = useState('');

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
      addTask(goal.id, milestoneId, newTaskTitle, newTaskValue);
      setNewTaskTitle('');
      setNewTaskValue('');
      setActiveMilestoneId(null);
    }
  };

  // Progress Calculations
  const allTasks = goal.milestones.flatMap(ms => ms.tasks);
  const completedTasks = allTasks.filter(t => t.completed);
  
  const targetVal = parseFloat((goal.targetNumber || '').toString().replace(/[^0-9.]/g, '')) || 0;
  const currentVal = completedTasks.reduce((acc, t) => acc + (t.value || 0), 0);
  const totalVal = allTasks.reduce((acc, t) => acc + (t.value || 0), 0);
  
  const hasTarget = targetVal > 0;
  const progressPercent = hasTarget 
    ? Math.min(Math.round((currentVal / targetVal) * 100), 100)
    : (allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0);

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
          <div className="numeric-progress glass">
            <div className="progress-info">
              <span className="label">Overall Progress</span>
              <span className="value">{currentVal.toLocaleString()} / {goal.targetNumber}</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
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
                    <div key={task.id} className="task-row">
                      <div 
                        className={`task-item ${task.completed ? 'completed' : ''}`}
                        onClick={() => toggleTask(goal.id, ms.id, task.id)}
                      >
                        <div className={`check-circle ${task.completed ? 'completed' : ''}`}></div>
                        <span>{task.title}</span>
                      </div>
                      {task.value > 0 && <span className="task-value">{task.value.toLocaleString()}</span>}
                    </div>
                  ))}
                  
                  {activeMilestoneId === ms.id ? (
                    <form className="task-input-row" onSubmit={(e) => handleAddTask(e, ms.id)}>
                      <input 
                        autoFocus
                        className="task-title-input"
                        placeholder="Add task..." 
                        value={newTaskTitle}
                        onChange={e => setNewTaskTitle(e.target.value)}
                      />
                      <input 
                        className="task-value-input"
                        type="number"
                        placeholder="Value" 
                        value={newTaskValue}
                        onChange={e => setNewTaskValue(e.target.value)}
                      />
                      <button type="submit" hidden></button>
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
