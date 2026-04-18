import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import './GoalDetailView.css';
import MilestoneTimeline from './MilestoneTimeline';

const GoalDetailView = ({ goal, onBack }) => {
  const { addMilestone, addTask, toggleTask, deleteTask, updateTask, updateGoal, deleteGoal, addMetric, updateMetricValue, addMetricEntry, deleteMetricEntry, updateMetricEntry, selectedMilestoneId, setSelectedMilestoneId, previousTab, setPreviousTab, setActiveTab: setGlobalActiveTab, setActiveActionsSubTab, toggleMilestoneActive, toggleMilestoneCompleted, logGoalProgress, pillars } = useStore();
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: goal.title,
    note: goal.note || '',
    startDate: goal.startDate || '',
    endDate: goal.endDate || '',
    targetNumber: goal.targetNumber || '',
    pillarId: goal.pillarId || 'personal',
    defaultMilestoneId: goal.defaultMilestoneId || ''
  });
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestonePriority, setNewMilestonePriority] = useState('Low');

  const [activeMilestoneId, setActiveMilestoneId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', value: '', scheduledDate: new Date().toISOString().split('T')[0] + 'T09:00', priority: 'Low', subtasks: [] });
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const [editingMilestoneId, setEditingMilestoneId] = useState(null);
  const [msEditForm, setMsEditForm] = useState({ title: '', priority: 'Low' });

  const { updateMilestone, deleteMilestone } = useStore();

  const handleBack = () => {
    setSelectedMilestoneId(null);
    if (previousTab) {
      setGlobalActiveTab(previousTab);
      setPreviousTab(null);
    } else {
      onBack();
    }
  };
  const [activeTab, setActiveTab] = useState('Milestones'); // 'Milestones' or 'Results'
  const [expandedCompletedResults, setExpandedCompletedResults] = useState({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'manual'

  // Milestone highlight flash logic removed to support dedicated Milestone Detail pages
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

  const toggleCompletedResults = (id) => {
    setExpandedCompletedResults(prev => ({ ...prev, [id]: !prev[id] }));
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
      const priorityToUse = taskForm.priority || (milestone ? milestone.priority : 'Low');

      addTask(
        goal.id,
        milestoneId,
        taskForm.title,
        numericValue,
        taskForm.scheduledDate,
        priorityToUse,
        crypto.randomUUID(),
        null,
        {},
        taskForm.subtasks || []
      );
      setTaskForm({ title: '', value: '', scheduledDate: new Date().toISOString().split('T')[0] + 'T09:00', priority: 'Low', subtasks: [] });
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
        scheduledDate: taskForm.scheduledDate,
        priority: taskForm.priority || 'Low',
        subtasks: taskForm.subtasks || []
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

  const formatCompactNumber = (number) => {
    if (number === 0) return '0';
    if (!number) return '';
    const formatter = Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
    return formatter.format(number);
  };

  const getRemainingTime = (endDate) => {
    if (!endDate) return 'No deadline';
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
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

  const handleOpenEditMs = (e, ms) => {
    e.stopPropagation();
    setMsEditForm({ title: ms.title, priority: ms.priority || 'Low' });
    setEditingMilestoneId(ms.id);
  };

  const handleSaveMsEdit = (e) => {
    e.preventDefault();
    updateMilestone(goal.id, editingMilestoneId, msEditForm);
    setEditingMilestoneId(null);
  };
  const handleDeleteMs = () => {
    if (window.confirm("Are you sure you want to delete this milestone? All results within it will be removed.")) {
      deleteMilestone(goal.id, editingMilestoneId);
      setEditingMilestoneId(null);
    }
  };

  const [msFilter, setMsFilter] = useState('Active');

  const filteredMilestones = (goal.milestones || []).filter(ms => {
    if (msFilter === 'All') return true;
    if (msFilter === 'Active') return !ms.completed;
    if (msFilter === 'Completed') return ms.completed;
    return true;
  });

  // Progress Calculations
  const allTasksRaw = (goal.milestones || []).flatMap(ms => ms.tasks || []);
  const completedTasks = allTasksRaw.filter(t => t.completed);

  const allTasks = [...allTasksRaw].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(a.scheduledDate || 0);
      const dateB = new Date(b.scheduledDate || 0);
      return dateB - dateA; // Descending order (newest first)
    }
    return 0; // Manual/default order
  });

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
    <div className="goal-detail-view animate-fade-in">
      <div className="unified-goal-card">
        <div className={`detail-top-nav-inline`}>
          <div className="nav-left">
            <button className="minimal-back-btn" onClick={handleBack} style={{ gap: '4px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
              <span className="breadcrumb-title">
                {pillars.find(p => p.id === goal.pillarId)?.title || 'Wealth & career'}
              </span>
            </button>
          </div>
          <div className="nav-actions">
            <button className="minimal-icon-btn" onClick={() => setIsEditingGoal(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            </button>
            <button className="minimal-icon-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
            </button>
          </div>
        </div>

      <div className="detail-header-new">
        <div className="pillar-badge-new">
          <span className="dot"></span>
          {pillars.find(p => p.id === goal.pillarId)?.title || 'Wealth & career'} · {goal.endDate ? new Date(goal.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'No Date'}
        </div>
        
        <h1 className="goal-title-new">{goal.title}</h1>

        {hasTarget ? (
          <div className="overall-progress-new" style={{ marginTop: '24px' }}>
            <div className="op-text">
              <span className="op-label">Overall progress</span>
              <span className="op-summary">
                <span className="op-percent">{progressPercent}%</span> · {goal.milestones.filter(m => m.completed).length} of {goal.milestones.length} milestones done
              </span>
            </div>
            <div className="op-bar-container">
               <div className="op-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        ) : (
          <div className="milestones-only-progress" style={{ marginTop: '24px', marginBottom: '8px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1, height: '4px', background: '#f5f4ef', borderRadius: '10px' }}>
                   <div style={{ width: `${progressPercent}%`, height: '100%', background: '#d97706', borderRadius: '10px' }}></div>
                </div>
                <div style={{ color: '#d97706', fontWeight: 700, fontSize: '0.95rem' }}>
                   {goal.milestones.filter(m=>m.completed).length} of {goal.milestones.length}
                </div>
             </div>
             <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px' }}>milestones completed</div>
          </div>
        )}
      </div>

      <div className="section-divider"></div>

      {activeTab === 'Milestones' ? (
        <div className="milestones-section-new">

          {isAddingMilestone && (
            <div style={{ padding: '0 16px' }}>
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
            </div>
          )}

          <MilestoneTimeline 
            goal={goal}
            onMilestoneClick={(id) => setSelectedMilestoneId(id)}
            onToggleComplete={(id) => toggleMilestoneCompleted(goal.id, id)}
            onAddTask={(msId) => {
              setTaskForm({ title: '', value: '', scheduledDate: new Date().toISOString().split('T')[0] + 'T09:00', priority: 'Low', subtasks: [] });
              setActiveMilestoneId(msId);
            }}
            onToggleTask={toggleTask}
          />

          <button className="add-ms-row-btn" onClick={() => setIsAddingMilestone(true)}>
             <span>+</span> Add milestone
          </button>

          {goal.note && (
            <div className="goal-note-card">
              <label>GOAL NOTE</label>
              <p>"{goal.note}"</p>
            </div>
          )}
        </div>
      ) : (
        <div className="tasks-section">
          <div className="section-header-v2" style={{ alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>All Results</h2>
            <button
              className="ms-filter-btn active"
              onClick={() => setSortBy(sortBy === 'date' ? 'manual' : 'date')}
              style={{ marginLeft: 'auto', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}
            >
              {sortBy === 'date' ? '📅 Sorted by Date' : '🔄 Manual Order'}
            </button>
          </div>

          <div className="tasks-list-flat">
            {allTasks.length === 0 ? (
              <p className="empty-substate">No results created yet.</p>
            ) : (
              allTasks.reduce((acc, task, idx, arr) => {
                const currentDate = task.scheduledDate ? task.scheduledDate.split('T')[0] : 'No Date';
                const prevDate = idx > 0 && arr[idx - 1].scheduledDate ? arr[idx - 1].scheduledDate.split('T')[0] : (idx > 0 ? 'No Date' : null);

                if (sortBy === 'date' && currentDate !== prevDate) {
                  acc.push(
                    <div key={`date-header-${currentDate}`} style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', padding: '12px 0 4px 4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {currentDate === 'No Date' ? 'No Date Set' : new Date(currentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  );
                }

                const milestone = goal.milestones.find(m => m.tasks.some(t => t.id === task.id));
                acc.push(
                  <div
                    key={task.id}
                    className="task-row card-style"
                    style={{ marginBottom: '8px' }}
                    onClick={() => {
                      if (milestone) {
                        setTaskForm({ title: task.title, value: task.value.toString(), scheduledDate: task.scheduledDate || '', priority: task.priority || 'Low', subtasks: task.subtasks || [] });
                        setEditingTaskId(task.id);
                        setActiveMilestoneId(null);
                      }
                    }}
                  >
                    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
                      <span style={{ fontWeight: 600, flex: 1 }}>{task.title}</span>
                      {task.scheduledDate && sortBy !== 'date' && (
                        <span className={`task-date-badge ${getDateStatusClass(task.scheduledDate)}`}>
                          {formatDateMMM(task.scheduledDate)}
                        </span>
                      )}
                    </div>
                  </div>
                );
                return acc;
              }, [])
            )}
          </div>
        </div>
      )}

      {editingTaskId && (
        <div className="modal-overlay glass" onClick={() => { setActiveMilestoneId(null); setEditingTaskId(null); }}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header-with-title">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', flex: 1 }}>{taskForm.title}</h2>
              <button className="close-btn" onClick={() => { setActiveMilestoneId(null); setEditingTaskId(null); }}>&times;</button>
            </div>

            <div className="modal-tactical-header" style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  📅 {formatDateMMM(taskForm.scheduledDate)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  🎯 {taskForm.priority || 'Low'} Priority
                </span>
              </div>
            </div>

            <div className="subtasks-section">
              <label style={{ fontWeight: 800, color: '#0f172a', marginBottom: '12px', display: 'block', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Tasks</label>
              <div className="subtasks-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto', marginBottom: '24px' }}>
                <div className="subtask-item-form" style={{ display: 'grid', gridTemplateColumns: '1fr 140px auto', gap: '10px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <input
                    type="text"
                    placeholder="Add a daily task..."
                    value={newSubtaskTitle || ''}
                    onChange={e => setNewSubtaskTitle(e.target.value)}
                    style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', fontWeight: 500 }}
                  />
                  <input
                    type="date"
                    className="subtask-date-input"
                    style={{ border: 'none', background: 'transparent', fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}
                    onBlur={(e) => {
                      const dateVal = e.target.value;
                      if (newSubtaskTitle.trim()) {
                        setTaskForm(prev => ({
                          ...prev,
                          subtasks: [...(prev.subtasks || []), { id: crypto.randomUUID(), title: newSubtaskTitle, completed: false, scheduledDate: dateVal }]
                        }));
                        setNewSubtaskTitle('');
                        e.target.value = '';
                      }
                    }}
                  />
                </div>

                {(taskForm.subtasks || []).map((sub, idx) => (
                  <div key={sub.id} className="subtask-item" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 100px auto', alignItems: 'center', gap: '12px', padding: '12px', background: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => {
                        setTaskForm(prev => ({
                          ...prev,
                          subtasks: prev.subtasks.map((s, i) => i === idx ? { ...s, completed: !s.completed } : s)
                        }));
                      }}
                      style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: '#0d9488' }}
                    />
                    <input
                      type="text"
                      value={sub.title}
                      onChange={(e) => {
                        const newTitle = e.target.value;
                        setTaskForm(prev => ({
                          ...prev,
                          subtasks: prev.subtasks.map((s, i) => i === idx ? { ...s, title: newTitle } : s)
                        }));
                      }}
                      style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}
                    />
                    <input
                      type="date"
                      value={sub.scheduledDate || ''}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setTaskForm(prev => ({
                          ...prev,
                          subtasks: prev.subtasks.map((s, i) => i === idx ? { ...s, scheduledDate: newDate } : s)
                        }));
                      }}
                      style={{ border: 'none', background: 'transparent', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}
                    />
                    <button type="button" onClick={() => {
                      setTaskForm(prev => ({
                        ...prev,
                        subtasks: prev.subtasks.filter((_, i) => i !== idx)
                      }));
                    }} style={{ color: '#94a3b8', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}>&times;</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-actions" style={{ marginTop: '0', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <button type="button" className="btn-secondary" style={{ width: '100%', py: '12px' }} onClick={() => {
                if (editingTaskId) {
                  const milestone = goal.milestones.find(m => m.tasks.some(t => t.id === editingTaskId));
                  if (milestone) saveEditTask(milestone.id, editingTaskId);
                }
                setActiveMilestoneId(null);
                setEditingTaskId(null);
              }}>Done</button>
            </div>
          </div>
        </div>
      )}

      {isEditingGoal && (
        <div className="modal-overlay glass" onClick={() => setIsEditingGoal(false)}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2>Edit Goal</h2>
            <form onSubmit={handleUpdateGoal} className="expanded-form">
              <div className="form-group">
                <label>Achievement Pillar</label>
                <select
                  value={editForm.pillarId || 'personal'}
                  onChange={e => setEditForm({ ...editForm, pillarId: e.target.value })}
                  className="modal-input"
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b' }}
                >
                  {pillars.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
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

              <div className="form-group">
                <label>Quick Update Destination</label>
                <div className="form-helper" style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px' }}>Where should '+' button updates go?</div>
                <select
                  value={editForm.defaultMilestoneId}
                  onChange={e => setEditForm({...editForm, defaultMilestoneId: e.target.value})}
                  className="modal-input"
                  style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b' }}
                >
                  <option value="">Automatic (General Progress)</option>
                  {(goal.milestones || []).map(ms => (
                    <option key={ms.id} value={ms.id}>{ms.title}</option>
                  ))}
                </select>
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

      {editingMilestoneId && (
        <div className="modal-overlay glass" onClick={() => setEditingMilestoneId(null)}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header-with-title">
              <h2>Edit Milestone</h2>
              <button className="close-btn" onClick={() => setEditingMilestoneId(null)}>&times;</button>
            </div>

            <form onSubmit={handleSaveMsEdit} className="expanded-form">
              <div className="form-group">
                <label>Milestone Title</label>
                <input
                  autoFocus
                  type="text"
                  value={msEditForm.title}
                  onChange={e => setMsEditForm({ ...msEditForm, title: e.target.value })}
                  className="modal-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={msEditForm.priority}
                  onChange={e => setMsEditForm({ ...msEditForm, priority: e.target.value })}
                  className="modal-input"
                >
                  <option value="Low">Low Priority 🔵</option>
                  <option value="Medium">Medium Priority 🟡</option>
                  <option value="High">High Priority 🔴</option>
                </select>
              </div>
              <div className="modal-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="btn-danger" onClick={handleDeleteMs}>Delete Milestone</button>
                <div style={{ flex: 1 }}></div>
                <button type="button" className="btn-secondary" onClick={() => setEditingMilestoneId(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default GoalDetailView;
