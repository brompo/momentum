import React, { useState } from 'react';
import { useStore } from '../lib/store';
import './GoalDetailView.css';

const GoalDetailView = ({ goal, onBack }) => {
  const { addMilestone, addTask, toggleTask, updateGoal, deleteGoal, addMetric, updateMetricValue, addMetricEntry } = useStore();
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: goal.title,
    note: goal.note || '',
    startDate: goal.startDate || '',
    endDate: goal.endDate || '',
    targetNumber: goal.targetNumber || ''
  });
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  
  const [activeMilestoneId, setActiveMilestoneId] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskValue, setNewTaskValue] = useState('');
  const [activeTab, setActiveTab] = useState('Milestones'); // 'Milestones' or 'Tasks'
  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [newMetricTitle, setNewMetricTitle] = useState('');
  const [newMetricTarget, setNewMetricTarget] = useState('');

  const [activeLogMetric, setActiveLogMetric] = useState(null);
  const [logForm, setLogForm] = useState({
    text: '',
    date: new Date().toISOString().split('T')[0],
    value: 1
  });

  const handleAddMetric = (e) => {
    e.preventDefault();
    if (newMetricTitle.trim() && newMetricTarget) {
      addMetric(goal.id, newMetricTitle, newMetricTarget);
      setNewMetricTitle('');
      setNewMetricTarget('');
      setIsAddingMetric(false);
    }
  };

  const handleAddMetricEntry = (e) => {
    e.preventDefault();
    if (activeLogMetric) {
      addMetricEntry(goal.id, activeLogMetric.id, logForm);
      setActiveLogMetric(null);
      setLogForm({ text: '', date: new Date().toISOString().split('T')[0], value: 1 });
    }
  };

  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (newMilestoneTitle.trim()) {
      addMilestone(goal.id, newMilestoneTitle);
      setNewMilestoneTitle('');
      setIsAddingMilestone(false);
    }
  };

  const handleAddTask = (e, milestoneId) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      addTask(goal.id, milestoneId, newTaskTitle, newTaskValue);
      setNewTaskTitle('');
      setNewTaskValue('');
      setActiveMilestoneId(null);
    }
  };

  const handleUpdateGoal = (e) => {
    e.preventDefault();
    updateGoal(goal.id, editForm);
    setIsEditingGoal(false);
  };

  const handleDeleteGoal = () => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      deleteGoal(goal.id);
      onBack();
    }
  };

  // Progress Calculations
  const allTasks = goal.milestones.flatMap(ms => ms.tasks);
  const completedTasks = allTasks.filter(t => t.completed);
  
  const targetVal = parseFloat((goal.targetNumber || '').toString().replace(/[^0-9.]/g, '')) || 0;
  const currentVal = completedTasks.reduce((acc, t) => acc + (t.value || 0), 0);
  const totalVal = allTasks.reduce((acc, t) => acc + (t.value || 0), 0);
  
  const hasTarget = targetVal > 0;
  const progressPercent = hasTarget 
    ? Math.min(Math.round((currentVal / targetVal) * 100), 100)
    : (allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0);

  return (
    <div className="goal-detail-view safe-area animate-fade-in">
      <div className="detail-top-nav">
        <button className="back-btn-icon" onClick={onBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div className="nav-actions">
          <button className="icon-btn" onClick={() => setIsEditingGoal(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
          <button className="icon-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg></button>
        </div>
      </div>
      
      <div className="detail-header">
        <div className="title-with-accent">
          <div className="accent-bar"></div>
          <h1>{goal.title}</h1>
        </div>
      </div>
      {goal.targetNumber && (
        <div className="numeric-progress glass">
          <div className="progress-info">
            <span className="label">Overall Progress</span>
            <span className="value">{currentVal.toLocaleString()} / {targetVal.toLocaleString()}</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>
      )}

      {/* Sub-Metrics Section */}
      <div className="metrics-rack">
        <div className="section-header">
          <h2>Sub-Metrics</h2>
          <button className="add-small-btn" onClick={() => setIsAddingMetric(!isAddingMetric)}>+</button>
        </div>

        {isAddingMetric && (
          <form className="inline-add glass-card" onSubmit={handleAddMetric}>
            <div className="form-row">
              <input 
                autoFocus
                placeholder="Metric Name (e.g. Leads)" 
                value={newMetricTitle}
                onChange={e => setNewMetricTitle(e.target.value)}
              />
              <input 
                type="number"
                placeholder="Target" 
                value={newMetricTarget}
                onChange={e => setNewMetricTarget(e.target.value)}
              />
            </div>
            <div className="inline-actions">
              <button type="button" onClick={() => setIsAddingMetric(false)}>Cancel</button>
              <button type="submit" className="active">Add</button>
            </div>
          </form>
        )}

        <div className="metrics-list-row">
          {(goal.metrics || []).length === 0 && !isAddingMetric && (
            <p className="empty-substate">No sub-metrics added yet.</p>
          )}
          {(goal.metrics || []).map(m => (
            <div key={m.id} className="metric-badge-item glass-card flex-column">
              <div className="metric-top-row">
                <div className="metric-info">
                  <span className="metric-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--primary)' }}>
                      <path d="M3 3v18h18" />
                      <polyline points="7 16 11 12 16 14 19 8" />
                    </svg>
                    {m.title}
                  </span>
                  <span className="metric-value">{m.currentValue.toLocaleString()} / {m.targetValue.toLocaleString()}</span>
                </div>
                <div className="metric-stepper">
                  <button onClick={() => updateMetricValue(goal.id, m.id, -1)}>-</button>
                  <button className="plus" onClick={() => {
                    setActiveLogMetric(m);
                    setLogForm(prev => ({ ...prev, value: 1 }));
                  }}>+</button>
                </div>
              </div>

              {/* Log History */}
              {(m.entries || []).length > 0 && (
                <div className="metric-history-logs">
                  {(m.entries).map(entry => (
                    <div key={entry.id} className="history-log-item">
                      <span className="log-date">{entry.date.split('-').slice(1).join('/')}</span>
                      <span className="log-text">{entry.text}</span>
                      <span className="log-value">+{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="tab-bar-capsule">
        <button 
          className={`tab-btn ${activeTab === 'Milestones' ? 'active' : ''}`}
          onClick={() => setActiveTab('Milestones')}
        >
          Milestones
        </button>
        <button 
          className={`tab-btn ${activeTab === 'Tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('Tasks')}
        >
          Tasks
        </button>
      </div>

      {activeTab === 'Milestones' ? (
        <div className="milestones-section">
          {goal.note && <p className="goal-note">{goal.note}</p>}

          <div className="section-header">
            <h2>Milestones</h2>
            <button className="add-small-btn" onClick={() => setIsAddingMilestone(true)}>+</button>
          </div>

          {isAddingMilestone && (
            <form className="inline-add glass-card" onSubmit={handleAddMilestone}>
              <input 
                autoFocus
                placeholder="Enter milestone..." 
                value={newMilestoneTitle}
                onChange={e => setNewMilestoneTitle(e.target.value)}
              />
              <div className="inline-actions">
                <button type="button" onClick={() => setIsAddingMilestone(false)}>Cancel</button>
                <button type="submit" className="active">Add</button>
              </div>
            </form>
          )}

          <div className="milestone-list">
            {goal.milestones.length === 0 ? (
              <p className="empty-substate">No milestones yet. Break down your goal!</p>
            ) : (
              goal.milestones.map(ms => (
                <div key={ms.id} className="milestone-card glass-card">
                  <div className="ms-header">
                    <h3>{ms.title}</h3>
                    <button className="add-task-btn" onClick={() => setActiveMilestoneId(ms.id)}>+</button>
                  </div>

                  <div className="tasks-list">
                    {ms.tasks.map(task => (
                      <div key={task.id} className="task-row">
                        <div 
                          className={`task-item ${task.completed ? 'completed' : ''}`}
                          onClick={() => toggleTask(goal.id, ms.id, task.id)}
                        >
                          <div className={`check-circle ${task.completed ? 'completed' : ''}`}></div>
                          <span>{task.title}</span>
                        </div>
                        {task.value > 0 && <span className="task-value">{task.value.toLocaleString()}</span>}
                      </div>
                    ))}
                    
                    {activeMilestoneId === ms.id ? (
                      <form className="task-input-row" onSubmit={(e) => handleAddTask(e, ms.id)}>
                        <input 
                          autoFocus
                          className="task-title-input"
                          placeholder="Add task..." 
                          value={newTaskTitle}
                          onChange={e => setNewTaskTitle(e.target.value)}
                        />
                        <input 
                          className="task-value-input"
                          type="number"
                          placeholder="Value" 
                          value={newTaskValue}
                          onChange={e => setNewTaskValue(e.target.value)}
                        />
                        <button type="submit" hidden></button>
                      </form>
                    ) : (
                      <button className="add-task-placeholder" onClick={() => setActiveMilestoneId(ms.id)}>
                        + Add a task
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="tasks-section">
          <h2>All Tasks</h2>
          <div className="tasks-list-flat">
            {allTasks.length === 0 ? (
              <p className="empty-substate">No tasks created yet.</p>
            ) : (
              allTasks.map(task => (
                <div key={task.id} className="task-row card-style">
                  <div className={`task-item ${task.completed ? 'completed' : ''}`}>
                    <div className={`check-circle ${task.completed ? 'completed' : ''}`}></div>
                    <span>{task.title}</span>
                  </div>
                  {task.value > 0 && <span className="task-value">{task.value.toLocaleString()}</span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {isEditingGoal && (
        <div className="modal-overlay glass" onClick={() => setIsEditingGoal(false)}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2>Edit Goal</h2>
            <form onSubmit={handleUpdateGoal} className="expanded-form">
              <div className="form-group">
                <label>Goal Name</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="modal-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Note</label>
                <textarea
                  value={editForm.note}
                  onChange={e => setEditForm({ ...editForm, note: e.target.value })}
                  className="modal-input"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={e => setEditForm({ ...editForm, startDate: e.target.value })}
                    className="modal-input"
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={e => setEditForm({ ...editForm, endDate: e.target.value })}
                    className="modal-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Target Number (Optional)</label>
                <input
                  type="text"
                  value={editForm.targetNumber}
                  onChange={e => setEditForm({ ...editForm, targetNumber: e.target.value })}
                  className="modal-input"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-danger" onClick={handleDeleteGoal}>Delete Goal</button>
                <div style={{ flex: 1 }}></div>
                <button type="button" className="btn-secondary" onClick={() => setIsEditingGoal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeLogMetric && (
        <div className="modal-overlay glass" onClick={() => setActiveLogMetric(null)}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2>Log Entry: {activeLogMetric.title}</h2>
            <form onSubmit={handleAddMetricEntry} className="expanded-form">
              <div className="form-group">
                <label>Description / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Added 5 Organic leads"
                  value={logForm.text}
                  onChange={e => setLogForm({ ...logForm, text: e.target.value })}
                  className="modal-input"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={logForm.date}
                    onChange={e => setLogForm({ ...logForm, date: e.target.value })}
                    className="modal-input"
                  />
                </div>
                <div className="form-group">
                  <label>Value / Count</label>
                  <input
                    type="number"
                    min="1"
                    value={logForm.value}
                    onChange={e => setLogForm({ ...logForm, value: parseFloat(e.target.value) || 1 })}
                    className="modal-input"
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setActiveLogMetric(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalDetailView;
