import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import './GoalDetailView.css';

const GoalDetailView = ({ goal, onBack }) => {
  const { addMilestone, addTask, toggleTask, deleteTask, updateTask, updateGoal, deleteGoal, addMetric, updateMetricValue, addMetricEntry, deleteMetricEntry, updateMetricEntry } = useStore();
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
  const [newMilestonePriority, setNewMilestonePriority] = useState('Low');
  
  const [activeMilestoneId, setActiveMilestoneId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', value: '', scheduledDate: new Date().toISOString().split('T')[0] });
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
  const [editingEntryId, setEditingEntryId] = useState(null);
  const [editEntryForm, setEditEntryForm] = useState({ text: '', date: '', value: 1 });
  const [collapsedMilestones, setCollapsedMilestones] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMilestoneCollapse = (id) => {
    setCollapsedMilestones(prev => ({ ...prev, [id]: !prev[id] }));
  };

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

  const handleEditEntrySave = (e, metricId, entryId) => {
    e.preventDefault();
    updateMetricEntry(goal.id, metricId, entryId, {
      text: editEntryForm.text,
      date: editEntryForm.date,
      value: Number(editEntryForm.value) || 0
    });
    setEditingEntryId(null);
  };

  const handleAddMilestone = (e) => {
    e.preventDefault();
    if (newMilestoneTitle.trim()) {
      addMilestone(goal.id, newMilestoneTitle, newMilestonePriority);
      setNewMilestoneTitle('');
      setNewMilestonePriority('Low');
      setIsAddingMilestone(false);
    }
  };

  const saveNewTask = (milestoneId) => {
    if (taskForm.title.trim()) {
      const cleanNumeric = taskForm.value.toString().replace(/[^0-9]/g, '');
      const numericValue = parseFloat(cleanNumeric) || 0;
      
      const milestone = goal.milestones.find(m => m.id === milestoneId);
      const priorityToUse = milestone ? milestone.priority : 'Low';

      addTask(goal.id, milestoneId, taskForm.title, numericValue, taskForm.scheduledDate, priorityToUse);
      setTaskForm({ title: '', value: '', scheduledDate: new Date().toISOString().split('T')[0] });
    }
    setActiveMilestoneId(null);
  };

  const handleAddTask = (e, milestoneId) => {
    e.preventDefault();
    saveNewTask(milestoneId);
  };

  const saveEditTask = (milestoneId, taskId) => {
    if (taskForm.title && taskForm.title.trim()) {
      const cleanNumeric = taskForm.value.toString().replace(/[^0-9]/g, '');
      const numericValue = parseFloat(cleanNumeric) || 0;
      updateTask(goal.id, milestoneId, taskId, {
        title: taskForm.title,
        value: numericValue,
        scheduledDate: taskForm.scheduledDate
      });
    }
    setEditingTaskId(null);
  };

  const handleEditTaskSave = (e, milestoneId, taskId) => {
    e.preventDefault();
    saveEditTask(milestoneId, taskId);
  };

  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (activeMilestoneId) {
      saveNewTask(activeMilestoneId);
    } else if (editingTaskId) {
      const milestone = goal.milestones.find(m => m.tasks.some(t => t.id === editingTaskId));
      if (milestone) {
        saveEditTask(milestone.id, editingTaskId);
      } else {
        setEditingTaskId(null);
      }
    }
  };

  const getDateStatusClass = (dateString) => {
    if (!dateString) return '';
    const taskDate = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0,0,0,0);
    
    if (taskDate < today) return 'past';
    if (taskDate > today) return 'future';
    return 'today';
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

  const formatNumberWithCommas = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const clean = val.toString().replace(/[^0-9]/g, '');
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div className="goal-detail-view safe-area animate-fade-in">
      <div className={`detail-top-nav ${isScrolled ? 'scrolled' : ''}`}>
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

        {(goal.metrics || []).length > 0 && (
          <div className="metrics-list-row">
            {(goal.metrics || []).map(m => (
              <div 
                key={m.id} 
                className="metric-badge-item glass-card"
                onClick={() => {
                  setActiveLogMetric(m);
                  setLogForm(prev => ({ ...prev, value: 1 }));
                }}
                style={{ cursor: 'pointer' }}
              >
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
                <button className="add-small-btn" style={{ margin: 0 }}>+</button>
              </div>
            ))}
          </div>
        )}
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
            <form className="inline-add glass-card" onSubmit={handleAddMilestone} style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch' }}>
              <input 
                autoFocus
                placeholder="Enter milestone..." 
                value={newMilestoneTitle}
                onChange={e => setNewMilestoneTitle(e.target.value)}
                style={{ width: '100%', marginBottom: 0 }}
              />
              <div className="form-group" style={{ marginBottom: 0 }}>
                <select 
                  value={newMilestonePriority} 
                  onChange={e => setNewMilestonePriority(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.9rem' }}
                >
                  <option value="Low">Low Priority 🔵</option>
                  <option value="Medium">Medium Priority 🟡</option>
                  <option value="High">High Priority 🔴</option>
                </select>
              </div>
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
                    <button 
                      className={`toggle-collapse-btn ${collapsedMilestones[ms.id] ? 'collapsed' : ''}`} 
                      onClick={() => toggleMilestoneCollapse(ms.id)}
                      title={collapsedMilestones[ms.id] ? "Expand" : "Collapse"}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: collapsedMilestones[ms.id] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {!collapsedMilestones[ms.id] && (
                    <div className="tasks-list">
                      {[...ms.tasks].sort((a, b) => {
                        if (a.completed !== b.completed) return a.completed ? 1 : -1;
                        if (a.scheduledDate && b.scheduledDate) return a.scheduledDate.localeCompare(b.scheduledDate);
                        if (a.scheduledDate) return -1;
                        if (b.scheduledDate) return 1;
                        return 0;
                      }).map(task => (
                        <div key={task.id} className="task-row">
                          <div 
                            className={`task-item ${task.completed ? 'completed' : ''}`}
                            onClick={() => toggleTask(goal.id, ms.id, task.id)}
                          >
                            <div className={`check-circle ${task.completed ? 'completed' : ''}`}></div>
                            <span>{task.title}</span>
                            {task.scheduledDate && (
                              <span className={`task-date-badge ${getDateStatusClass(task.scheduledDate)}`}>
                                {task.scheduledDate.split('-').slice(1).join('/')}
                              </span>
                            )}
                          </div>
                          <div className="task-actions">
                            <button className="edit-task-btn" onClick={(e) => {
                              e.stopPropagation();
                              setTaskForm({ title: task.title, value: task.value.toString(), scheduledDate: task.scheduledDate || '' });
                              setEditingTaskId(task.id);
                              setActiveMilestoneId(null);
                            }} title="Edit Task">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'translateY(1px)' }}>
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                              </svg>
                            </button>
                            {task.value > 0 && <span className="task-value">{task.value.toLocaleString()}</span>}
                            <button className="delete-task-btn" onClick={(e) => { e.stopPropagation(); deleteTask(goal.id, ms.id, task.id); }} title="Delete Task">&times;</button>
                          </div>
                        </div>
                      ))}
                      
                      <button className="add-task-placeholder" onClick={() => { setTaskForm({ title: '', value: '', scheduledDate: new Date().toISOString().split('T')[0] }); setActiveMilestoneId(ms.id); setEditingTaskId(null); }}>
                        + Add a task
                      </button>
                    </div>
                  )}
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

      {(activeMilestoneId || editingTaskId) && (
        <div className="modal-overlay glass" onClick={() => { setActiveMilestoneId(null); setEditingTaskId(null); }}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header-with-title">
              <h2>{editingTaskId ? 'Edit Task' : 'Add Task'}</h2>
              <button className="close-btn" onClick={() => { setActiveMilestoneId(null); setEditingTaskId(null); }}>&times;</button>
            </div>
            <form onSubmit={handleTaskSubmit} className="expanded-form">
              <div className="form-group">
                <label>Task Title</label>
                <input 
                  autoFocus
                  type="text"
                  placeholder="e.g. Call client"
                  value={taskForm.title}
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                  className="modal-input"
                  required
                />
              </div>
              <div className="form-row task-modal-row">
                <div className="form-group">
                  <label>Value (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. 100"
                    value={formatNumberWithCommas(taskForm.value)}
                    onChange={e => {
                      const clean = e.target.value.replace(/[^0-9]/g, '');
                      setTaskForm({ ...taskForm, value: clean });
                    }}
                    className="modal-input"
                  />
                </div>
                <div className="form-group">
                  <label>Schedule Date</label>
                  <input 
                    type="date"
                    value={taskForm.scheduledDate || ''}
                    onChange={e => setTaskForm({ ...taskForm, scheduledDate: e.target.value })}
                    className="modal-input"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setActiveMilestoneId(null); setEditingTaskId(null); }}>Cancel</button>
                <button type="submit" className="btn-primary">{editingTaskId ? 'Save Changes' : 'Add Task'}</button>
              </div>
            </form>
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
                  value={formatNumberWithCommas(editForm.targetNumber)}
                  onChange={e => {
                    const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                    setEditForm({ ...editForm, targetNumber: cleanVal });
                  }}
                  className="modal-input"
                  placeholder="e.g. 500,000,000"
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
            <div className="modal-header-with-title">
              <h2>{activeLogMetric.title} Log</h2>
              <button className="close-btn" onClick={() => setActiveLogMetric(null)}>&times;</button>
            </div>

            <h3>Add Entry</h3>
            <form onSubmit={handleAddMetricEntry} className="expanded-form">
              <div className="form-group">
                <label>Description</label>
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
                  <label>Value</label>
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
                <button type="submit" className="btn-primary">Add Row</button>
              </div>
            </form>

            <hr className="modal-divider" />

            {/* Log History in Modal */}
            <div className="modal-history-section">
              <h3>History</h3>
              {(activeLogMetric.entries || []).length === 0 ? (
                <p className="empty-substate">No entries logged yet.</p>
              ) : (
                <div className="history-list-scrollbox">
                  {(activeLogMetric.entries || []).map(entry => (
                    editingEntryId === entry.id ? (
                      <form key={entry.id} className="history-log-item editing-row" onSubmit={(e) => handleEditEntrySave(e, activeLogMetric.id, entry.id)}>
                        <input 
                          className="edit-log-date" 
                          type="date"
                          value={editEntryForm.date} 
                          onChange={e => setEditEntryForm({ ...editEntryForm, date: e.target.value })} 
                        />
                        <input 
                          className="edit-log-text" 
                          value={editEntryForm.text} 
                          onChange={e => setEditEntryForm({ ...editEntryForm, text: e.target.value })} 
                        />
                        <input 
                          className="edit-log-value" 
                          type="number" 
                          value={editEntryForm.value} 
                          onChange={e => setEditEntryForm({ ...editEntryForm, value: parseFloat(e.target.value) || 0 })} 
                        />
                        <div className="log-actions">
                          <button type="submit" className="save-edit-btn">✓</button>
                          <button type="button" className="save-edit-btn cancel" onClick={() => setEditingEntryId(null)}>&times;</button>
                        </div>
                      </form>
                    ) : (
                      <div key={entry.id} className="history-log-item">
                        <span className="log-date">{entry.date.split('-').slice(1).join('/')}</span>
                        <span className="log-text">{entry.text}</span>
                        <div className="log-value-group">
                          <span className="log-value">+{entry.value}</span>
                          <div className="log-actions">
                            <button className="edit-task-btn" onClick={() => {
                              setEditingEntryId(entry.id);
                              setEditEntryForm({ text: entry.text, date: entry.date, value: entry.value });
                            }} title="Edit Entry">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                              </svg>
                            </button>
                            <button className="delete-task-btn" onClick={() => deleteMetricEntry(goal.id, activeLogMetric.id, entry.id)} title="Delete Entry">&times;</button>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalDetailView;
