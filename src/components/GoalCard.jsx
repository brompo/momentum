import React from 'react';
import './GoalCard.css';

const GoalCard = ({ goal, onClick }) => {
  const milestoneCount = goal.milestones.length;
  const taskCount = goal.milestones.reduce((acc, ms) => acc + ms.tasks.length, 0);
  const completedTasks = goal.milestones.reduce((acc, ms) => acc + ms.tasks.filter(t => t.completed).length, 0);
  const progress = taskCount > 0 ? Math.round((completedTasks / taskCount) * 100) : 0;

  return (
    <div className="goal-card glass-card smooth-all animate-fade-in" onClick={() => onClick(goal)}>
      <div className="goal-card-header">
        <span className="badge badge-primary">{goal.year}</span>
        <h3>{goal.title}</h3>
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
          <span className="progress-text">{progress}% Complete</span>
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
