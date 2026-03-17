import React, { useState } from 'react';
import { useStore } from '../lib/store';
import './CalendarView.css';

const CalendarView = () => {
  const { goals, toggleTask, updateTask } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'agenda'
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', value: '', scheduledDate: '' });

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
      scheduledDate: task.scheduledDate || ''
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
        scheduledDate: editForm.scheduledDate
      });
      setEditingTask(null);
    }
  };

  const formatNumberWithCommas = (num) => {
    if (!num) return '';
    return Number(num).toLocaleString();
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

  const renderTaskItem = (task) => (
    <div key={task.id} className={`agenda-item animate-fade-in ${task.completed ? 'completed' : ''}`} onClick={() => handleEditClick(task)}>
      <div className="agenda-item-left">
        <div className={`check-circle ${task.completed ? 'completed' : ''}`} onClick={(e) => { e.stopPropagation(); toggleTask(task.goalId, task.milestoneId, task.id); }}></div>
        <div className="agenda-item-content">
          <span className="agenda-task-title">{task.title}</span>
          <div className="agenda-meta">
            <span className="agenda-goal">{task.goalTitle}</span>
            <span className="agenda-ms">{task.milestoneTitle}</span>
          </div>
        </div>
      </div>
      {task.value > 0 && <span className="agenda-task-value">{task.value.toLocaleString()}</span>}
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
    const taskDate = new Date(task.scheduledDate + 'T00:00:00');
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) groupedTasks.today.push(task);
    else if (diffDays === 1) groupedTasks.tomorrow.push(task);
    else if (diffDays >= 2) groupedTasks.upcoming.push(task);
  });

  const todayTasks = allTasks.filter(t => {
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    if (!t.scheduledDate) {
      return isToday; // Show unscheduled on Today's view
    }
    return t.scheduledDate === selectedDate.toISOString().split('T')[0];
  }).sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));

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
                    type="date" 
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
    </div>
  );
};

export default CalendarView;
