import React, { useState } from 'react';
import './MilestoneTimeline.css';

const MilestoneTimeline = ({ goal, onMilestoneClick, onToggleComplete, onAddTask, onToggleTask, onToggleFocus }) => {
  const [expandedMilestones, setExpandedMilestones] = useState({});

  const inFocusList = goal.milestones.filter(m => m.inFocus && !m.completed);
  const doneList = goal.milestones.filter(m => m.completed);
  const draftList = goal.milestones.filter(m => !m.inFocus && !m.completed);

  const formatDateMMM = (dateString, useYear = false) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (useYear) return `${months[date.getMonth()]} ${date.getFullYear()}`;
      return `${months[date.getMonth()]} ${date.getDate()}`;
    } catch (e) { return dateString; }
  };

  const renderInFocus = (ms) => {
    const taskCount = (ms.tasks || []).length;
    const completedTaskCount = (ms.tasks || []).filter(t => t.completed).length;
    const nextTask = (ms.tasks || []).find(t => !t.completed);

    return (
      <div key={ms.id} className="flat-ms-row" onClick={() => onMilestoneClick(ms.id)}>
        <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{ms.title}</span>
          <button
            className="star-btn"
            onClick={(e) => { e.stopPropagation(); onToggleFocus(ms.id, ms.inFocus); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#d97706" stroke="#d97706" strokeWidth="1.5" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          </button>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
          {taskCount > 0 ? `${completedTaskCount} of ${taskCount} steps` : 'no steps'} {ms.endDate ? `· due ${formatDateMMM(ms.endDate, true)}` : '· no date'}
        </div>
        {nextTask && (
          <div className="flat-next-box-new">
            <div style={{ color: '#92400e', fontSize: '0.75rem', fontWeight: 800, marginBottom: '2px' }}>Next</div>
            <div style={{ color: '#431407', fontWeight: 600, fontSize: '0.95rem', marginBottom: '6px' }}>
              {nextTask.title}
            </div>
            {nextTask.scheduledDate && (
              <div style={{ color: '#92400e', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Due {formatDateMMM(nextTask.scheduledDate)}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDone = (ms) => {
    return (
      <div key={ms.id} className="flat-ms-row" onClick={() => onMilestoneClick(ms.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#0d9488" stroke="none">
            <circle cx="12" cy="12" r="12" fill="#0d9488" />
            <polyline points="7 12 10.5 15.5 17 9" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ color: '#64748b', fontWeight: 600, fontSize: '0.95rem' }}>{ms.title}</span>
        </div>
        <div style={{ color: '#0d9488', fontSize: '0.85rem', fontWeight: 600 }}>{formatDateMMM(ms.updatedAt || new Date())}</div>
      </div>
    );
  };

  const renderDraft = (ms) => {
    return (
      <div key={ms.id} className="flat-ms-row" onClick={() => onMilestoneClick(ms.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem' }}>{ms.title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
            {ms.endDate ? `due ${formatDateMMM(ms.endDate, true)}` : 'No date'} · {ms.tasks && ms.tasks.length > 0 ? `${ms.tasks.length} steps` : 'no steps'}
          </span>
          <button
            className="star-btn"
            onClick={(e) => { e.stopPropagation(); onToggleFocus(ms.id, ms.inFocus); }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flat-ms-list">

      {inFocusList.length > 0 && (
        <>
          <div className="timeline-section-header">IN FOCUS</div>
          {inFocusList.map(ms => renderInFocus(ms))}
        </>
      )}

      {doneList.map(ms => renderDone(ms))}

      {draftList.length > 0 && (
        <>
          <div className="timeline-section-header">DRAFT</div>
          {draftList.map(ms => renderDraft(ms))}
        </>
      )}

    </div>
  );
};

export default MilestoneTimeline;
