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
  const [expandedCompletedResults, setExpandedCompletedResults] = useState({});
  const [isMetricsCollapsed, setIsMetricsCollapsed] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'manual'
  const [isQuickLog, setIsQuickLog] = useState(false);
  const [quickLogForm, setQuickLogForm] = useState({ 
    amount: '', 
    note: '',
    date: new Date().toISOString().split('T')[0]
  });

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

  const toggleMilestoneCollapse = (id) => {
    setCollapsedMilestones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCompletedResults = (id) => {
    setExpandedCompletedResults(prev => ({ ...prev, [id]: !prev[id] }));
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

  const formatDateMMM = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    } catch (e) {
      return dateString;
    }
  };

  const getDateStatusClass = (dateString) => {
    if (!dateString) return '';
    const taskDate = new Date(dateString); // Simplified for general status
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
    <div className="goal-detail-view safe-area animate-fade-in">
      <div className={`detail-top-nav ${isScrolled ? 'scrolled' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="back-btn-icon" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div className="pillar-context" style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
            {pillars.find(p => p.id === goal.pillarId)?.title || 'Goal'}
          </div>
        </div>
        <div className="nav-actions">
          <button className="icon-btn" onClick={() => setIsEditingGoal(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
          </button>
          <button className="icon-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg></button>
        </div>
      </div>

      <div className="detail-header-v2">
        <div className="title-section-v2">
          <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>{goal.title}</h1>
        </div>
        <div className="header-meta-v3" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 600 }}>
          <span className="active-badge" style={{ color: '#10b981', background: '#ecfdf5', padding: '2px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>Active</span>
          <span className="summary-stats" style={{ color: '#64748b' }}>
            {progressPercent}% · {goal.milestones.filter(m => m.completed).length} of {goal.milestones.length} steps done
          </span>
        </div>
      </div>

      {goal.targetNumber && (
        <div className="numeric-progress-v2">
          <div className="numeric-header-row">
            <div className="progress-label-v2">OVERALL PROGRESS</div>
            <button className="quick-log-btn-v2" onClick={() => setIsQuickLog(!isQuickLog)} title="Quick log progress">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
          
          <div className="progress-values-v2">
            <span className="current-val-v2">{currentVal.toLocaleString()}</span>
            <span className="target-val-v2">/ {targetVal.toLocaleString()} TZS</span>
          </div>

          {!isQuickLog && (
            <div className="progress-track-v2">
              <div className="progress-fill-v2" style={{ width: `${progressPercent}%` }}></div>
            </div>
          )}

          <div className="progress-summary-v2">{progressPercent}% complete</div>

          {isQuickLog && (
            <form className="detail-quick-log-form animate-fade-in" onSubmit={(e) => {
              e.preventDefault();
              if (quickLogForm.amount) {
                logGoalProgress(goal.id, quickLogForm.amount, quickLogForm.note, quickLogForm.date);
                setIsQuickLog(false);
                setQuickLogForm({ amount: '', note: '', date: new Date().toISOString().split('T')[0] });
              }
            }}>
              <div className="quick-log-grid">
                <input 
                  autoFocus
                  type="number"
                  placeholder="Amount"
                  value={quickLogForm.amount}
                  onChange={e => setQuickLogForm({...quickLogForm, amount: e.target.value})}
                />
                <input 
                  placeholder="What happened?"
                  value={quickLogForm.note}
                  onChange={e => setQuickLogForm({...quickLogForm, note: e.target.value})}
                />
                <div className="quick-log-date-wrapper">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <input 
                    type="date" 
                    value={quickLogForm.date} 
                    onChange={e => setQuickLogForm({...quickLogForm, date: e.target.value})}
                  />
                  <span>{quickLogForm.date === new Date().toISOString().split('T')[0] ? 'Today' : quickLogForm.date}</span>
                </div>
              </div>

              <div className="quick-log-footer">
                <button type="button" onClick={() => setIsQuickLog(false)}>Cancel</button>
                <button type="submit" className="save-btn">Log Progress</button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Sub-Metrics Section */}
      <div className="metrics-rack-v2">
        <div
          className="section-header-v2"
          onClick={() => setIsMetricsCollapsed(!isMetricsCollapsed)}
          style={{ cursor: 'pointer' }}
        >
          <h2>Tracking metrics</h2>
          <div className="section-header-actions">
            <svg
              className={`collapse-chevron ${isMetricsCollapsed ? 'collapsed' : ''}`}
              width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ transform: isMetricsCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginRight: '10px' }}
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
            <button className="add-small-btn" onClick={(e) => { e.stopPropagation(); setIsAddingMetric(!isAddingMetric); }}>+</button>
          </div>
        </div>

        {!isMetricsCollapsed && (
          <div className="metrics-body-v2 animate-fade-in">
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
              <div className="metrics-grid-v2">
                {(goal.metrics || []).map((m, idx) => (
                  <div
                    key={m.id}
                    className={`metric-card-v2 ${idx % 2 === 0 ? 'accent-blue' : 'accent-purple'}`}
                    onClick={() => {
                      setActiveLogMetric(m);
                      setLogForm(prev => ({ ...prev, value: 1 }));
                    }}
                  >
                    <div className="metric-icon-pulse">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3v18h18" />
                        <polyline points="7 16 11 12 16 14 19 8" />
                      </svg>
                    </div>
                    <div className="metric-card-info">
                      <span className="metric-card-title">{m.name}</span>
                      <div className="metric-card-values">
                        <span className="v-current">{m.currentValue.toLocaleString()}</span>
                        <span className="v-target"> / {m.targetValue.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="metric-mini-progress">
                      <div className="mini-fill" style={{ width: `${Math.min((m.currentValue / m.targetValue) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
          className={`tab-btn ${activeTab === 'Results' ? 'active' : ''}`}
          onClick={() => setActiveTab('Results')}
        >
          Results
        </button>
      </div>

      {activeTab === 'Milestones' ? (
        <div className="milestones-section-v2">
          <div className="section-header-v2" style={{ alignItems: 'center', marginBottom: '10px', padding: '0 16px' }}>
            <h2 style={{ margin: 0 }}>Milestones</h2>
            <button className="add-small-btn" onClick={() => setIsAddingMilestone(true)}>+</button>
          </div>

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
  );
};

export default GoalDetailView;
