import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import './GoalDetailView.css';
import MilestoneTimeline from './MilestoneTimeline';

const GoalDetailView = ({ goal, onBack }) => {
  const { addMilestone, addTask, toggleTask, deleteTask, updateTask, updateGoal, deleteGoal, addMetric, updateMetricValue, addMetricEntry, deleteMetricEntry, updateMetricEntry, selectedMilestoneId, setSelectedMilestoneId, previousTab, setPreviousTab, setActiveTab: setGlobalActiveTab, setActiveActionsSubTab, toggleMilestoneActive, toggleOneThing, toggleMilestoneCompleted, logGoalProgress, pillars } = useStore();
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
  const allMilestones = goal.milestones || [];
  const completedMilestones = allMilestones.filter(m => m.completed && (m.tasks || []).every(t => t.completed));
  const milestoneCount = allMilestones.length;
  const completedMilestoneCount = completedMilestones.length;

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
    window.scrollTo(0, 0); // Reset scroll to top when page opens
    
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

  const pillarColors = {
    personal: '#10b981',
    wealth: '#f49d0d',
    growth: '#6366f1'
  };
  const themeColor = pillarColors[goal.pillarId] || '#0d9488';
  const themeColorFaint = themeColor + '14'; // ~8% opacity

  const reallyCompletedMilestones = (goal.milestones || []).filter(m => m.completed && (m.tasks || []).every(t => t.completed));

  return (
    <div className="goal-detail-view animate-fade-in" style={{ '--pillar-color': themeColor, '--pillar-color-faint': themeColorFaint }}>
      <div className="detail-top-nav-inline">
        <div className="nav-left">
          <button className="minimal-back-btn" onClick={handleBack}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
            <span className="breadcrumb-title">
              {pillars.find(p => p.id === goal.pillarId)?.title || 'Goals'}
            </span>
          </button>
        </div>
        <div className="nav-actions">
          <button className="minimal-icon-btn action-add-ms" onClick={() => setIsAddingMilestone(true)} title="Add Milestone">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
          </button>
          <button className="minimal-icon-btn" onClick={() => setIsEditingGoal(true)} title="Edit Goal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </button>
          <button className="minimal-icon-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
          </button>
        </div>
      </div>

      <div className="detail-header-new">
        <h1 className="goal-title-new">{goal.title}</h1>

        {hasTarget ? (
          <div className="overall-progress-new">
            <div className="op-text">
              <span className="op-label">Overall progress</span>
              <span className="op-summary">
                <span className="op-percent">{progressPercent}%</span> <span className="op-divider">·</span> {reallyCompletedMilestones.length} / {goal.milestones.length} milestones
              </span>
            </div>
            <div className="op-bar-container">
               <div className="op-bar-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        ) : (
          <div className="milestones-only-progress">
             <div className="mop-row">
                <div className="mop-bar-container">
                   <div className="mop-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <div className="mop-status-inline">
                   <span className="mop-count">{reallyCompletedMilestones.length} / {goal.milestones.length}</span>
                   <span className="mop-label">milestones</span>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="section-divider"></div>

      <div className="milestones-section-new">
        {isAddingMilestone && (
          <div className="quick-add-milestone-form animate-fade-in" style={{ marginBottom: '20px', padding: '16px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
            <form onSubmit={handleAddMilestone} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                autoFocus
                placeholder="Name this milestone..."
                value={newMilestoneTitle}
                onChange={e => setNewMilestoneTitle(e.target.value)}
                style={{ width: '100%', padding: '10px 0', border: 'none', borderBottom: '1px solid #e2e8f0', fontSize: '16px', outline: 'none', background: 'transparent', color: '#0f172a', fontWeight: 700 }}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <select
                  value={newMilestonePriority}
                  onChange={e => setNewMilestonePriority(e.target.value)}
                  style={{ border: 'none', background: 'transparent', fontSize: '14px', color: '#64748b', outline: 'none', fontWeight: 600 }}
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button type="button" onClick={() => setIsAddingMilestone(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ background: 'none', border: 'none', color: '#0f172a', fontWeight: 800, fontSize: '14px', cursor: 'pointer' }}>Add Milestone</button>
                </div>
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
          onToggleFocus={(msId, currentVal) => toggleMilestoneActive(goal.id, msId)}
          onToggleOneThing={(msId) => toggleOneThing(goal.id, msId)}
        />

        {goal.note && (
          <div className="goal-note-card">
            <label>Note</label>
            <p>{goal.note}</p>
          </div>
        )}
      </div>

      {isEditingGoal && (
        <div className="modal-overlay glass" onClick={() => setIsEditingGoal(false)}>
          <div className="modal-content glass-card animate-pop-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header-modern">
               <h2>Edit Goal</h2>
               <button className="modal-close-icon" onClick={() => setIsEditingGoal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleUpdateGoal} className="modal-form-v2">
              <div className="form-group-v2">
                <label>Achievement Pillar</label>
                <select
                  value={editForm.pillarId || 'personal'}
                  onChange={e => setEditForm({ ...editForm, pillarId: e.target.value })}
                  className="modal-select-v2"
                >
                  {pillars.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="form-group-v2">
                <label>Goal Name</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="modal-input-v2"
                  required
                />
              </div>

              <div className="form-group-v2">
                <label>Note</label>
                <textarea
                  value={editForm.note}
                  onChange={e => setEditForm({ ...editForm, note: e.target.value })}
                  className="modal-textarea-v2"
                  rows="2"
                />
              </div>

              <div className="timeline-grid">
                <div className="form-group-v2">
                  <label>Start</label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={e => setEditForm({ ...editForm, startDate: e.target.value })}
                    className="modal-input-v2"
                  />
                </div>
                <div className="form-group-v2">
                  <label>End</label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={e => setEditForm({ ...editForm, endDate: e.target.value })}
                    className="modal-input-v2"
                  />
                </div>
              </div>

              <div className="modal-footer-v2">
                <button type="button" className="btn-cancel-v2" onClick={handleDeleteGoal} style={{ color: '#dc2626', borderColor: '#fee2e2' }}>Delete Goal</button>
                <div style={{ flex: 1 }}></div>
                <button type="submit" className="btn-create-v2">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!isAddingMilestone && !isEditingGoal && (
        <button 
          className="fab-add-milestone" 
          onClick={() => setIsAddingMilestone(true)}
          aria-label="Add Milestone"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      )}
    </div>
  );
};

export default GoalDetailView;
