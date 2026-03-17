import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import './CalendarView.css';

const CalendarView = () => {
  const { goals, toggleTask, updateTask, addTask, setSelectedGoalId, setActiveTab, setPreviousTab } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('ga_calendar_view_mode') || 'calendar';
  });

  useEffect(() => {
    localStorage.setItem('ga_calendar_view_mode', viewMode);
  }, [viewMode]);
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', value: '', scheduledDate: '', priority: 'Low' });
  const [addingFollowUp, setAddingFollowUp] = useState(null);
  const [followUpForm, setFollowUpForm] = useState({ title: '', value: '', scheduledDate: '', markDone: true, notes: '', priority: 'Low' });

  const handleWeekChange = (offset) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + offset);
    setSelectedDate(newDate);
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      value: task.value ? task.value.toString() : '',
      scheduledDate: task.scheduledDate || '',
      priority: task.priority || 'Medium'
    });
  };

  const handleUpdateTask = (e) => {
    e.preventDefault();
    if (editingTask && editForm.title.trim()) {
      const cleanNumeric = editForm.value.toString().replace(/[^0-9]/g, '');
      const numericValue = parseFloat(cleanNumeric) || 0;
      updateTask(editingTask.goalId, editingTask.milestoneId, editingTask.id, {
        title: editForm.title,
        value: numericValue,
        scheduledDate: editForm.scheduledDate,
        priority: editForm.priority
      });
      setEditingTask(null);
    }
  };

  const formatNumberWithCommas = (num) => {
    if (!num) return '';
    return Number(num).toLocaleString();
  };

  const handleFollowUpClick = (task) => {
    setAddingFollowUp(task);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const tomorrowStr = `${year}-${month}-${day}T09:00`;
    setFollowUpForm({ title: '', value: '', scheduledDate: tomorrowStr, markDone: true, notes: '', priority: task.priority || 'Low' });
  };

  const handleAddFollowUp = (e) => {
    e.preventDefault();
    if (addingFollowUp && followUpForm.title.trim()) {
      const cleanNumeric = followUpForm.value ? followUpForm.value.toString().replace(/[^0-9]/g, '') : '';
      const numericValue = parseFloat(cleanNumeric) || 0;
      
      const newTaskId = crypto.randomUUID();
      const originalUpdates = {};
      
      if (followUpForm.notes.trim()) {
        originalUpdates.notes = followUpForm.notes;
      }

      // Single Dispatch Update to eliminate state race condition
      addTask(
        addingFollowUp.goalId, 
        addingFollowUp.milestoneId, 
        followUpForm.title, 
        numericValue, 
        followUpForm.scheduledDate, 
        followUpForm.priority, 
        newTaskId, 
        addingFollowUp.id, 
        originalUpdates
      );

      if (followUpForm.markDone && !addingFollowUp.completed) {
        toggleTask(addingFollowUp.goalId, addingFollowUp.milestoneId, addingFollowUp.id);
      }
      setAddingFollowUp(null);
    }
  };

  // Helper to get formatted dates for the week
  const getWeekDays = (baseDate) => {
    const days = [];
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - baseDate.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const weekDays = getWeekDays(selectedDate);

  // Extract all tasks across all goals
  const allTasks = goals.flatMap(g =>
    g.milestones.flatMap(ms =>
      ms.tasks.map(t => ({
        ...t,
        goalId: g.id,
        milestoneId: ms.id,
        goalTitle: g.title,
        milestoneTitle: ms.title
      }))
    )
  );

  // Filter tasks for the selected date
  // NOTE: In this MVP, we consider tasks without specific dates as 'Today' if added today, 
  // or we just show all pending tasks for simplicity in the assistant view.
  // For now, let's show ALL tasks but highlight those with dates or just show the 'Agenda'.

  const handleViewFollowUp = (task) => {
    const followUp = allTasks.find(t => t.id === task.followUpTaskId);
    if (followUp) {
      handleEditClick(followUp);
    }
  };

  const renderTaskItem = (task) => (
    <div key={task.id} className={`agenda-item animate-fade-in ${task.completed ? 'completed' : ''}`} onClick={() => handleEditClick(task)}>
      <div className="agenda-item-left">
        <div className={`check-circle ${task.completed ? 'completed' : ''}`} onClick={(e) => { e.stopPropagation(); toggleTask(task.goalId, task.milestoneId, task.id); }}></div>
        <div className="agenda-item-content">
          <div className="agenda-task-header" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '8px', width: '100%' }}>
            {task.scheduledDate && task.scheduledDate.includes('T') && (
              <span className="agenda-task-time" style={{ fontSize: '0.73rem', color: 'var(--primary)', background: '#eef2ff', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, flexShrink: 0 }}>
                {new Date(task.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <span className="agenda-task-title">{task.title}</span>
            <span className={`priority-badge ${(task.priority || 'Medium').toLowerCase()}`}>
              {task.priority || 'Medium'}
            </span>
          </div>
          <div className="agenda-meta">
            <span className="agenda-goal" onClick={(e) => { e.stopPropagation(); setPreviousTab('Calendar'); setSelectedGoalId(task.goalId); setActiveTab('Goals'); }} style={{ cursor: 'pointer' }}>
              {task.goalTitle}
            </span>
            <span className="agenda-ms">{task.milestoneTitle}</span>
          </div>
        </div>
      </div>
      <div className="agenda-item-actions">
        {task.followUpTaskId ? (
          <button className="view-followup-btn icon-btn" onClick={(e) => { e.stopPropagation(); handleViewFollowUp(task); }} title="View Follow-up" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
        ) : (
          <button className="add-followup-btn icon-btn" onClick={(e) => { e.stopPropagation(); handleFollowUpClick(task); }} title="Add Follow-up">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  // Groups for Agenda View (Continuous)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const groupedTasks = {
    today: [],
    tomorrow: [],
    upcoming: [],
    unscheduled: []
  };

  allTasks.forEach(task => {
    if (task.completed) return;
    if (!task.scheduledDate) {
      groupedTasks.unscheduled.push(task);
      return;
    }
    const dateOnly = task.scheduledDate.split('T')[0];
    const taskDate = new Date(dateOnly + 'T00:00:00');
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) groupedTasks.today.push(task);
    else if (diffDays === 1) groupedTasks.tomorrow.push(task);
    else if (diffDays >= 2) groupedTasks.upcoming.push(task);
  });

  // Sort grouped tasks by time ascending
  Object.keys(groupedTasks).forEach(key => {
    groupedTasks[key].sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (a.scheduledDate || '').localeCompare(b.scheduledDate || '');
    });
  });

  const todayTasks = allTasks.filter(t => {
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    if (!t.scheduledDate) {
      return isToday;
    }
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const localDateStr = `${year}-${month}-${day}`;
    return t.scheduledDate.split('T')[0] === localDateStr;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return (a.scheduledDate || '').localeCompare(b.scheduledDate || '');
  });

  const getHeaderTitle = () => {
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = selectedDate.toDateString() === tomorrow.toDateString();

    if (isToday) return "Today's Tasks";
    if (isTomorrow) return "Tomorrow's Tasks";
    return `${selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}'s Tasks`;
  };

  return (
    <div className="calendar-view safe-area animate-fade-in">
      <div className="calendar-header">
        <div className="header-top">
          <h1>{selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h1>
          <div className="view-toggle">
            <button className={viewMode === 'calendar' ? 'active' : ''} onClick={() => setViewMode('calendar')}>Calendar</button>
            <button className={viewMode === 'agenda' ? 'active' : ''} onClick={() => setViewMode('agenda')}>Agenda</button>
          </div>
        </div>

        {viewMode === 'calendar' && (
          <div className="date-strip-row">
            <button className="nav-btn" onClick={() => handleWeekChange(-7)}>&lt;</button>
            <div className="date-strip">
              {weekDays.map(day => {
                const isToday = day.toDateString() === new Date().toDateString();
                const isSelected = day.toDateString() === selectedDate.toDateString();
                return (
                  <div
                    key={day.toISOString()}
                    className={`date-item smooth-all ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => setSelectedDate(day)}
                  >
                    <span className="day-name">{day.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="day-num">{day.getDate()}</span>
                  </div>
                );
              })}
            </div>
            <button className="nav-btn" onClick={() => handleWeekChange(7)}>&gt;</button>
          </div>
        )}
      </div>

      <div className="agenda-section">
        <h2>{viewMode === 'calendar' ? getHeaderTitle() : 'Agenda'}</h2>
        <div className="agenda-list">
          {viewMode === 'calendar' ? (
            todayTasks.length === 0 ? (
              <p className="empty-state">No pending tasks. You're all caught up!</p>
            ) : (
              todayTasks.map(task => renderTaskItem(task))
            )
          ) : (
            Object.values(groupedTasks).every(arr => arr.length === 0) ? (
              <p className="empty-state">No pending tasks. You're all caught up!</p>
            ) : (
              <>
                {groupedTasks.today.length > 0 && (
                  <div className="agenda-group">
                    <h3>Today</h3>
                    {groupedTasks.today.map(task => renderTaskItem(task))}
                  </div>
                )}
                {groupedTasks.tomorrow.length > 0 && (
                  <div className="agenda-group">
                    <h3>Tomorrow</h3>
                    {groupedTasks.tomorrow.map(task => renderTaskItem(task))}
                  </div>
                )}
                {groupedTasks.upcoming.length > 0 && (
                  <div className="agenda-group">
                    <h3>Upcoming</h3>
                    {groupedTasks.upcoming.map(task => renderTaskItem(task))}
                  </div>
                )}
                {groupedTasks.unscheduled.length > 0 && (
                  <div className="agenda-group">
                    <h3>Unscheduled</h3>
                    {groupedTasks.unscheduled.map(task => renderTaskItem(task))}
                  </div>
                )}
              </>
            )
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <div className="modal-overlay" onClick={() => setEditingTask(null)}>
          <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Task</h3>
              <button className="close-modal" onClick={() => setEditingTask(null)}>&times;</button>
            </div>
            <form onSubmit={handleUpdateTask} className="task-form">
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="What needs to be done?"
                  required
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select 
                  value={editForm.priority} 
                  onChange={e => setEditForm({ ...editForm, priority: e.target.value })} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.9rem' }}
                >
                  <option value="High">High 🔴</option>
                  <option value="Medium">Medium 🟡</option>
                  <option value="Low">Low 🔵</option>
                </select>
              </div>

              <div className="form-row task-modal-row">
                <div className="form-group">
                  <label>Value (Optional)</label>
                  <input
                    type="text"
                    value={editForm.value}
                    onChange={e => setEditForm({ ...editForm, value: e.target.value })}
                    placeholder="e.g. 5,000"
                  />
                </div>

                <div className="form-group date-input-group">
                  <label>Schedule Date</label>
                  <input
                    type="datetime-local"
                    value={editForm.scheduledDate}
                    onChange={e => setEditForm({ ...editForm, scheduledDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setEditingTask(null)}>Cancel</button>
                <button type="submit" className="primary-btn">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Follow-up Modal */}
      {addingFollowUp && (
        <div className="modal-overlay" onClick={() => setAddingFollowUp(null)}>
          <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Follow-up Task</h3>
              <button className="close-modal" onClick={() => setAddingFollowUp(null)}>&times;</button>
            </div>
            <div className="modal-task-source" style={{ background: '#fef3c7', padding: '10px 12px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, color: '#92400e', marginBottom: '14px', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ color: '#d97706', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Following up on:</span>
                <span style={{ color: '#78350f', fontSize: '0.9rem', fontWeight: 700 }}>{addingFollowUp.title}</span>
              </div>
            </div>
            <form onSubmit={handleAddFollowUp} className="task-form">
              <div className="form-group">
                <label>Note / Lesson Learned (Optional)</label>
                <textarea
                  value={followUpForm.notes}
                  onChange={e => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                  placeholder="What were the efforts / lessons learned?"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Next Step (Follow Up Task)</label>
                <input
                  type="text"
                  value={followUpForm.title}
                  onChange={e => setFollowUpForm({ ...followUpForm, title: e.target.value })}
                  placeholder="What is the next step?"
                  required
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select 
                  value={followUpForm.priority} 
                  onChange={e => setFollowUpForm({ ...followUpForm, priority: e.target.value })} 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.9rem' }}
                >
                  <option value="High">High 🔴</option>
                  <option value="Medium">Medium 🟡</option>
                  <option value="Low">Low 🔵</option>
                </select>
              </div>

              <div className="form-row task-modal-row">
                <div className="form-group">
                  <label>Value (Optional)</label>
                  <input
                    type="text"
                    value={followUpForm.value}
                    onChange={e => setFollowUpForm({ ...followUpForm, value: e.target.value })}
                    placeholder="e.g. 5,000"
                  />
                </div>

                <div className="form-group date-input-group">
                  <label>Schedule Date</label>
                  <input
                    type="datetime-local"
                    value={followUpForm.scheduledDate}
                    onChange={e => setFollowUpForm({ ...followUpForm, scheduledDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group checkbox-group" style={{ display: 'block', width: '100%', marginTop: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: '8px', width: '100%' }}>
                  <input
                    type="checkbox"
                    id="markDoneCheckbox"
                    checked={followUpForm.markDone}
                    onChange={e => setFollowUpForm({ ...followUpForm, markDone: e.target.checked })}
                    style={{ margin: 0, flexShrink: 0, cursor: 'pointer' }}
                  />
                  <label htmlFor="markDoneCheckbox" style={{ flex: 1, textAlign: 'left', whiteSpace: 'normal', fontSize: '0.7rem', color: '#1e293b', cursor: 'pointer', display: 'inline', margin: 0, textTransform: 'none', letterSpacing: 0, fontWeight: 500 }}>
                    Mark original task as completed
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setAddingFollowUp(null)}>Cancel</button>
                <button type="submit" className="primary-btn">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
