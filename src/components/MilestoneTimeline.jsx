import React, { useState } from 'react';
import './MilestoneTimeline.css';

const MilestoneTimeline = ({ goal, onMilestoneClick, onToggleComplete, onAddTask, onToggleTask }) => {
  const [expandedMilestones, setExpandedMilestones] = useState({});

  const milestones = goal.milestones || [];
  
  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedMilestones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDateMMM = (dateString) => {
    if (!dateString) return 'No date';
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    } catch (e) { return dateString; }
  };

  const getStatus = (ms, idx) => {
    if (ms.completed) return 'done';
    const firstIncompleteIdx = milestones.findIndex(m => !m.completed);
    if (idx === firstIncompleteIdx) return 'active';
    return 'upcoming';
  };

  return (
    <div className="flat-ms-list">
      {milestones.map((ms, idx) => {
        const status = getStatus(ms, idx);
        const taskCount = (ms.tasks || []).length;
        const completedTaskCount = (ms.tasks || []).filter(t => t.completed).length;
        const nextTask = (ms.tasks || []).find(t => !t.completed);

        return (
          <div key={ms.id} className="flat-ms-row" onClick={() => onMilestoneClick(ms.id)}>
             {status === 'active' && (
                <div className="flat-ms-active">
                   <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>{ms.title}</span>
                      <span className="flat-pill active">Active</span>
                   </div>
                   <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px' }}>
                      {`${completedTaskCount} of ${taskCount} steps · due ${formatDateMMM(ms.targetDate || 'Jun 2026')}`}
                   </div>
                   {nextTask && (
                     <div className="flat-next-box">
                        <div style={{ color: '#c2410c', fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px' }}>Next</div>
                        <div style={{ color: '#431407', fontWeight: 600, fontSize: '0.95rem', marginBottom: '6px' }}>
                           {nextTask.title}
                        </div>
                        <div style={{ color: '#dc2626', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                           <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#dc2626' }}></span>
                           Overdue · was due {formatDateMMM(nextTask.scheduledDate || 'Apr 15')}
                        </div>
                     </div>
                   )}
                </div>
             )}
             {status === 'done' && (
                <div className="flat-ms-done" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#0d9488" stroke="none">
                         <circle cx="12" cy="12" r="12" fill="#0d9488" />
                         <polyline points="7 12 10.5 15.5 17 9" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ textDecoration: 'line-through', color: '#64748b', fontWeight: 600, fontSize: '0.95rem' }}>{ms.title}</span>
                   </div>
                   <div style={{ color: '#0d9488', fontSize: '0.85rem', fontWeight: 600 }}>{formatDateMMM(ms.createdAt || 'Mar 5')}</div>
                </div>
             )}
             {status === 'upcoming' && (
                <div className="flat-ms-upcoming" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ color: '#64748b', fontWeight: 600, fontSize: '0.95rem' }}>{ms.title}</span>
                   <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{formatDateMMM(ms.targetDate || 'Aug 2026')}</span>
                </div>
             )}
          </div>
        );
      })}
    </div>
  );
};

export default MilestoneTimeline;
