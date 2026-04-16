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

  const completedTasks = (milestone.tasks || []).filter(t => t.completed);
  const pendingTasks = (milestone.tasks || []).filter(t => !t.completed);
  const progress = (milestone.tasks || []).length > 0 
    ? Math.round((completedTasks.length / milestone.tasks.length) * 100) 
    : 0;

  const formatDateMMM = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    } catch (e) { return dateString; }
  };

  return (
    <div className="milestone-detail-view safe-area animate-fade-in">
      <div className="detail-top-nav">
        <button className="back-btn-icon" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div className="nav-label">Milestone Details</div>
        <div className="ms-status-badge">{milestone.completed ? 'Completed' : 'Active'}</div>
      </div>

      <header className="ms-detail-header">
        <div className="ms-goal-context">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
          {goal.title}
        </div>
        
        {isEditingTitle ? (
          <input
            autoFocus
            className="ms-title-edit-input"
            value={editForm.title}
            onChange={e => setEditForm({...editForm, title: e.target.value})}
            onBlur={() => {
              setIsEditingTitle(false);
              handleUpdate({ title: editForm.title });
            }}
            onKeyDown={e => e.key === 'Enter' && e.target.blur()}
          />
        ) : (
          <h3 className="ms-main-title" onClick={() => setIsEditingTitle(true)}>{milestone.title}</h3>
        )}

        <div className="ms-meta-bar">
          <select 
            className={`priority-select ${editForm.priority.toLowerCase()}`}
            value={editForm.priority}
            onChange={e => {
              const p = e.target.value;
              setEditForm({...editForm, priority: p});
              handleUpdate({ priority: p });
            }}
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>
          
          <div className="ms-progress-stat">
            <div className="progress-ring-mini">
              <svg viewBox="0 0 36 36">
                <path className="ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="ring-fill" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
            </div>
            <span>{progress}%</span>
          </div>
        </div>
      </header>

      <section className="ms-info-section">
        <label>Information & Notes</label>
        <textarea
          placeholder="Add detailed information about this milestone..."
          value={editForm.note}
          onChange={e => setEditForm({...editForm, note: e.target.value})}
          onBlur={handleNoteBlur}
          className="ms-note-textarea"
        />
      </section>

      <section className="ms-tasks-section">
        <div className="section-header">
          <label>Results & Actions</label>
          <span className="count-badge">{milestone.tasks.length}</span>
        </div>

        <div className="ms-task-list">
          {pendingTasks.map(task => (
            <div key={task.id} className="task-row glass-card">
              <div 
                className="task-check" 
                onClick={() => toggleTask(goalId, milestoneId, task.id)}
              />
              <span className="task-title">{task.title}</span>
              {task.scheduledDate && (
                <span className="task-date">{formatDateMMM(task.scheduledDate)}</span>
              )}
            </div>
          ))}

          {activeTaskId === 'new' ? (
            <form className="inline-task-form glass-card" onSubmit={handleAddTask}>
              <input 
                autoFocus
                placeholder="What is the result?"
                value={taskForm.title}
                onChange={e => setTaskForm({...taskForm, title: e.target.value})}
              />
              <div className="form-actions">
                <input 
                  type="date"
                  value={taskForm.scheduledDate.split('T')[0]}
                  onChange={e => setTaskForm({...taskForm, scheduledDate: e.target.value + 'T09:00'})}
                />
                <button type="button" onClick={() => setActiveTaskId(null)}>Cancel</button>
                <button type="submit" className="active-btn">Add</button>
              </div>
            </form>
          ) : (
            <button className="add-task-btn" onClick={() => setActiveTaskId('new')}>
              + Add a result
            </button>
          )}

          {completedTasks.length > 0 && (
            <div className="completed-divider">
              <span>Completed</span>
            </div>
          )}

          {completedTasks.map(task => (
            <div key={task.id} className="task-row glass-card completed">
              <div 
                className="task-check checked" 
                onClick={() => toggleTask(goalId, milestoneId, task.id)}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <span className="task-title">{task.title}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MilestoneDetailView;
