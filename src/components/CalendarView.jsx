import React, { useState } from 'react';
import { useStore } from '../lib/store';
import './CalendarView.css';

const CalendarView = () => {
  const { goals } = useStore();
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
      ms.tasks.map(t => ({ ...t, goalTitle: g.title, milestoneTitle: ms.title }))
    )
  );

  // Filter tasks for the selected date
  // NOTE: In this MVP, we consider tasks without specific dates as 'Today' if added today, 
  // or we just show all pending tasks for simplicity in the assistant view.
  // For now, let's show ALL tasks but highlight those with dates or just show the 'Agenda'.
  
  const todayTasks = allTasks.filter(t => !t.completed);

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
        <h2>Agenda</h2>
        <div className="agenda-list">
          {todayTasks.length === 0 ? (
            <p className="empty-state">No pending tasks. You're all caught up!</p>
          ) : (
            todayTasks.map(task => (
              <div key={task.id} className="agenda-card glass-card animate-fade-in">
                <div className="agenda-meta">
                  <span className="agenda-goal">{task.goalTitle}</span>
                  <span className="agenda-ms">{task.milestoneTitle}</span>
                </div>
                <h3>{task.title}</h3>
                <div className="agenda-actions">
                  <button className="complete-btn">Mark Done</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
