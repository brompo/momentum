import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import './GoalDetailView.css';

const GoalDetailView = ({ goal, onBack }) => {
  const { addMilestone, addTask, toggleTask, deleteTask, updateTask, updateGoal, deleteGoal, addMetric, updateMetricValue, addMetricEntry, deleteMetricEntry, updateMetricEntry, selectedMilestoneId, setSelectedMilestoneId, previousTab, setPreviousTab, setActiveTab: setGlobalActiveTab, setActiveActionsSubTab, toggleMilestoneActive, toggleMilestoneCompleted, pillars } = useStore();
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editForm, setEditForm] = useState({
    title: goal.title,
    note: goal.note || '',
    startDate: goal.startDate || '',
    endDate: goal.endDate || '',
    targetNumber: goal.targetNumber || '',
    pillarId: goal.pillarId || 'personal'
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

  useEffect(() => {
    if (selectedMilestoneId) {
      setTimeout(() => {
        const element = document.getElementById(`milestone-${selectedMilestoneId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-flash');

          // Re-add Cleanup timeout matching 4.5s CSS animation
          setTimeout(() => {
            element.classList.remove('highlight-flash');
            setSelectedMilestoneId(null);
          }, 4500);
        }
      }, 300);
    }
  }, [selectedMilestoneId, setSelectedMilestoneId]);
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
          <button className="back-btn-icon" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div className="nav-actions">
            <button className="icon-btn" onClick={() => setIsEditingGoal(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
            </button>
            <button className="icon-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg></button>
          </div>
        </div>

        <div className="detail-header-v2">
          <div className="header-meta-v2">
            <div className="active-goal-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              Active goal
            </div>
            <span className="deadline-tag-v2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              {goal.endDate || 'Sept 30, 2026'}
            </span>
          </div>
          <div className="title-section-v2">
            <h1>{goal.title}</h1>
          </div>
        </div>

        {goal.targetNumber && (
          <div className="numeric-progress-v2">
            <div className="progress-label-v2">OVERALL PROGRESS</div>
            <div className="progress-values-v2">
              <span className="current-val-v2">{(currentVal / 1000000).toLocaleString()}M</span>
              <span className="target-val-v2">/ {(targetVal / 1000000).toLocaleString()}M TZS</span>
            </div>
            <div className="progress-track-v2">
              <div className="progress-fill-v2" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="progress-summary-v2">{progressPercent}% complete</div>
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
            <div className="section-header-v2" style={{ alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0 }}>{goal.milestones.length} milestones</h2>

              <div className="small-filter-capsule">
                <button className={`ms-filter-btn ${msFilter === 'All' ? 'active' : ''}`} onClick={() => setMsFilter('All')}>All</button>
                <button className={`ms-filter-btn ${msFilter === 'Active' ? 'active' : ''}`} onClick={() => setMsFilter('Active')}>Active</button>
                <button className={`ms-filter-btn ${msFilter === 'Completed' ? 'active' : ''}`} onClick={() => setMsFilter('Completed')}>Completed</button>
              </div>

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

            <div className="milestone-list-v2">
              {filteredMilestones.length === 0 ? (
                <p className="empty-substate">No {msFilter.toLowerCase()} milestones found.</p>
              ) : (
                filteredMilestones.map(ms => {
                  const totalR = ms.tasks.length;
                  const doneR = ms.tasks.filter(t => t.completed).length;
                  const msProgress = totalR > 0 ? (doneR / totalR) * 100 : 0;

                  return (
                    <div key={ms.id} id={`milestone-${ms.id}`} className={`ms-card-v2 ${ms.completed ? 'ms-completed' : ''}`}>
                      <div className="ms-header-v2">
                        <div className="ms-title-group-v2">
                          <div
                            className={`ms-completion-checkbox ${ms.completed ? 'checked' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleMilestoneCompleted(goal.id, ms.id); }}
                          >
                            {ms.completed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                          </div>
                          <div className="ms-title-meta" onClick={() => toggleMilestoneCollapse(ms.id)} style={{ cursor: 'pointer' }}>
                            <span className="ms-priority-tag">{(ms.priority || 'Low').toUpperCase()}</span>
                            <h3>{ms.title}</h3>
                          </div>
                          <button className="ms-edit-icon-btn" onClick={(e) => handleOpenEditMs(e, ms)}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                          </button>
                        </div>
                        <div className="ms-header-right">
                          <button
                            className={`toggle-active-btn-v2 ${ms.active ? 'is-active' : ''}`}
                            onClick={(e) => { e.stopPropagation(); toggleMilestoneActive(goal.id, ms.id); }}
                            title={ms.active ? "Hide from Milestones view" : "Show in Milestones view"}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={ms.active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                          </button>
                          <button className={`chevron-btn ${collapsedMilestones[ms.id] ? 'collapsed' : ''}`} onClick={() => toggleMilestoneCollapse(ms.id)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        </div>
                      </div>

                      <div className="ms-footer-v2">
                        <div className="ms-mini-bar">
                          <div className="ms-bar-fill" style={{ width: `${msProgress}%` }}></div>
                        </div>
                        <span className="ms-results-count">{doneR}/{totalR} results</span>
                      </div>

                      {!collapsedMilestones[ms.id] && (
                        <div className="tasks-list">
                          {/* Pending Results */}
                          {ms.tasks.filter(t => !t.completed).sort((a, b) => {
                            if (a.scheduledDate && b.scheduledDate) return a.scheduledDate.localeCompare(b.scheduledDate);
                            return 0;
                          }).map(task => (
                            <div key={task.id} className="task-row card-style">
                              <div
                                className="task-item"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTaskForm({ title: task.title, value: task.value.toString(), scheduledDate: task.scheduledDate || '', priority: task.priority || 'Low', subtasks: task.subtasks || [] });
                                  setEditingTaskId(task.id);
                                  setActiveMilestoneId(null);
                                }}
                              >
                                <span style={{ fontWeight: 500, flex: 1 }}>{task.title}</span>
                                {task.scheduledDate && (
                                  <span className={`task-date-badge ${getDateStatusClass(task.scheduledDate)}`}>
                                    {formatDateMMM(task.scheduledDate)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Completed Results Collapsible */}
                          {ms.tasks.some(t => t.completed) && (
                            <div className="completed-results-collapsible">
                              <button
                                className="view-completed-btn"
                                onClick={() => toggleCompletedResults(ms.id)}
                              >
                                {expandedCompletedResults[ms.id] ? 'Hide' : 'View'} completed results ({ms.tasks.filter(t => t.completed).length})
                              </button>

                              {expandedCompletedResults[ms.id] && (
                                <div className="completed-tasks-tray animate-fade-in" style={{ marginTop: '8px' }}>
                                  {ms.tasks.filter(t => t.completed).map(task => (
                                    <div key={task.id} className="task-row card-style completed" style={{ marginBottom: '6px' }}>
                                      <div
                                        className="task-item completed"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setTaskForm({ title: task.title, value: task.value.toString(), scheduledDate: task.scheduledDate || '', priority: task.priority || 'Low', subtasks: task.subtasks || [] });
                                          setEditingTaskId(task.id);
                                        }}
                                      >
                                        <span style={{ fontWeight: 600, flex: 1, textDecoration: 'line-through', opacity: 0.6 }}>{task.title}</span>
                                        {task.scheduledDate && (
                                          <span className="task-date-badge past" style={{ opacity: 0.5 }}>
                                            {formatDateMMM(task.scheduledDate)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {activeMilestoneId === ms.id ? (
                            <form className="inline-add-task glass-card" onSubmit={(e) => handleAddTask(e, ms.id)} style={{ marginTop: '8px' }}>
                              <div className="inline-input-wrapper-v2" style={{ position: 'relative' }}>
                                <input
                                  autoFocus
                                  placeholder="Enter result..."
                                  value={taskForm.title}
                                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Escape') setActiveMilestoneId(null);
                                  }}
                                  style={{ width: '100%', marginBottom: '8px', padding: '10px 40px 10px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white' }}
                                />
                                <div
                                  className="inline-date-trigger-v2"
                                  style={{ position: 'absolute', right: '10px', top: '10px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
                                >
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5" style={{ pointerEvents: 'none' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                  <input
                                    id={`inline-date-picker-${ms.id}`}
                                    type="date"
                                    style={{ 
                                      position: 'absolute', 
                                      top: 0, 
                                      left: 0, 
                                      width: '100%', 
                                      height: '100%', 
                                      opacity: 0, 
                                      cursor: 'pointer',
                                      fontSize: '16px' // Prevents zoom on iOS
                                    }}
                                    value={taskForm.scheduledDate?.split('T')[0] || ''}
                                    onChange={(e) => setTaskForm({ ...taskForm, scheduledDate: e.target.value + 'T09:00' })}
                                  />
                                </div>
                              </div>
                              {taskForm.scheduledDate && taskForm.scheduledDate.split('T')[0] !== new Date().toISOString().split('T')[0] && (
                                <div style={{ fontSize: '0.65rem', color: '#0d9488', fontWeight: 800, marginTop: '-6px', marginBottom: '8px', paddingLeft: '4px' }}>
                                  TARGET: {taskForm.scheduledDate.split('T')[0]}
                                </div>
                              )}
                              <div className="inline-actions" style={{ padding: '0 4px' }}>
                                <button type="button" onClick={() => setActiveMilestoneId(null)}>Cancel</button>
                                <button type="submit" className="active" style={{ color: '#0d9488', fontWeight: 800 }}>Add</button>
                              </div>
                            </form>
                          ) : (
                            <button className="add-task-placeholder" onClick={() => {
                              setTaskForm({ title: '', value: '', scheduledDate: new Date().toISOString().split('T')[0] + 'T09:00', priority: 'Low', subtasks: [] });
                              setActiveMilestoneId(ms.id);
                              setEditingTaskId(null);
                            }}>
                              + Add a result
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="tasks-section">
            <h2>All Results</h2>
            <div className="tasks-list-flat">
              {allTasks.length === 0 ? (
                <p className="empty-substate">No results created yet.</p>
              ) : (
                allTasks.map(task => {
                  const milestone = goal.milestones.find(m => m.tasks.some(t => t.id === task.id));
                  return (
                    <div
                      key={task.id}
                      className="task-row card-style"
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
                        {task.scheduledDate && (
                          <span className={`task-date-badge ${getDateStatusClass(task.scheduledDate)}`}>
                            {formatDateMMM(task.scheduledDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
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
