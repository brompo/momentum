import React from 'react';
import './GoalCard.css';

const GoalCard = ({ goal, onClick }) => {
  const allTasks = goal.milestones.flatMap(ms => ms.tasks);
  const completedTasks = allTasks.filter(t => t.completed);
  const taskCount = allTasks.length;
  const completedCount = completedTasks.length;

  // Calculate Days Left / Expired
  const formatDate = (dateStr) => {
    if (!dateStr) return "No date";
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(d.getDate()).padStart(2, '0');
    const month = months[d.getMonth()];
    const year = String(d.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  const badgeText = goal.endDate ? formatDate(goal.endDate) : "No date";
  const badgeClass = goal.endDate ? "badge-info" : "badge-muted";

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
    <div className="goal-card smooth-all animate-fade-in" onClick={() => onClick && onClick(goal)}>
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
          {(goal.metrics || []).map(m => (
            <div key={m.id} className="stat-item">
              <span className="stat-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateY(1px)' }}>
                  <path d="M3 3v18h18" />
                  <polyline points="7 16 11 12 16 14 19 8" />
                </svg>
              </span>
              <span className="stat-text">{m.title}: {m.currentValue}/{m.targetValue}</span>
            </div>
          ))}
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
