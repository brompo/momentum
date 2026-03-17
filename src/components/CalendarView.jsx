import React, { useState } from 'react';
import { useStore } from '../lib/store';
import './CalendarView.css';

const CalendarView = () => {
  const { goals, toggleTask } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date());

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
        <h1>{selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h1>
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
      </div>

      <div className="agenda-section">
        <h2>{getHeaderTitle()}</h2>
        <div className="agenda-list">
          {todayTasks.length === 0 ? (
            <p className="empty-state">No pending tasks. You're all caught up!</p>
          ) : (
            todayTasks.map(task => (
              <div key={task.id} className={`agenda-item animate-fade-in ${task.completed ? 'completed' : ''}`} onClick={() => toggleTask(task.goalId, task.milestoneId, task.id)}>
                <div className="agenda-item-left">
                  <div className={`check-circle ${task.completed ? 'completed' : ''}`}></div>
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
