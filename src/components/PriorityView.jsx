import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import './PriorityView.css';

const PriorityView = () => {
  const { goals, updateTask, toggleTask, addTask, deleteTask, setSelectedGoalId, setSelectedMilestoneId, setActiveTab } = useStore();

  const [isThisWeekExpanded, setIsThisWeekExpanded] = useState(false);
  const [isUpNextExpanded, setIsUpNextExpanded] = useState(false);
  const [isOverdueExpanded, setIsOverdueExpanded] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedContext, setSelectedContext] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [followUpTitle, setFollowUpTitle] = useState('');
  const [followUpDate, setFollowUpDate] = useState(() => {
    const t = new Date(); t.setDate(t.getDate() + 1);
    return t.toISOString().split('T')[0];
  });
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [editTitle, selectedTask]);

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
  thisWeekTasks.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? -1 : 1));

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
  todayFocus.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? -1 : 1));

  const incompleteFocusCount = todayFocus.filter(t => !t.completed).length;

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
    if (newValue && incompleteFocusCount >= 3) {
      alert("Focus full! Today's Focus can only have max 3 actions. Un-swap one first.");
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
    if (newValue && incompleteFocusCount >= 3) {
      alert("Focus full! Today's Focus can only have max 3 actions. Un-swap one first.");
      return;
    }
    setItemProperty(selectedTask, { isPriorityFocus: newValue });
    setSelectedTask({ ...selectedTask, isPriorityFocus: newValue });
  }

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

  const handleSnooze = (val) => {
    let dateString;
    if (typeof val === 'number') {
      const date = new Date();
      date.setDate(date.getDate() + val);
      dateString = date.toISOString().split('T')[0] + 'T09:00';
    } else {
      dateString = val + 'T09:00';
    }
    setItemProperty(selectedTask, { scheduledDate: dateString });
    setSelectedTask(null);
    setSelectedContext('');
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

  const renderInlineOptions = (key) => {
    if (!selectedTask) return null;
    return (
      <div className="inline-options-card" key={key}>
        {/* Close Button top right */}
        <div className="inline-close-btn" onClick={(e) => { e.stopPropagation(); setSelectedTask(null); setSelectedContext(''); }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </div>

        <div className="options-row-top">
          <div style={{ flex: 1, paddingRight: '12px' }}>
            <textarea
              ref={textareaRef}
              value={editTitle}
              onChange={(e) => {
                setEditTitle(e.target.value);
              }}
              onBlur={handleTitleBlur}
              className="sheet-title-input"
              rows={1}
            />
          </div>
          <div className="options-date-pill">
            {selectedTask.scheduledDate ? formatDate(selectedTask.scheduledDate, false).replace('due ', '') : 'No Date'} ✏️
          </div>
        </div>

        <div className="options-row-actions">
          <div className="action-pill-card focus" onClick={handleToggleFocusFromModal}>
            <span>⚡</span> {selectedTask.isPriorityFocus ? "Remove focus" : "Focus today"}
          </div>
          <div className="action-pill-card delete" onClick={handleDelete}>
            <span>🗑️</span> Won't do
          </div>
        </div>

        <div className="options-row-snooze">
          <div className="snooze-header">Snooze To</div>
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
                onChange={(e) => handleSnooze(e.target.value)}
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
      </div>
    );
  };

  return (
    <div className="priority-view safe-area animate-fade-in">
      {/* Global blur mask when a task is selected */}
      {selectedTask && <div className="inline-options-overlay" onClick={() => setSelectedTask(null)}></div>}

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

        <div className="weekly-pulse-card relative-z">
          <span className="pulse-text">This week — {weeklyCompleted} of {displayTotal} steps done</span>
          <div className="pulse-dots">
            {Array.from({ length: Math.min(displayTotal, 20) }).map((_, i) => (
              <span key={i} className={`pulse-dot ${i < weeklyCompleted ? 'filled' : ''}`}></span>
            ))}
          </div>
        </div>

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
              {overdueRender.map((t, idx) => (
                selectedTask?.id === t.id && selectedContext === 'overdue' ? renderInlineOptions(t.id) : (
                  <div key={t.id} className="priority-card overdue" onClick={() => handleCardClick(t, 'overdue')}>
                    <div className="priority-radio" onClick={(e) => handleToggle(t, e)}></div>
                    <div className="priority-content">
                      <h4 className="priority-title">
                        {t.isCritical && <span className="critical-tag-badge mini">CRITICAL</span>}
                        {t.title}
                      </h4>
                      <div className="priority-meta-row">
                        <div className="milestone-context-pill overdue" onClick={(e) => handleNavigateToMilestone(t, e)}>
                          <span className="dot"></span> {t.milestoneTitle} &rarr;
                        </div>
                        {!t.isPriorityFocus && <span className="reset-delete-btn" onClick={(e) => { e.stopPropagation(); handleToggleFocusFromCard(t, e) }}>focus ⇡</span>}
                      </div>
                    </div>
                  </div>
                )
              ))}

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
              <span className="dot" style={{ background: '#f49d0d' }}></span> TODAY'S FOCUS
            </div>
            <span className="header-count">{todayFocus.filter(t => t.completed).length} of {todayFocus.length} done</span>
          </div>
          {todayFocus.length > 0 ? (
            <div className="priority-list">
              {todayFocus.map(t => (
                selectedTask?.id === t.id && !t.completed && selectedContext === 'today' ? renderInlineOptions(t.id) : (
                  <div key={t.id} className={`priority-card due-week ${t.completed ? 'completed' : ''}`} onClick={() => !t.completed && handleCardClick(t, 'today')}>
                    <div className="priority-radio" onClick={(e) => handleToggle(t, e)}>
                      {t.completed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>}
                    </div>
                    <div className="priority-content">
                      <h4 className="priority-title">
                        {t.isCritical && <span className="critical-tag-badge">CRITICAL</span>}
                        {t.title}
                      </h4>
                      <div className="priority-meta-row">
                        <div className={`milestone-context-pill ${t.completed ? 'completed' : 'due-week'}`} onClick={(e) => handleNavigateToMilestone(t, e)}>
                          <span className="dot"></span> {t.milestoneTitle} &rarr;
                        </div>
                        {!t.completed && (
                          <span className="swap-text clickable" onClick={(e) => handleToggleFocusFromCard(t, e)}>swap ⇆</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="priority-card completed-blank">
              Nothing specifically queued for today. Use 'focus ⇡' to add items!
            </div>
          )}
        </div>

        <div className="priority-section this-week-section relative-z" style={{ zIndex: selectedTask ? 1002 : 'auto' }}>
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
                {Object.keys(thisWeekGroups).sort().map(dateStr => (
                  <div key={dateStr} className="this-week-date-group">
                    <div className="up-next-date-header">{formatDateHeader(dateStr)}</div>
                    <div className="date-group-items">
                      {thisWeekGroups[dateStr].map(t => {
                        if (t.completed) {
                          return (
                            <div key={t.id} className="tray-item completed" onClick={(e) => handleToggle(t, e)}>
                              <div className="tray-mini-check">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                              </div>
                              <span className="tray-title">
                                {t.isCritical && <span className="critical-tag-badge mini">CRITICAL</span>}
                                {t.title}
                              </span>
                            </div>
                          );
                        }

                        if (selectedTask?.id === t.id && selectedContext === 'week') {
                          return renderInlineOptions(t.id);
                        }

                        if (t.isPriorityFocus) {
                          return (
                            <div key={t.id} className="tray-item focused" onClick={() => handleCardClick(t, 'week')}>
                              <div className="priority-radio" onClick={(e) => handleToggle(t, e)} style={{ borderColor: '#d97706', width: '18px', height: '18px' }}></div>
                              <div className="tray-content">
                                <h4 className="tray-title" style={{ fontSize: '0.9rem', margin: 0, color: '#1e293b' }}>
                                  {t.isCritical && <span className="critical-tag-badge mini">CRITICAL</span>}
                                  {t.title}
                                </h4>
                                <div className="milestone-context-pill tray" onClick={(e) => handleNavigateToMilestone(t, e)}>
                                  <span className="dot"></span> {t.milestoneTitle} &rarr;
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div key={t.id} className="tray-item normal" onClick={() => handleCardClick(t, 'week')}>
                            <div className="tray-content" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                              <span className="tray-title" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                {t.isCritical && <span className="critical-tag-badge mini">CRITICAL</span>}
                                {t.title}
                              </span>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div className="milestone-context-pill tray" onClick={(e) => handleNavigateToMilestone(t, e)}>
                                  <span className="dot"></span> {t.milestoneTitle} &rarr;
                                </div>
                                <span className="add-focus-btn clickable" onClick={(e) => handleToggleFocusFromCard(t, e)}>focus ⇡</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="priority-section up-next relative-z" style={{ zIndex: selectedTask ? 1001 : 'auto' }}>
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
                      {upNextGroups[dateStr].map(t => (
                        <div key={t.id} className="tray-item normal" onClick={() => handleCardClick(t, 'upnext')}>
                          <div className="tray-content" style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                            <span className="tray-title" style={{ fontSize: '0.85rem', color: '#64748b' }}>
                              {t.isCritical && <span className="critical-tag-badge mini">CRITICAL</span>}
                              {t.title}
                            </span>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div className="milestone-context-pill tray" onClick={(e) => handleNavigateToMilestone(t, e)}>
                                <span className="dot"></span> {t.milestoneTitle} &rarr;
                              </div>
                              <span className="add-focus-btn clickable" onClick={(e) => handleToggleFocusFromCard(t, e)}>focus ⇡</span>
                            </div>
                          </div>
                        </div>
                      ))}
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
    </div>
  );
};

export default PriorityView;
