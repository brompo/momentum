import React, { useState } from 'react';
import { useStore } from '../lib/store';
import './GoalCard.css';

const GoalCard = ({ goal, onClick }) => {
  const { logGoalProgress } = useStore();
  const [isQuickLog, setIsQuickLog] = useState(false);
  const [logForm, setLogForm] = useState({ 
    amount: '', 
    note: '', 
    date: new Date().toISOString().split('T')[0] 
  });

  const allTasks = (goal.milestones || []).flatMap(ms => ms.tasks || []);
  const completedTasks = allTasks.filter(t => t.completed);

  const allMilestones = goal.milestones || [];
  const completedMilestones = allMilestones.filter(m => m.completed);
  const milestoneCount = allMilestones.length;
  const completedMilestoneCount = completedMilestones.length;

  const formatDate = (dateStr) => {
    if (!dateStr) return "No date";
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${month} ${year}`;
  };

  const badgeText = goal.endDate ? formatDate(goal.endDate) : "No date";
  const badgeClass = goal.endDate ? "badge-info" : "badge-muted";

  const targetVal = parseFloat((goal.targetNumber || '').toString().replace(/[^0-9.]/g, '')) || 0;
  const currentVal = targetVal > 0 ? completedTasks.reduce((acc, t) => acc + (t.value || 0), 0) : 0;
  
  let progress = 0;
  if (targetVal > 0) {
    progress = Math.min(Math.round((currentVal / targetVal) * 100), 100);
  } else {
    progress = milestoneCount > 0 ? Math.round((completedMilestoneCount / milestoneCount) * 100) : 0;
  }

  const handleQuickLogSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (logForm.amount) {
      logGoalProgress(goal.id, logForm.amount, logForm.note, logForm.date);
      setIsQuickLog(false);
      setLogForm({ amount: '', note: '', date: new Date().toISOString().split('T')[0] });
    }
  };

  const toggleQuickLog = (e) => {
    e.stopPropagation();
    setIsQuickLog(!isQuickLog);
  };

  const pillarColors = {
    personal: '#10b981',
    wealth: '#b45309',
    growth: '#6366f1'
  };
  const goalColor = pillarColors[goal.pillarId] || '#0d9488';

  return (
    <div className={`goal-card smooth-all animate-fade-in ${isQuickLog ? 'is-logging' : ''}`} onClick={() => !isQuickLog && onClick && onClick(goal)}>
      <div className="goal-card-indicator" style={{ backgroundColor: goalColor }}></div>
      <div className="goal-card-content">
        <div className="goal-card-header">
          <h3>{goal.title}</h3>
          <span className="goal-card-date">{badgeText}</span>
        </div>
        
        <div className="goal-card-body">
          <div className="progress-row-slim">
            <div className="progress-bar-slim">
              <div className="progress-fill-slim" style={{ width: `${progress}%`, backgroundColor: goalColor }}></div>
            </div>
            {targetVal > 0 ? (
               <span className="progress-text" style={{ color: goalColor, fontWeight: 700 }}>{progress}%</span>
            ) : (
               <span className="progress-text" style={{ color: '#64748b' }}>
                 {milestoneCount > 0 ? `${completedMilestoneCount} of ${milestoneCount} milestones` : 'No milestones yet'}
               </span>
            )}
          </div>

          {targetVal > 0 && (
            <div className="numeric-row">
              <div className="numeric-progress-label">
                <span className="current-val">{currentVal.toLocaleString()}</span>
                <span className="target-sep">/</span>
                <span className="target-val">{goal.targetNumber || targetVal.toLocaleString()}</span>
              </div>
              <button className="quick-log-trigger" onClick={toggleQuickLog} title="Quick Update" style={{ color: goalColor, borderColor: goalColor, backgroundColor: `${goalColor}10` }}>
                {isQuickLog ? '×' : '+'}
              </button>
            </div>
          )}

        {isQuickLog && (
          <form className="quick-log-form animate-fade-in" onClick={e => e.stopPropagation()} onSubmit={handleQuickLogSubmit}>
            <div className="quick-log-inputs">
              <input 
                type="number" 
                inputMode="decimal"
                placeholder="Amount" 
                autoFocus
                value={logForm.amount} 
                onChange={e => setLogForm({...logForm, amount: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Note (optional)" 
                value={logForm.note} 
                onChange={e => setLogForm({...logForm, note: e.target.value})}
              />
              <div className="quick-log-date-wrapper">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <input 
                  type="date" 
                  value={logForm.date} 
                  onChange={e => setLogForm({...logForm, date: e.target.value})}
                />
                <span>{logForm.date === new Date().toISOString().split('T')[0] ? 'Today' : logForm.date}</span>
              </div>
            </div>

            <div className="quick-log-actions">
              <button type="button" className="btn-cancel" onClick={toggleQuickLog}>Cancel</button>
              <button type="submit" className="btn-save">Log Progress</button>
            </div>
          </form>
        )}
      </div>
      </div>
    </div>
  );
};

export default GoalCard;
