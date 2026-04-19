import React, { useState } from 'react';
import './MilestoneTimeline.css';

const MilestoneTimeline = ({ goal, onMilestoneClick, onToggleComplete, onAddTask, onToggleTask, onToggleFocus, onToggleOneThing }) => {
  const isMsReallyDone = (m) => m.completed && (m.tasks || []).every(t => t.completed);

  const oneThingList = goal.milestones.filter(m => m.isOneThing && !isMsReallyDone(m));
  const activeList = goal.milestones.filter(m => m.inFocus && !m.isOneThing && !isMsReallyDone(m));
  const doneList = goal.milestones.filter(m => isMsReallyDone(m));
  const draftList = goal.milestones.filter(m => !m.inFocus && !m.isOneThing && !isMsReallyDone(m));

  const formatDateMMM = (dateString, useYear = false) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (useYear) return `${months[date.getMonth()]} ${date.getFullYear()}`;
      return `${months[date.getMonth()]} ${date.getDate()}`;
    } catch (e) { return dateString; }
  };

  const renderActiveCard = (ms, isOneThing = false) => {
    const taskCount = (ms.tasks || []).length;
    const completedTaskCount = (ms.tasks || []).filter(t => t.completed).length;
    const nextTask = (ms.tasks || []).find(t => !t.completed);
    const progressPct = taskCount > 0 ? (completedTaskCount / taskCount) * 100 : 0;

    return (
      <div key={ms.id} className={`ms-card in-focus ${isOneThing ? 'one-thing' : ''}`} onClick={() => onMilestoneClick(ms.id)}>
        <div className="ms-card-top">
          <div className="ms-title-area">
             {isOneThing && <span className="one-thing-crown" title="The One Thing">★</span>}
             <span className="ms-card-title">{ms.title}</span>
          </div>
          <div className="ms-card-actions">
            {!isOneThing && oneThingList.length === 0 && (
              <button 
                className="ms-promote-btn" 
                onClick={(e) => { e.stopPropagation(); onToggleOneThing(ms.id); }}
                title="Promote to One Thing"
              >
                One Thing ↑
              </button>
            )}
            <button
              className="ms-focus-pill active"
              onClick={(e) => { 
                e.stopPropagation(); 
                isOneThing ? onToggleOneThing(ms.id) : onToggleFocus(ms.id, ms.inFocus); 
              }}
            >
              {isOneThing ? 'one thing' : 'active'}
            </button>
          </div>
        </div>
        <div className="ms-inline-progress-bg">
          <div className="ms-inline-progress-fill" style={{ width: `${progressPct}%` }}></div>
        </div>
        <div className="ms-card-meta">
          {taskCount > 0 ? `${completedTaskCount} / ${taskCount} steps` : <span className="ms-status-alert">no steps</span>}
          {ms.endDate && ` · ${formatDateMMM(ms.endDate, true)}`}
        </div>
        {nextTask && (
          <div className="flat-next-box-new">
            <span className="next-label">Next: </span>
            <span className="next-title">{nextTask.title}</span>
            {nextTask.scheduledDate && (
              <span className="next-date">{formatDateMMM(nextTask.scheduledDate)}</span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDone = (ms) => {
    return (
      <div key={ms.id} className="ms-card completed" onClick={() => onMilestoneClick(ms.id)}>
        <div className="ms-card-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0d9488" stroke="none">
              <circle cx="12" cy="12" r="12" fill="#0d9488" />
              <polyline points="7 12 10.5 15.5 17 9" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="ms-card-title">{ms.title}</span>
          </div>
          <span className="ms-card-meta">{formatDateMMM(ms.updatedAt || new Date())}</span>
        </div>
      </div>
    );
  };

  const renderDraft = (ms) => {
    return (
      <div key={ms.id} className="ms-card draft" onClick={() => onMilestoneClick(ms.id)}>
        <div className="ms-card-top">
          <span className="ms-card-title">{ms.title}</span>
          <button
            className="ms-focus-pill"
            onClick={(e) => { e.stopPropagation(); onToggleFocus(ms.id, ms.inFocus); }}
          >
            active ↑
          </button>
        </div>
        <div className="ms-card-meta">
          {ms.tasks && ms.tasks.length > 0 ? `${ms.tasks.length} steps` : <span className="ms-status-alert">no steps</span>}
          {ms.endDate && ` · ${formatDateMMM(ms.endDate, true)}`}
        </div>
      </div>
    );
  };

  return (
    <div className="timeline-card-list">
      {oneThingList.length > 0 && (
        <>
          <div className="timeline-section-header in-focus one-thing">THE ONE THING</div>
          <div className="timeline-cards-wrapper">
             {oneThingList.map(ms => renderActiveCard(ms, true))}
          </div>
        </>
      )}

      {activeList.length > 0 && (
        <>
          <div className="timeline-section-header in-focus">ACTIVE</div>
          <div className="timeline-cards-wrapper">
            {activeList.map(ms => renderActiveCard(ms, false))}
          </div>
        </>
      )}

      {draftList.length > 0 && (
        <>
          <div className="timeline-section-header">DRAFT</div>
          <div className="timeline-cards-wrapper">
            {draftList.map(ms => renderDraft(ms))}
          </div>
        </>
      )}

      {doneList.length > 0 && (
        <>
          <div className="timeline-section-header">COMPLETED</div>
          <div className="timeline-cards-wrapper">
            {doneList.map(ms => renderDone(ms))}
          </div>
        </>
      )}
    </div>
  );
};

export default MilestoneTimeline;
