import React from 'react';
import './GoalCard.css';

const GoalCard = ({ goal, onClick }) => {
  // Enhanced progress calculation
  const allTasks = goal.milestones.flatMap(ms => ms.tasks);
  const completedTasks = allTasks.filter(t => t.completed);
  const milestoneCount = goal.milestones.length;
  const taskCount = allTasks.length;
  
  const targetVal = parseFloat(goal.targetNumber.replace(/[^0-9.]/g, '')) || 0;
  
  let progress = 0;
  let progressLabel = "";

  if (targetVal > 0) {
    const currentVal = completedTasks.reduce((acc, t) => acc + (t.value || 0), 0);
    progress = Math.min(Math.round((currentVal / targetVal) * 100), 100);
    progressLabel = `${currentVal.toLocaleString()} / ${goal.targetNumber}`;
  } else {
    progress = allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0;
    progressLabel = `${progress}% Complete`;
  }

  return (
    <div className="goal-card glass-card smooth-all animate-fade-in" onClick={() => onClick(goal)}>
      <div className="goal-card-header">
        <div className="header-top">
          <span className="badge badge-primary">{goal.year}</span>
          {goal.endDate && (
            <span className="card-date">{new Date(goal.endDate).toLocaleDateString()}</span>
          )}
        </div>
        <h3>{goal.title}</h3>
        {goal.targetNumber && (
          <div className="card-target">
            <span className="label">Target:</span> {goal.targetNumber}
          </div>
        )}
      </div>
      
      <div className="goal-card-body">
        <div className="stat-row">
          <div className="stat">
            <span className="stat-value">{milestoneCount}</span>
            <span className="stat-label">Milestones</span>
          </div>
          <div className="stat">
            <span className="stat-value">{taskCount}</span>
            <span className="stat-label">Tasks</span>
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">{progressLabel}</span>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
