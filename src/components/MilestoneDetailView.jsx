import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import './MilestoneDetailView.css';

const MilestoneDetailView = ({ goalId, milestoneId, onBack }) => {
  const { goals, updateMilestone, addTask, toggleTask, deleteTask, updateTask } = useStore();
  
  const goal = goals.find(g => g.id === goalId);
  const milestone = goal?.milestones?.find(m => m.id === milestoneId);
  
  const [editForm, setEditForm] = useState({
    title: '',
    priority: 'Low',
    note: ''
  });

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', scheduledDate: new Date().toISOString().split('T')[0] + 'T09:00' });

  useEffect(() => {
    if (milestone) {
      setEditForm({
        title: milestone.title,
        priority: milestone.priority || 'Low',
        note: milestone.note || ''
      });
    }
  }, [milestone]);

  if (!goal || !milestone) {
    return (
      <div className="milestone-detail-view safe-area">
        <button onClick={onBack} className="back-btn-simple">← Back to Goal</button>
        <p>Milestone not found.</p>
      </div>
    );
  }

  const handleUpdate = (updates) => {
    updateMilestone(goalId, milestoneId, updates);
  };

  const handleNoteBlur = () => {
    handleUpdate({ note: editForm.note });
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (taskForm.title.trim()) {
      addTask(goalId, milestoneId, taskForm.title, 1, taskForm.scheduledDate, milestone.priority);
      setTaskForm({ title: '', scheduledDate: new Date().toISOString().split('T')[0] + 'T09:00' });
      setActiveTaskId(null);
    }
  };

  const allTasks = milestone.tasks || [];
  const completedTasks = allTasks.filter(t => t.completed);
  const pendingTasks = allTasks.filter(t => !t.completed);
  const progress = allTasks.length > 0 
    ? Math.round((completedTasks.length / allTasks.length) * 100) 
    : 0;

  const formatDateMMM = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } catch (e) { return dateString; }
  };

  const msIndex = goal.milestones.findIndex(m => m.id === milestoneId);
  const firstIncompleteIdx = goal.milestones.findIndex(m => !m.completed);
  const msStatus = milestone.completed ? 'done' : (msIndex === firstIncompleteIdx ? 'active' : 'upcoming');

  const activeTask = pendingTasks.length > 0 ? pendingTasks[0] : null;

  return (
    <div className="milestone-detail-view animate-fade-in">
      <div className="ms-detail-top-section">
        <button className="back-btn-simple" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
          {goal.title}
        </button>
        
        {isEditingTitle ? (
          <input
            autoFocus
            style={{ width: '100%', fontSize: '1.4rem', fontWeight: 800, border: 'none', borderBottom: '2px solid #10b981', outline: 'none', margin: '12px 0' }}
            value={editForm.title}
            onChange={e => setEditForm({...editForm, title: e.target.value})}
            onBlur={() => {
              setIsEditingTitle(false);
              handleUpdate({ title: editForm.title });
            }}
            onKeyDown={e => e.key === 'Enter' && e.target.blur()}
          />
        ) : (
          <h1 className="ms-title-large" onClick={() => setIsEditingTitle(true)}>{milestone.title}</h1>
        )}

        <div className="ms-top-status">
          {msStatus === 'active' && <span className="ms-pill active">Active</span>}
          {msStatus === 'done' && <span className="ms-pill done">Done</span>}
          {msStatus === 'upcoming' && <span className="ms-pill upcoming">Upcoming</span>}
          <span className="ms-top-stats">{progress}% · {completedTasks.length} of {allTasks.length} steps done</span>
        </div>

        <div className="ms-top-bar-container">
          <div className="ms-top-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="ms-timeline-body">
        {completedTasks.length > 0 && (
          <div className="timeline-header">Completed Steps</div>
        )}

        {completedTasks.map((t, idx) => (
          <div key={t.id} className="tl-row">
            <div className="tl-left">
              <div className="tl-node done">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div className="tl-line done"></div>
            </div>
            <div className="tl-right">
              <div className="tl-title" onClick={() => toggleTask(goalId, milestoneId, t.id)}>{t.title}</div>
              <div className="tl-meta done">
                Completed {formatDateMMM(t.scheduledDate || new Date().toISOString())}
              </div>
            </div>
          </div>
        ))}

        {activeTask && (
          <div className="next-step-card" onClick={() => toggleTask(goalId, milestoneId, activeTask.id)} style={{ cursor: 'pointer' }}>
            <div className="next-step-label">Next Step</div>
            <div className="next-step-title">{activeTask.title}</div>
            {activeTask.scheduledDate && (
              <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                Target: {formatDateMMM(activeTask.scheduledDate)}
              </div>
            )}
          </div>
        )}

        {pendingTasks.length > 1 && (
          <div className="timeline-header" style={{ marginTop: '8px' }}>Upcoming</div>
        )}

        {pendingTasks.slice(1).map((t, idx) => {
          return (
            <div key={t.id} className="tl-row">
              <div className="tl-left">
                <div className="tl-node upcoming">{completedTasks.length + idx + 2}</div>
                {idx < pendingTasks.length - 2 && <div className="tl-line grey"></div>}
              </div>
              <div className="tl-right">
                <div className="tl-title-upcoming" onClick={() => toggleTask(goalId, milestoneId, t.id)}>{t.title}</div>
                
                <div className="tl-meta upcoming" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                  <span style={{ fontSize: '0.75rem' }}>Target: {formatDateMMM(t.scheduledDate)}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Dates ▾</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Hidden but functional add task form */}
        <div style={{ marginTop: '32px' }}>
             {activeTaskId === 'new' ? (
                <form onSubmit={handleAddTask} style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                   <input
                      autoFocus
                      placeholder="Enter step title..."
                      value={taskForm.title}
                      onChange={e => setTaskForm({...taskForm, title: e.target.value})}
                      style={{ width: '100%', border: 'none', borderBottom: '2px solid #3b82f6', outline: 'none', fontSize: '0.9rem', marginBottom: '12px' }}
                   />
                   <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="date" value={taskForm.scheduledDate.split('T')[0]} onChange={e => setTaskForm({...taskForm, scheduledDate: e.target.value + 'T09:00'})} style={{ fontSize: '0.8rem', border: 'none', color: '#64748b' }} />
                      <button type="button" onClick={() => setActiveTaskId(null)} style={{ border: 'none', background: 'none', fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Cancel</button>
                      <button type="submit" style={{ border: 'none', background: 'none', fontSize: '0.8rem', fontWeight: 600, color: '#3b82f6' }}>Add Step</button>
                   </div>
                </form>
             ) : (
                <button onClick={() => setActiveTaskId('new')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                   <span>+</span> Add a new step
                </button>
             )}
        </div>
      </div>
    </div>
  );
};

export default MilestoneDetailView;
