import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import './PriorityView.css';

const InlineOptionsCard = ({
  task,
  textareaRef,
  editTitle,
  setEditTitle,
  handleTitleBlur,
  formatDate,
  handleToggleFocusFromModal,
  handleDelete,
  getSnoozeDetails,
  handleSnooze,
  snoozeNote,
  setSnoozeNote,
  followUpTitle,
  setFollowUpTitle,
  followUpDate,
  setFollowUpDate,
  handleFollowUpSubmit,
  setSelectedTask,
  setSelectedContext,
  newActionTitle,
  setNewActionTitle,
  handleAddSubtask,
  handleToggleSubtask,
  handleDeleteSubtask
}) => {
  if (!task) return null;
  return (
    <div className="inline-options-card" onClick={(e) => e.stopPropagation()}>
      {/* Close Button top right */}
      <div className="inline-close-btn" onClick={(e) => { e.stopPropagation(); setSelectedTask(null); setSelectedContext(''); }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </div>

      <div className="options-row-top">
        <div style={{ flex: 1, paddingRight: '12px' }}>
          <textarea
            ref={textareaRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="sheet-title-input"
            rows={1}
          />
        </div>
        <div className="options-date-pill" style={{ position: 'relative' }}>
          {task.scheduledDate ? formatDate(task.scheduledDate, false).replace('due ', '') : 'No Date'} ✏️
          <input
            type="date"
            onChange={(e) => handleSnooze(e.target.value, false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0,
              cursor: 'pointer',
              zIndex: 1
            }}
          />
        </div>
      </div>

      <div className="options-row-actions">
        <div className="action-pill-card focus" onClick={handleToggleFocusFromModal}>
          <span>⚡</span> {task.isPriorityFocus ? "Remove focus" : "Focus today"}
        </div>
        <div className="action-pill-card delete" onClick={handleDelete}>
          <span>🗑️</span> Won't do
        </div>
      </div>

      <div className="options-row-snooze">
        <div className="snooze-header">Snooze To</div>
        <input
          type="text"
          className="snooze-note-input"
          placeholder="Why snooze? (optional)..."
          value={snoozeNote}
          onChange={(e) => setSnoozeNote(e.target.value)}
        />
        <div className="snooze-grid">
          <div className="snooze-bubble" onClick={() => handleSnooze(getSnoozeDetails().tomorrowDays)}>
            <span className="s-title">Tomorrow</span>
            <span className="s-date">{getSnoozeDetails().tomorrowStr}</span>
          </div>
          <div className="snooze-bubble" onClick={() => handleSnooze(getSnoozeDetails().mondayDays)}>
            <span className="s-title">Monday</span>
            <span className="s-date">{getSnoozeDetails().mondayStr}</span>
          </div>
          <div className="snooze-bubble" onClick={() => handleSnooze(getSnoozeDetails().nextWeekDays)}>
            <span className="s-title">Next week</span>
            <span className="s-date">{getSnoozeDetails().nextWeekStr}</span>
          </div>
          <div className="snooze-bubble" style={{ position: 'relative' }}>
            <span className="s-title">Pick</span>
            <span className="s-date">...</span>
            <input
              type="date"
              onChange={(e) => handleSnooze(e.target.value, false)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
          </div>
        </div>
      </div>

      <div className="options-row-followup">
        <input
          type="text"
          className="follow-up-input"
          placeholder="Follow-up step..."
          value={followUpTitle}
          onChange={(e) => setFollowUpTitle(e.target.value)}
        />
        <div className="follow-up-date-wrapper">
          <div className="follow-up-date-bubble" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '70px' }}>
            {formatDate(followUpDate, false).replace('due ', '')}
          </div>
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
          />
        </div>
        <button className="follow-up-submit-btn" onClick={handleFollowUpSubmit}>
          +
        </button>
      </div>

      <div className="options-row-actions-list">
        <div className="snooze-header" style={{ marginBottom: '8px' }}>Actions</div>
        <div className="actions-list">
          {task.subtasks && task.subtasks.map(sub => (
            <div key={sub.id} className={`action-item ${sub.completed ? 'completed' : ''}`} onClick={() => handleToggleSubtask(sub.id)}>
              <div className="action-checkbox">
                {sub.completed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>}
              </div>
              <span className="action-text">{sub.title}</span>
              <button className="action-delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteSubtask(sub.id); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
          ))}
          <div className="add-action-row">
            <input
              type="text"
              className="add-action-input"
              placeholder="Add needed action..."
              value={newActionTitle}
              onChange={(e) => setNewActionTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
            />
            <button className="add-action-btn" onClick={handleAddSubtask}>Add</button>
          </div>
        </div>
      </div>

      {task.logs && task.logs.length > 0 && (
        <div className="options-row-history">
          <div className="snooze-header" style={{ marginTop: '8px' }}>History</div>
          <div className="history-trail">
            {task.logs.slice().reverse().map(log => (
              <div key={log.id} className="history-item">
                <div className="history-timestamp">
                  {new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="history-text">{log.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PriorityView = () => {
  const { goals, updateTask, toggleTask, addTask, deleteTask, setSelectedGoalId, setSelectedMilestoneId, setActiveTab } = useStore();

  const [isThisWeekExpanded, setIsThisWeekExpanded] = useState(false);
  const [isUpNextExpanded, setIsUpNextExpanded] = useState(false);
  const [isOverdueExpanded, setIsOverdueExpanded] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedContext, setSelectedContext] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [followUpTitle, setFollowUpTitle] = useState('');
  const [snoozeNote, setSnoozeNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState(() => {
    const t = new Date(); t.setDate(t.getDate() + 1);
    return t.toISOString().split('T')[0];
  });
  const [newActionTitle, setNewActionTitle] = useState('');
  const [expandedTaskIds, setExpandedTaskIds] = useState(new Set());
  const [collapsedDates, setCollapsedDates] = useState(new Set());
  const [hasAutoCollapsed, setHasAutoCollapsed] = useState(false);
  const [newActivityTitles, setNewActivityTitles] = useState({}); // {taskId: string}
  const textareaRef = useRef(null);


  // Date logic
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const currentDay = todayDate.getDay() || 7;
  const startOfWeek = new Date(todayDate);
  startOfWeek.setDate(todayDate.getDate() - (currentDay - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  const { pillars } = useStore();
  const getPillarTitle = (id) => {
    const defaultIds = { personal: 'Personal', wealth: 'Wealth', growth: 'Growth' };
    if (defaultIds[id]) return defaultIds[id];
    const p = pillars.find(p => p.id === id);
    return p ? p.title : 'General';
  };

  const formatDate = (dateString, isOverdue) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const text = `${months[date.getMonth()]} ${date.getDate()}`;
      return isOverdue ? `was due ${text}` : `due ${text}`;
    } catch (e) {
      return dateString;
    }
  };

  const allTasks = (goals || []).flatMap(g =>
    (g.milestones || []).flatMap(ms =>
      (ms.tasks || []).flatMap(result => [
        {
          ...result,
          goalId: g.id,
          milestoneId: ms.id,
          pillarTitle: getPillarTitle(g.pillarId),
          milestoneTitle: ms.title,
          type: 'result'
        },
        ...(result.subtasks || []).map(task => ({
          ...task,
          goalId: g.id,
          milestoneId: ms.id,
          resultId: result.id,
          pillarTitle: getPillarTitle(g.pillarId),
          milestoneTitle: ms.title,
          type: 'task'
        }))
      ])
    )
  );

  const completedDateStrings = [...new Set(
    allTasks.filter(t => t.completed && t.completedAt)
      .map(t => new Date(t.completedAt).toLocaleDateString('en-CA'))
  )];

  let currentStreak = 0;
  const loopDate = new Date();
  const todayStr = loopDate.toLocaleDateString('en-CA');

  if (completedDateStrings.includes(todayStr)) {
    currentStreak++;
  }

  loopDate.setDate(loopDate.getDate() - 1);
  while (completedDateStrings.includes(loopDate.toLocaleDateString('en-CA'))) {
    currentStreak++;
    loopDate.setDate(loopDate.getDate() - 1);
  }

  const overdue = [];
  const thisWeekTasks = [];
  const upNext = [];
  const todayFocus = [];

  allTasks.forEach(t => {
    if (!t.scheduledDate) return;
    const tDate = new Date(t.scheduledDate);
    tDate.setHours(0, 0, 0, 0);

    const completedToday = t.completed && t.completedAt && (new Date(t.completedAt).toLocaleDateString('en-CA') === todayDate.toLocaleDateString('en-CA'));

    if (tDate >= startOfWeek && tDate <= endOfWeek) {
      thisWeekTasks.push(t);
    }

    if (t.isPriorityFocus || completedToday) {
      todayFocus.push(t);
    }

    if (!t.completed) {
      if (tDate < todayDate) overdue.push(t);
      else if (tDate > endOfWeek) upNext.push(t);
    }
  });

  overdue.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  thisWeekTasks.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  thisWeekTasks.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));

  upNext.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  const upNextGroups = upNext.reduce((groups, task) => {
    const date = task.scheduledDate.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(task);
    return groups;
  }, {});

  const thisWeekGroups = thisWeekTasks.reduce((groups, task) => {
    const date = task.scheduledDate.split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(task);
    return groups;
  }, {});

  const formatDateHeader = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
  };

  todayFocus.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  todayFocus.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));

  const incompleteFocusCount = todayFocus.filter(t => !t.completed).length;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editTitle, selectedTask]);

  // Auto-collapse logic for past dates
  useEffect(() => {
    if (!hasAutoCollapsed && isThisWeekExpanded) {
      const todayStr = new Date().toISOString().split('T')[0];
      const pastDates = new Set();
      Object.keys(thisWeekGroups).forEach(dateStr => {
        if (dateStr < todayStr) {
          pastDates.add(dateStr);
        }
      });
      if (pastDates.size > 0) {
        setCollapsedDates(prev => {
          const next = new Set(prev);
          pastDates.forEach(d => next.add(d));
          return next;
        });
      }
      setHasAutoCollapsed(true);
    }
  }, [isThisWeekExpanded, thisWeekGroups, hasAutoCollapsed]);

  const toggleDateCollapse = (dateStr) => {
    setCollapsedDates(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  };

  const setItemProperty = (item, propObj) => {
    if (item.type === 'result') {
      updateTask(item.goalId, item.milestoneId, item.id, propObj);
    } else {
      const g = goals.find(g => g.id === item.goalId);
      const ms = g?.milestones.find(m => m.id === item.milestoneId);
      const parentResult = ms?.tasks.find(r => r.id === item.resultId);
      if (parentResult) {
        const newSubtasks = parentResult.subtasks.map(s =>
          s.id === item.id ? { ...s, ...propObj } : s
        );
        updateTask(item.goalId, item.milestoneId, item.resultId, { subtasks: newSubtasks });
      }
    }
  }

  const handleToggle = (item, e) => {
    e.stopPropagation();
    if (item.type === 'result') {
      toggleTask(item.goalId, item.milestoneId, item.id);
    } else {
      const g = goals.find(g => g.id === item.goalId);
      const ms = g?.milestones.find(m => m.id === item.milestoneId);
      const parentResult = ms?.tasks.find(r => r.id === item.resultId);
      if (parentResult) {
        const newSubtasks = parentResult.subtasks.map(s =>
          s.id === item.id ? {
            ...s,
            completed: !s.completed,
            completedAt: !s.completed ? new Date().toISOString() : null
          } : s
        );
        updateTask(item.goalId, item.milestoneId, item.resultId, { subtasks: newSubtasks });
      }
    }
  };

  const handleToggleFocusFromCard = (item, e) => {
    e?.stopPropagation();
    const newValue = !item.isPriorityFocus;
    if (newValue && incompleteFocusCount >= 5) {
      alert("Focus full! Weekly Focus can only have max 5 actions. Un-swap one first.");
      return;
    }
    setItemProperty(item, { isPriorityFocus: newValue });
  };

  const handleCardClick = (item, context) => {
    if (selectedTask?.id === item.id && selectedContext === context) {
      setSelectedTask(null);
      setSelectedContext('');
      return;
    }
    setSelectedTask(item);
    setSelectedContext(context);
    setEditTitle(item.title || '');
    setFollowUpTitle('');
    setSnoozeNote('');
    setNewActionTitle('');
    const d = new Date(); d.setDate(d.getDate() + 1);
    setFollowUpDate(d.toISOString().split('T')[0]);
  };

  const handleTitleBlur = () => {
    if (editTitle !== selectedTask.title) {
      // Use a timeout to avoid immediate re-render which can close native pickers
      // being opened as a result of this blur (focus moving to date input)
      const cachedTitle = editTitle;
      const cachedTask = selectedTask;
      setTimeout(() => {
        setItemProperty(cachedTask, { title: cachedTitle });
        // Don't setSelectedTask here if we might be unmounted, but it's safe usually
      }, 100);
    }
  };

  const handleToggleFocusFromModal = () => {
    const newValue = !selectedTask.isPriorityFocus;
    if (newValue && incompleteFocusCount >= 5) {
      alert("Focus full! Weekly Focus can only have max 5 actions. Un-swap one first.");
      return;
    }
    setItemProperty(selectedTask, { isPriorityFocus: newValue });
    setSelectedTask({ ...selectedTask, isPriorityFocus: newValue });
  }

  const handleToggleSubtask = (subtaskId) => {
    const newSubtasks = (selectedTask.subtasks || []).map(s =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    setItemProperty(selectedTask, { subtasks: newSubtasks });
    setSelectedTask({ ...selectedTask, subtasks: newSubtasks });
  };

  const handleAddSubtask = () => {
    if (!newActionTitle.trim()) return;
    const newSubtask = {
      id: crypto.randomUUID(),
      title: newActionTitle.trim(),
      completed: false
    };
    const newSubtasks = [...(selectedTask.subtasks || []), newSubtask];
    setItemProperty(selectedTask, { subtasks: newSubtasks });
    setSelectedTask({ ...selectedTask, subtasks: newSubtasks });
    setNewActionTitle('');
  };

  const handleDeleteSubtask = (subtaskId) => {
    const newSubtasks = (selectedTask.subtasks || []).filter(s => s.id !== subtaskId);
    setItemProperty(selectedTask, { subtasks: newSubtasks });
    setSelectedTask({ ...selectedTask, subtasks: newSubtasks });
  };

  const toggleTaskExpansion = (taskId, e) => {
    e?.stopPropagation();
    setExpandedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const handleToggleActivity = (task, subtaskId, e) => {
    e?.stopPropagation();
    const newSubtasks = (task.subtasks || []).map(s =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    setItemProperty(task, { subtasks: newSubtasks });
    // Also update selectedTask if it's currently open
    if (selectedTask?.id === task.id) {
      setSelectedTask({ ...selectedTask, subtasks: newSubtasks });
    }
  };

  const handleAddActivityFromList = (task) => {
    const title = newActivityTitles[task.id];
    if (!title?.trim()) return;
    const newSubtask = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false
    };
    const newSubtasks = [...(task.subtasks || []), newSubtask];
    setItemProperty(task, { subtasks: newSubtasks });
    // Update local state if modal is open
    if (selectedTask?.id === task.id) {
      setSelectedTask({ ...selectedTask, subtasks: newSubtasks });
    }
    setNewActivityTitles(prev => ({ ...prev, [task.id]: '' }));
  };

  const handleDelete = () => {
    if (selectedTask.type === 'result') {
      deleteTask(selectedTask.goalId, selectedTask.milestoneId, selectedTask.id);
    } else {
      const g = goals.find(g => g.id === selectedTask.goalId);
      const ms = g?.milestones.find(m => m.id === selectedTask.milestoneId);
      const parentResult = ms?.tasks.find(r => r.id === selectedTask.resultId);
      if (parentResult) {
        const newSubtasks = parentResult.subtasks.filter(s => s.id !== selectedTask.id);
        updateTask(selectedTask.goalId, selectedTask.milestoneId, selectedTask.resultId, { subtasks: newSubtasks });
      }
    }
    setSelectedTask(null);
  };

  const handleSnooze = (val, shouldClose = true) => {
    const dateString = typeof val === 'number'
      ? new Date(new Date().setDate(new Date().getDate() + val)).toISOString().split('T')[0] + 'T09:00'
      : val + 'T09:00';

    const newDate = new Date(dateString);
    const isStillThisWeek = newDate >= startOfWeek && newDate <= endOfWeek;

    const updates = {
      scheduledDate: dateString,
      isPriorityFocus: selectedTask.isPriorityFocus && isStillThisWeek
    };

    if (snoozeNote.trim()) {
      const newLog = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        text: snoozeNote,
        type: 'snooze',
        newDate: dateString
      };
      updates.logs = [...(selectedTask.logs || []), newLog];
    }

    // Update both the store and the local selectedTask so UI reflects change immediately
    setItemProperty(selectedTask, updates);

    if (shouldClose) {
      setSelectedTask(null);
      setSelectedContext('');
    } else {
      setSelectedTask({ ...selectedTask, ...updates });
    }
    setSnoozeNote('');
  };

  const getSnoozeDetails = () => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    const m = new Date();
    m.setDate(m.getDate() + ((1 + 7 - m.getDay()) % 7 || 7));
    const nw = new Date();
    nw.setDate(nw.getDate() + 7);
    const mStr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      tomorrowDays: 1, tomorrowStr: `${mStr[t.getMonth()]} ${t.getDate()}`,
      mondayDays: ((1 + 7 - new Date().getDay()) % 7 || 7), mondayStr: `${mStr[m.getMonth()]} ${m.getDate()}`,
      nextWeekDays: 7, nextWeekStr: `${mStr[nw.getMonth()]} ${nw.getDate()}`
    };
  };

  const handleFollowUpSubmit = () => {
    if (!followUpTitle.trim()) return;
    const newDateStr = followUpDate + 'T09:00';

    if (selectedTask.type === 'result') {
      addTask(selectedTask.goalId, selectedTask.milestoneId, followUpTitle, 0, newDateStr, 'Medium');
    } else {
      const g = goals.find(g => g.id === selectedTask.goalId);
      const ms = g?.milestones.find(m => m.id === selectedTask.milestoneId);
      const parentResult = ms?.tasks.find(r => r.id === selectedTask.resultId);
      if (parentResult) {
        const newSubtask = {
          id: crypto.randomUUID(),
          title: followUpTitle,
          completed: false,
          isPriorityFocus: false,
          scheduledDate: newDateStr
        };
        const newSubtasks = [...(parentResult.subtasks || []), newSubtask];
        updateTask(selectedTask.goalId, selectedTask.milestoneId, selectedTask.resultId, { subtasks: newSubtasks });
      }
    }
    setSelectedTask(null);
  };

  const buildFollowUp = () => {
    // helper logic
  } // (just wrapping previous to keep line numbers if needed but not required)

  const handleNavigateToMilestone = (item, e) => {
    e?.stopPropagation();
    setSelectedGoalId(item.goalId);
    setSelectedMilestoneId(item.milestoneId);
    setActiveTab('Goals');
  };

  const headerDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(todayDate);
  const maxOverdue = 3;
  const overdueRender = overdue.slice(0, maxOverdue);

  const displayTotal = thisWeekTasks.length === 0 ? 5 : thisWeekTasks.length;
  const weeklyCompleted = thisWeekTasks.filter(t => t.completed).length;

  const renderTaskCard = (t, context, isLean = false) => {
    const isExpanded = expandedTaskIds.has(t.id);
    const activitiesCount = (t.subtasks || []).length;

    return (
      <div key={t.id} className={`priority-card ${context} ${t.completed ? 'completed' : ''} ${isExpanded ? 'expanded' : ''} ${isLean ? 'lean' : ''} ${t.isPriorityFocus ? 'in-focus' : ''}`}>
        <div className="priority-card-main-row">
          <div className="priority-radio" onClick={(e) => handleToggle(t, e)}>
            {t.completed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>}
          </div>

          <div className="priority-content" onClick={() => !t.completed && handleCardClick(t, context)}>
            <h4 className="priority-title">
              {t.isCritical && <span className="critical-tag-badge">CRITICAL</span>}
              {t.isPriorityFocus && context !== 'today' && <span className="focus-indicator-badge">FOCUS</span>}
              {t.title}
            </h4>
            <div className="priority-meta-row">
              <div className={`milestone-context-pill ${context}`} onClick={(e) => handleNavigateToMilestone(t, e)}>
                <span className="dot"></span> {t.milestoneTitle} &rarr;
              </div>
              {context !== 'today' && !t.isPriorityFocus && (
                <span className="reset-delete-btn" onClick={(e) => { e.stopPropagation(); handleToggleFocusFromCard(t, e) }}>focus ⇡</span>
              )}
            </div>
          </div>

          <div className="priority-card-right-column">
            {(context === 'today' || context === 'overdue') && t.scheduledDate && (
              <span className={`priority-date-indicator ${context === 'overdue' ? 'is-overdue' : ''}`}>
                {formatDate(t.scheduledDate, context === 'overdue')}
              </span>
            )}

            {(activitiesCount > 0 || isExpanded) && (
              <div className="expand-toggle" onClick={(e) => toggleTaskExpansion(t.id, e)}>
                {isExpanded ? (
                  <span>▾ hide</span>
                ) : (
                  <span>▸ {activitiesCount} actions</span>
                )}
              </div>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="activities-scaffolding-tray" onClick={(e) => e.stopPropagation()}>
            <div className="scaffolding-header">ACTIONS</div>
            <div className="scaffolding-list">
              {(t.subtasks || []).map(sub => (
                <div key={sub.id} className={`scaffolding-item ${sub.completed ? 'completed' : ''}`} onClick={(e) => handleToggleActivity(t, sub.id, e)}>
                  <div className="scaffolding-square-check">
                    {sub.completed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>}
                  </div>
                  <span className="scaffolding-text">{sub.title}</span>
                </div>
              ))}
              <div className="scaffolding-add-row">
                <div className="scaffolding-square-add"></div>
                <input
                  type="text"
                  className="scaffolding-add-input"
                  placeholder="Add activity..."
                  value={newActivityTitles[t.id] || ''}
                  onChange={(e) => setNewActivityTitles(prev => ({ ...prev, [t.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddActivityFromList(t)}
                />
              </div>
            </div>
            <div className="scaffolding-footer">
              <span className="dot"></span> Progress only moves when this step is marked done
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInlineOptions = (key) => {
    if (!selectedTask) return null;
    return (
      <InlineOptionsCard
        key={key}
        task={selectedTask}
        textareaRef={textareaRef}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        handleTitleBlur={handleTitleBlur}
        formatDate={formatDate}
        handleToggleFocusFromModal={handleToggleFocusFromModal}
        handleDelete={handleDelete}
        getSnoozeDetails={getSnoozeDetails}
        handleSnooze={handleSnooze}
        snoozeNote={snoozeNote}
        setSnoozeNote={setSnoozeNote}
        followUpTitle={followUpTitle}
        setFollowUpTitle={setFollowUpTitle}
        followUpDate={followUpDate}
        setFollowUpDate={setFollowUpDate}
        handleFollowUpSubmit={handleFollowUpSubmit}
        setSelectedTask={setSelectedTask}
        setSelectedContext={setSelectedContext}
        newActionTitle={newActionTitle}
        setNewActionTitle={setNewActionTitle}
        handleAddSubtask={handleAddSubtask}
        handleToggleSubtask={handleToggleSubtask}
        handleDeleteSubtask={handleDeleteSubtask}
      />
    );
  };

  return (
    <div className="priority-view safe-area animate-fade-in">

      <div className="priority-header">
        <div className="priority-header-titles">
          <h1>Actions</h1>
          <span className="priority-header-date">{headerDate}</span>
        </div>
        <div className="priority-header-streak">
          <h2>{currentStreak}</h2>
          <span>day streak</span>
        </div>
      </div>

      <div className="priority-scroll-container">


        <div className="priority-section overdue relative-z">
          <div
            className="priority-section-header clickable"
            onClick={() => setIsOverdueExpanded(!isOverdueExpanded)}
            style={{ marginBottom: isOverdueExpanded && overdue.length > 0 ? '12px' : '0' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="dot"></span> OVERDUE
            </div>
            <span className="header-count-alert">{overdue.length} total ›</span>
          </div>

          {isOverdueExpanded && overdue.length > 0 && (
            <div className="priority-list">
              {overdueRender.map(t => renderTaskCard(t, 'overdue'))}

              {overdue.length > maxOverdue && (
                <div className="show-more-link">
                  Show {overdue.length - maxOverdue} more overdue steps ›
                </div>
              )}
            </div>
          )}
          {isOverdueExpanded && overdue.length === 0 && (
            <div className="priority-card completed-blank" style={{ marginTop: '12px' }}>
              All caught up here!
            </div>
          )}
        </div>

        <div className="priority-section due-week relative-z">
          <div className="priority-section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="dot" style={{ background: '#f49d0d' }}></span> 
              WEEKLY FOCUS
              <div className="pulse-dots" style={{ marginLeft: '12px' }}>
                {Array.from({ length: Math.min(todayFocus.length, 10) }).map((_, i) => (
                  <span key={i} className={`pulse-dot ${(i < todayFocus.filter(t => t.completed).length) ? 'filled' : ''}`}></span>
                ))}
              </div>
            </div>
            <span className="header-count">{todayFocus.filter(t => t.completed).length} of {todayFocus.length} done</span>
          </div>
          {todayFocus.length > 0 ? (
            <div className="priority-list">
              {todayFocus.map(t => renderTaskCard(t, 'today'))}
            </div>
          ) : (
            <div className="priority-card completed-blank">
              Nothing specifically queued for today. Use 'focus ⇡' to add items!
            </div>
          )}
        </div>

        <div className="priority-section this-week-section relative-z">
          <div
            className="priority-section-header clickable"
            onClick={() => setIsThisWeekExpanded(!isThisWeekExpanded)}
            style={{ marginBottom: isThisWeekExpanded ? '12px' : '0' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14b8a6' }}>
              <span className="dot" style={{ background: '#14b8a6' }}></span> THIS WEEK
              <div className="mini-pulse-dots" style={{ marginLeft: '6px' }}>
                {Array.from({ length: Math.min(displayTotal, 7) }).map((_, i) => (
                  <span key={i} className={`mini-dot ${i < weeklyCompleted ? 'filled' : ''}`}></span>
                ))}
              </div>
            </div>
            <span className="header-count">{weeklyCompleted} of {displayTotal} done ›</span>
          </div>

          {isThisWeekExpanded && (
            <div className="this-week-expanded-tray animate-slide-down">

              <div className="tray-list grouped">
                {Object.keys(thisWeekGroups).sort().map(dateStr => {
                  const isCollapsed = collapsedDates.has(dateStr);
                  const groupTasks = thisWeekGroups[dateStr];
                  return (
                    <div key={dateStr} className={`this-week-date-group ${isCollapsed ? 'collapsed' : ''}`}>
                      <div className="up-next-date-header" onClick={() => toggleDateCollapse(dateStr)}>
                        <span className="collapse-arrow">{isCollapsed ? '▸' : '▾'}</span>
                        {formatDateHeader(dateStr)}
                        {isCollapsed && (
                          <span className="collapsed-count">
                            {groupTasks.filter(t => t.completed).length === groupTasks.length ? (
                              <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><path d="M20 6L9 17l-5-5"></path></svg> all done</>
                            ) : (
                              `${groupTasks.filter(t => t.completed).length} of ${groupTasks.length} done`
                            )}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <div className="date-group-items">
                          {groupTasks.map(t => renderTaskCard(t, 'week', true))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="priority-section up-next relative-z">
          <div
            className="priority-section-header clickable"
            onClick={() => setIsUpNextExpanded(!isUpNextExpanded)}
            style={{ marginBottom: isUpNextExpanded ? '12px' : '0' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
              <span className="dot" style={{ background: '#94a3b8' }}></span> UP NEXT
            </div>
            <span className="header-count">{upNext.length} steps ›</span>
          </div>

          {isUpNextExpanded && (
            <div className="this-week-expanded-tray animate-slide-down">
              <div className="tray-list grouped">
                {Object.keys(upNextGroups).sort().map(dateStr => (
                  <div key={dateStr} className="up-next-date-group">
                    <div className="up-next-date-header">{formatDateHeader(dateStr)}</div>
                    <div className="date-group-items">
                      {upNextGroups[dateStr].map(t => renderTaskCard(t, 'upnext', true))}
                    </div>
                  </div>
                ))}
                {upNext.length === 0 && (
                  <div className="priority-card completed-blank">
                    No future actions scheduled yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {selectedTask && (
        <div className="inline-options-overlay" onClick={() => { setSelectedTask(null); setSelectedContext(''); }}>
          {renderInlineOptions(selectedTask.id)}
        </div>
      )}
    </div>
  );
};

export default PriorityView;
