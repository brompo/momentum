import React from 'react';
import { useStore } from '../lib/store';
import './PriorityView.css';

const PriorityView = () => {
  const { goals, updateTask, toggleTask, setPreviousTab, setActiveTab } = useStore();
  
  // Date logic
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(today);
  const day = today.getDay();
  // We treat Sunday as the end of the week.
  const diff = (day === 0 ? 0 : 7 - day); 
  endOfWeek.setDate(today.getDate() + diff);
  endOfWeek.setHours(23, 59, 59, 999);

  // Pillar lookup helper
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
    } catch(e) {
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
          type: 'result'
        },
        ...(result.subtasks || []).map(task => ({
           ...task,
           goalId: g.id,
           milestoneId: ms.id,
           resultId: result.id,
           pillarTitle: getPillarTitle(g.pillarId),
           type: 'task'
        }))
      ])
    )
  );

  const incompleteTasks = allTasks.filter(t => !t.completed && t.scheduledDate);

  const overdue = [];
  const dueThisWeek = [];
  const upNext = [];

  incompleteTasks.forEach(t => {
     const tDate = new Date(t.scheduledDate);
     tDate.setHours(0,0,0,0);
     if (tDate < today) overdue.push(t);
     else if (tDate <= endOfWeek) dueThisWeek.push(t);
     else upNext.push(t);
  });

  // Sort by date ascending
  overdue.sort((a,b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  dueThisWeek.sort((a,b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  upNext.sort((a,b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

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
          s.id === item.id ? { ...s, completed: !s.completed } : s
        );
        updateTask(item.goalId, item.milestoneId, item.resultId, { subtasks: newSubtasks });
      }
    }
  };

  const renderCard = (item, groupClass) => (
    <div key={item.id} className={`priority-card ${groupClass}`} onClick={(e) => handleToggle(item, e)}>
      <div className="priority-radio"></div>
      <div className="priority-content">
        <h4 className="priority-title">{item.title}</h4>
        <span className="priority-meta">
          {item.pillarTitle} · {formatDate(item.scheduledDate, groupClass === 'overdue')}
        </span>
      </div>
    </div>
  );

  const headerDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(today);

  return (
    <div className="priority-view safe-area animate-fade-in">
       <div className="priority-header">
         <h1>Actions</h1>
         <span className="priority-header-date">{headerDate}</span>
       </div>

       <div className="priority-scroll-container">
          {overdue.length > 0 && (
            <div className="priority-section overdue">
              <div className="priority-section-header">
                <span className="dot"></span> OVERDUE
              </div>
              <div className="priority-list">
                 {overdue.map(t => renderCard(t, 'overdue'))}
              </div>
            </div>
          )}

          {dueThisWeek.length > 0 && (
            <div className="priority-section due-week">
              <div className="priority-section-header">
                <span className="dot"></span> DUE THIS WEEK
              </div>
              <div className="priority-list">
                 {dueThisWeek.map(t => renderCard(t, 'due-week'))}
              </div>
            </div>
          )}

          {upNext.length > 0 && (
            <div className="priority-section up-next">
              <div className="priority-section-header">
                <span className="dot"></span> UP NEXT
              </div>
              <div className="priority-list">
                 {upNext.map(t => renderCard(t, 'up-next'))}
              </div>
            </div>
          )}
          
          {overdue.length === 0 && dueThisWeek.length === 0 && upNext.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: '0.9rem' }}>
               No pending actions. You're all caught up!
            </div>
          )}
       </div>
    </div>
  );
};

export default PriorityView;
