import React, { useState } from 'react';
import './MilestoneTimeline.css';

const MilestoneTimeline = ({ goal, onMilestoneClick, onToggleComplete, onAddTask, onToggleTask }) => {
  const [expandedMilestones, setExpandedMilestones] = useState({});

  const milestones = goal.milestones || [];
  const completedSteps = milestones.filter(ms => ms.completed);
  const incompleteSteps = milestones.filter(ms => !ms.completed);
  
  const nextStep = incompleteSteps.length > 0 ? incompleteSteps[0] : null;
  const upcomingSteps = incompleteSteps; // In the image, the next step is also in the upcoming list

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedMilestones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDateMMM = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } catch (e) { return dateString; }
  };

  const renderMilestone = (ms, index, type) => {
    const isCompleted = ms.completed;
    const isNext = nextStep && ms.id === nextStep.id;
    const isExpanded = expandedMilestones[ms.id];
    
    // Calculate global index for numbering
    const globalIndex = milestones.findIndex(m => m.id === ms.id) + 1;

    return (
      <div key={ms.id} className={`timeline-item ${isCompleted ? 'completed' : 'upcoming'} ${isNext ? 'next-step-item' : ''}`}>
        <div className="timeline-line"></div>
        <div className={`timeline-marker ${!isCompleted && !isNext ? 'numbered' : ''}`}>
          {isCompleted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : isNext ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
            </svg>
          ) : (
            <span>{globalIndex}</span>
          )}
        </div>
        
        <div className="timeline-content">
          <div onClick={() => onMilestoneClick(ms.id)} style={{ cursor: 'pointer' }}>
            <h3>{ms.title}</h3>
            {isCompleted ? (
              <span className="timeline-date">Completed {formatDateMMM(ms.createdAt)}</span>
            ) : (
              <span className="timeline-date">Target: {ms.targetDate ? formatDateMMM(ms.targetDate) : 'Dec 2026'}</span>
            )}
          </div>
          
          {isCompleted && <div className="timeline-status-badge done">Done</div>}
          {isNext && <div className="timeline-status-badge in-progress">In progress</div>}
          {!isCompleted && !isNext && (
            <div className="dates-dropdown-trigger">
              Dates <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M19 9l-7 7-7-7" /></svg>
            </div>
          )}

          {/* Collapsible Results */}
          <button className="expand-results-btn" onClick={(e) => toggleExpand(ms.id, e)}>
            {isExpanded ? 'Hide' : 'View'} results ({(ms.tasks || []).length})
          </button>

          {isExpanded && (
            <div className="timeline-tasks-container animate-fade-in">
              {(ms.tasks || []).map(task => (
                <div key={task.id} className={`timeline-task-row ${task.completed ? 'completed' : ''}`}>
                  <div 
                    className="task-check-mini" 
                    onClick={() => onToggleTask(goal.id, ms.id, task.id)}
                    style={{ 
                      width: '18px', 
                      height: '18px', 
                      border: '2px solid #cbd5e1', 
                      borderRadius: '4px',
                      background: task.completed ? '#10b981' : 'transparent',
                      borderColor: task.completed ? '#10b981' : '#cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {task.completed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                  </div>
                  <span>{task.title}</span>
                </div>
              ))}
              <button 
                className="add-task-btn-small" 
                onClick={() => onAddTask(ms.id)}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px dashed #cbd5e1', 
                  borderRadius: '10px', 
                  background: 'none', 
                  color: '#64748b', 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  marginTop: '4px' 
                }}
              >
                + Add result
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="milestone-timeline">
      {completedSteps.length > 0 && (
        <>
          <h2 className="timeline-section-title">Completed Steps</h2>
          <div className="timeline-group">
            {completedSteps.map((ms, i) => renderMilestone(ms, i, 'completed'))}
          </div>
        </>
      )}

      {nextStep && (
        <div className="next-step-highlight">
          <label>Next Step</label>
          <p>{nextStep.title}</p>
        </div>
      )}

      {upcomingSteps.length > 0 && (
        <>
          <h2 className="timeline-section-title">Upcoming</h2>
          <div className="timeline-group">
            {upcomingSteps.map((ms, i) => renderMilestone(ms, i, 'upcoming'))}
          </div>
        </>
      )}

      {milestones.length === 0 && (
        <p className="empty-substate">No milestones defined for this goal.</p>
      )}
    </div>
  );
};

export default MilestoneTimeline;
