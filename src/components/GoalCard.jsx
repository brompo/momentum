import React from 'react';
import './GoalCard.css';

const GoalCard = ({ goal, onClick }) => {
  const allTasks = goal.milestones.flatMap(ms => ms.tasks);
  const completedTasks = allTasks.filter(t => t.completed);
  const taskCount = allTasks.length;
  const completedCount = completedTasks.length;

  // Calculate Days Left / Expired
  const daysLeft = goal.endDate ? Math.ceil((new Date(goal.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
  let badgeText = "No date";
  let badgeClass = "badge-muted";
  if (daysLeft !== null) {
    if (daysLeft > 0) {
      badgeText = `${daysLeft}d left`;
      badgeClass = "badge-info";
    } else {
      badgeText = "Expired";
      badgeClass = "badge-danger";
    }
  }

  const targetVal = parseFloat((goal.targetNumber || '').toString().replace(/[^0-9.]/g, '')) || 0;
  const currentVal = targetVal > 0 ? completedTasks.reduce((acc, t) => acc + (t.value || 0), 0) : 0;
  
  // Milestone Calculations
  const milestoneCount = goal.milestones.length;
  const completedMilestonesCount = goal.milestones.filter(ms => 
    ms.tasks.length > 0 && ms.tasks.every(t => t.completed)
  ).length;

  let progress = 0;
  if (targetVal > 0) {
    progress = Math.min(Math.round((currentVal / targetVal) * 100), 100);
  } else {
    progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
  }

  return (
    <div className="goal-card smooth-all animate-fade-in" onClick={() => onClick(goal)}>
      <div className="goal-card-header">
        <div className="title-row">
          <h3>{goal.title}</h3>
          <span className={`badge ${badgeClass}`}>{badgeText}</span>
        </div>
      </div>
      
      <div className="goal-card-body">
        <div className="compact-stats">
          <div className="stat-item">
            <span className="stat-icon">🎯</span>
            <span className="stat-text">{completedMilestonesCount}/{milestoneCount} milestones</span>
          </div>
          <div className="stat-item">
            <span className="stat-icon">⭕</span>
            <span className="stat-text">{completedCount}/{taskCount} tasks</span>
          </div>
        </div>

        <div className="progress-container-thick">
          <div className="progress-bar-thick">
            <div className="progress-fill-thick" style={{ width: `${progress}%` }}>
              {progress > 10 && <span className="progress-percent">{progress}%</span>}
            </div>
          </div>
          {progress <= 10 && <span className="progress-percent outside">{progress}%</span>}
        </div>

        {targetVal > 0 && (
          <div className="numeric-progress-label">
            {currentVal.toLocaleString()} / {targetVal.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalCard;
