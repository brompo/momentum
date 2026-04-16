import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import './ActionsView.css';

const ActionsView = () => {
  const { goals, toggleTask, updateTask, addTask, setSelectedGoalId, setSelectedMilestoneId, setActiveTab, activeActionsSubTab, setActiveActionsSubTab } = useStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', value: '', scheduledDate: '', priority: 'Low' });
  const [isAddingGlobalTask, setIsAddingGlobalTask] = useState(false);
  const [globalTaskForm, setGlobalTaskForm] = useState({ title: '', value: '', scheduledDate: new Date().toISOString().split('T')[0] + 'T09:00', priority: 'Medium', goalId: '', milestoneId: '', subtasks: [] });
  const [expandedResultId, setExpandedResultId] = useState(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskDate, setNewSubtaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [collapsedCategories, setCollapsedCategories] = useState({ must: false, should: false });

  const toggleCategory = (cat) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
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
    const taskDate = new Date(dateString.split('T')[0]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    const taskDateStr = taskDate.toISOString().split('T')[0];

    if (taskDateStr < todayStr) return 'past';
    if (taskDateStr > todayStr) return 'future';
    return 'today';
  };

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
      updateTask(editingTask.goalId, editingTask.milestoneId, editingTask.id, {
        title: editForm.title,
        value: parseFloat(editForm.value.replace(/[^0-9]/g, '')) || 0,
        scheduledDate: editForm.scheduledDate,
        priority: editForm.priority
      });
      setEditingTask(null);
    }
  };

  const handleGlobalTaskSubmit = (e) => {
    e.preventDefault();
    if (globalTaskForm.title.trim() && globalTaskForm.goalId && globalTaskForm.milestoneId) {
      addTask(
        globalTaskForm.goalId,
        globalTaskForm.milestoneId,
        globalTaskForm.title,
        parseFloat((globalTaskForm.value || '').toString().replace(/[^0-9]/g, '')) || 0,
        globalTaskForm.scheduledDate,
        globalTaskForm.priority,
        crypto.randomUUID()
      );
      setIsAddingGlobalTask(false);
      setGlobalTaskForm({ title: '', value: '', scheduledDate: new Date().toISOString().split('T')[0] + 'T09:00', priority: 'Medium', goalId: '', milestoneId: '', subtasks: [] });
    }
  };

  const getWeekDays = (baseDate) => {
    const days = [];
    const day = baseDate.getDay();
    const diff = (day + 6) % 7;
    const startOfWeek = new Date(baseDate);
    startOfWeek.setDate(baseDate.getDate() - diff);
    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        days.push(d);
    }
    return days;
  };

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const weekDays = getWeekDays(selectedDate);
  const currentWeekNumber = getWeekNumber(selectedDate);

  const getWeekRangeString = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    const startDay = start.getDate();
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endDay = end.getDate();
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    if (start.getMonth() === end.getMonth()) return `${startDay} - ${endDay} ${startMonth}`;
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  };

  const allResults = (goals || []).flatMap(g =>
    (g.milestones || []).flatMap(ms =>
      (ms.tasks || []).map(t => ({
        ...t,
        goalId: g.id,
        milestoneId: ms.id,
        goalTitle: g.title,
        milestoneTitle: ms.title,
        type: 'result'
      }))
    )
  );

  const allTasks = (goals || []).flatMap(g =>
    (g.milestones || []).flatMap(ms =>
      (ms.tasks || []).flatMap(result => 
        (result.subtasks || []).map(task => ({
          ...task,
          goalId: g.id,
          milestoneId: ms.id,
          resultId: result.id,
          goalTitle: g.title,
          milestoneTitle: ms.title,
          resultTitle: result.title,
          priority: result.priority, // Inherit priority if not set
          type: 'task'
        }))
      )
    )
  );

  const getWeeklyResults = () => {
    const start = new Date(weekDays[0]);
    start.setHours(0,0,0,0);
    const end = new Date(weekDays[6]);
    end.setHours(23,59,59,999);
    return allResults.filter(t => {
      if (!t.scheduledDate) return false;
      const d = new Date(t.scheduledDate);
      return d >= start && d <= end;
    });
  };

  const weeklyResults = getWeeklyResults();
  
  // Helper to group tasks by milestone
  const groupByMilestone = (tasks) => {
    const groups = tasks.reduce((acc, task) => {
      const key = task.milestoneId;
      if (!acc[key]) {
        acc[key] = {
          milestoneId: task.milestoneId,
          milestoneTitle: task.milestoneTitle,
          goalTitle: task.goalTitle,
          tasks: []
        };
      }
      acc[key].tasks.push(task);
      return acc;
    }, {});
    return Object.values(groups).sort((a, b) => a.milestoneTitle.localeCompare(b.milestoneTitle));
  };

  const mustDoWeeklyGroups = groupByMilestone(weeklyResults.filter(t => t.priority === 'High'));
  const shouldDoWeeklyGroups = groupByMilestone(weeklyResults.filter(t => t.priority !== 'High'));

  const completedWeeklyCount = weeklyResults.filter(t => t.completed).length;
  const totalWeeklyCount = weeklyResults.length;

  const todayTasks = allTasks.filter(t => {
    if (!t.scheduledDate) return false;
    const localDateStr = selectedDate.toISOString().split('T')[0];
    return t.scheduledDate.split('T')[0] === localDateStr;
  });

  const handleAddInlineSubtask = (result) => {
    if (newSubtaskTitle.trim()) {
      const newSubtask = {
        id: crypto.randomUUID(),
        title: newSubtaskTitle,
        completed: false,
        scheduledDate: newSubtaskDate
      };
      const updatedSubtasks = [...(result.subtasks || []), newSubtask];
      updateTask(result.goalId, result.milestoneId, result.id, { subtasks: updatedSubtasks });
      setNewSubtaskTitle('');
    }
  };

  const renderTaskCard = (item, hideMilestone = false) => {
    const isExpanded = expandedResultId === item.id;
    
    return (
      <div key={item.id} className={`result-card-container ${isExpanded ? 'expanded' : ''}`}>
        <div 
          className={`task-action-card animate-fade-in ${item.completed ? 'completed' : ''}`} 
          onClick={() => {
            if (item.type === 'result') {
              setExpandedResultId(isExpanded ? null : item.id);
            } else {
              handleEditClick(item);
            }
          }}
        >
          <div className="task-card-left">
            <div 
              className={`task-check-circle ${item.completed ? 'completed' : ''}`} 
              onClick={(e) => { 
                e.stopPropagation(); 
                if (item.type === 'result') {
                  toggleTask(item.goalId, item.milestoneId, item.id);
                } else {
                  const parentResult = allResults.find(r => r.id === item.resultId);
                  if (parentResult) {
                    const newSubtasks = parentResult.subtasks.map(s => 
                      s.id === item.id ? { ...s, completed: !s.completed } : s
                    );
                    updateTask(item.goalId, item.milestoneId, item.resultId, { subtasks: newSubtasks });
                  }
                }
              }}
            >
              {item.completed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>}
            </div>
            <div className="task-card-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                <span className="task-card-title">{item.title}</span>
                {item.scheduledDate && (
                  <span className={`task-date-badge ${item.completed ? 'past' : getDateStatusClass(item.scheduledDate)}`}>
                    {formatDateMMM(item.scheduledDate)}
                  </span>
                )}
              </div>
              {!hideMilestone && (
                <span className="task-card-subtext">● {item.type === 'result' ? item.milestoneTitle : item.resultTitle}</span>
              )}
            </div>
          </div>
          <div className="task-card-right-group">
            <div 
              className={`task-card-priority-tag clickable ${item.priority === 'High' ? 'must' : 'should'}`}
              onClick={(e) => {
                e.stopPropagation();
                updateTask(item.goalId, item.milestoneId, item.id, { priority: item.priority === 'High' ? 'Medium' : 'High' });
              }}
            >
              {item.priority === 'High' ? 'Must' : 'Should'}
            </div>
            {item.type === 'result' && (
               <svg className={`expansion-chevron ${isExpanded ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
            )}
          </div>
        </div>

        {isExpanded && item.type === 'result' && (
          <div className="inline-subtasks-tray animate-slide-down">
            <div className="tray-section-header">
              <div className="tray-section-label">DAILY ACTIONS</div>
            </div>
            {(item.subtasks || []).map(sub => (
              <div key={sub.id} className="inline-subtask-row">
                 <div 
                   className={`mini-check ${sub.completed ? 'completed' : ''}`}
                   onClick={() => {
                     const updated = item.subtasks.map(s => s.id === sub.id ? { ...s, completed: !s.completed } : s);
                     updateTask(item.goalId, item.milestoneId, item.id, { subtasks: updated });
                   }}
                 >
                   {sub.completed && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="5"><path d="M20 6L9 17l-5-5"></path></svg>}
                 </div>
                 <span className="sub-title">{sub.title}</span>
                 {sub.scheduledDate && (
                   <span className={`task-date-badge ${sub.completed ? 'past' : getDateStatusClass(sub.scheduledDate)}`} style={{ fontSize: '0.6rem', padding: '1px 5px' }}>
                     {formatDateMMM(sub.scheduledDate)}
                   </span>
                 )}
              </div>
            ))}
            
            <div className="inline-add-row-modern">
               <input 
                 type="text" 
                 placeholder="Add dated daily action..." 
                 value={newSubtaskTitle}
                 onChange={e => setNewSubtaskTitle(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleAddInlineSubtask(item)}
               />
               <input 
                 type="date"
                 className="inline-date-input"
                 value={newSubtaskDate}
                 onChange={e => setNewSubtaskDate(e.target.value)}
               />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="actions-view safe-area animate-fade-in">
      <div className="actions-header">
        <div className="week-info">
          <span className="week-indicator">WEEK {currentWeekNumber}/52</span>
          <div className="date-nav-row">
            <h1>{getWeekRangeString()}</h1>
            <div className="header-nav-btns">
              <button className="nav-btn" onClick={() => handleWeekChange(-7)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg></button>
              <button className="nav-btn" onClick={() => handleWeekChange(7)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg></button>
            </div>
          </div>
        </div>
      </div>

      <div className="week-strip-modern">
        {weekDays.map(day => {
          const isToday = day.toDateString() === new Date().toDateString();
          const isSelected = day.toDateString() === selectedDate.toDateString();
          return (
            <div key={day.toISOString()} className={`day-node ${isSelected ? 'active' : ''} ${isToday ? 'today' : ''}`} onClick={() => setSelectedDate(day)}>
              {day.toLocaleDateString('en-US', { weekday: 'narrow' })}
            </div>
          );
        })}
      </div>

      <div className="sub-tab-capsule">
        <button className={activeActionsSubTab === 'Weekly Commitments' ? 'active' : ''} onClick={() => setActiveActionsSubTab('Weekly Commitments')}>This week</button>
        <button className={activeActionsSubTab === 'Today Focus' ? 'active' : ''} onClick={() => setActiveActionsSubTab('Today Focus')}>Today's focus</button>
      </div>

      <div className="actions-content-scroll">
        {activeActionsSubTab === 'Weekly Commitments' ? (
          <div className="weekly-tasks-list">
            <div className={`task-category-group must-do-container ${collapsedCategories.must ? 'collapsed' : ''}`}>
              <div className="category-header" onClick={() => toggleCategory('must')}>
                <h4 className="category-title">MUST DO</h4>
                <svg className={`category-chevron ${collapsedCategories.must ? '' : 'open'}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
              </div>
              
              {!collapsedCategories.must && (
                <div className="category-content animate-fade-in">
                  {mustDoWeeklyGroups.length === 0 ? (
                    <p className="empty-category">No high priority tasks.</p>
                  ) : (
                    mustDoWeeklyGroups.map(group => (
                      <div key={`must-${group.milestoneId}`} className="milestone-subgroup" style={{ marginBottom: '16px' }}>
                        <div className="subgroup-milestone-label" style={{ fontSize: '0.6rem', fontWeight: 800, color: '#f43f5e', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', padding: '0 4px', opacity: 0.8 }}>
                          <span>{group.milestoneTitle.toUpperCase()}</span>
                          <span style={{ opacity: 0.6 }}>{group.goalTitle}</span>
                        </div>
                        {group.tasks.map(task => renderTaskCard(task, true))}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className={`task-category-group should-do-container ${collapsedCategories.should ? 'collapsed' : ''}`} style={{ marginTop: '16px' }}>
              <div className="category-header" onClick={() => toggleCategory('should')}>
                <h4 className="category-title">SHOULD DO</h4>
                <svg className={`category-chevron ${collapsedCategories.should ? '' : 'open'}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
              </div>

              {!collapsedCategories.should && (
                <div className="category-content animate-fade-in">
                  {shouldDoWeeklyGroups.length === 0 ? (
                    <p className="empty-category">No secondary tasks scheduled.</p>
                  ) : (
                    shouldDoWeeklyGroups.map(group => (
                      <div key={`should-${group.milestoneId}`} className="milestone-subgroup" style={{ marginBottom: '16px' }}>
                        <div className="subgroup-milestone-label" style={{ fontSize: '0.6rem', fontWeight: 800, color: '#0ea5e9', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', padding: '0 4px', opacity: 0.8 }}>
                          <span>{group.milestoneTitle.toUpperCase()}</span>
                          <span style={{ opacity: 0.6 }}>{group.goalTitle}</span>
                        </div>
                        {group.tasks.map(task => renderTaskCard(task, true))}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {totalWeeklyCount > 0 && (
              <div className="actions-summary-card glass-card">
                <div className="summary-info">
                  <span className="summary-count">{completedWeeklyCount} of {totalWeeklyCount} completed</span>
                  <span className="summary-percent">{Math.round((completedWeeklyCount / totalWeeklyCount) * 100)}%</span>
                </div>
                <div className="summary-progress-bar">
                  <div className="summary-progress-fill" style={{ width: `${(completedWeeklyCount / totalWeeklyCount) * 100}%` }}></div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="daily-focus-list">
            <h4 className="category-title">TODAY'S TARGETS</h4>
            {todayTasks.length === 0 ? (
              <p className="empty-state">No actions scheduled for today.</p>
            ) : (
              <>
                {todayTasks.map(task => renderTaskCard(task))}
                <div className="actions-summary-card glass-card" style={{ marginTop: '32px' }}>
                  <div className="summary-info">
                    <span className="summary-count">{todayTasks.filter(t => t.completed).length} of {todayTasks.length} completed</span>
                    <span className="summary-percent">{Math.round((todayTasks.filter(t => t.completed).length / todayTasks.length) * 100)}%</span>
                  </div>
                  <div className="summary-progress-bar">
                    <div 
                      className="summary-progress-fill" 
                      style={{ width: `${(todayTasks.filter(t => t.completed).length / todayTasks.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <button className="fab-btn-teal" onClick={() => setIsAddingGlobalTask(true)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>

      {editingTask && (
        <div className="modal-overlay" onClick={() => setEditingTask(null)}>
          <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Edit Action</h3><button className="close-modal" onClick={() => setEditingTask(null)}>&times;</button></div>
            <form onSubmit={handleUpdateTask} className="task-form">
              <div className="form-group"><label>Action Title</label><input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required/></div>
              <div className="form-group"><label>Priority</label><select value={editForm.priority} onChange={e => setEditForm({ ...editForm, priority: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}><option value="High">Must Do 🔴</option><option value="Medium">Should Do 🔵</option><option value="Low">Low Priority</option></select></div>
              <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setEditingTask(null)}>Cancel</button><button type="submit" className="primary-btn">Save</button></div>
            </form>
          </div>
        </div>
      )}

      {isAddingGlobalTask && (
        <div className="modal-overlay" onClick={() => setIsAddingGlobalTask(false)}>
          <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>New Action</h3><button className="close-modal" onClick={() => setIsAddingGlobalTask(false)}>&times;</button></div>
            <form onSubmit={handleGlobalTaskSubmit} className="task-form">
               <div className="form-group"><label>Achievement</label><select value={globalTaskForm.goalId} onChange={e => setGlobalTaskForm({ ...globalTaskForm, goalId: e.target.value, milestoneId: '' })} required><option value="">Select Achievement...</option>{goals.map(g => (<option key={g.id} value={g.id}>{g.title}</option>))}</select></div>
               {globalTaskForm.goalId && (<div className="form-group"><label>Milestone</label><select value={globalTaskForm.milestoneId} onChange={e => setGlobalTaskForm({ ...globalTaskForm, milestoneId: e.target.value })} required><option value="">Select Milestone...</option>{goals.find(g => g.id === globalTaskForm.goalId)?.milestones.map(m => (<option key={m.id} value={m.id}>{m.title}</option>))}</select></div>)}
               <div className="form-group"><label>Action Title</label><input type="text" placeholder="What's the next step?" value={globalTaskForm.title} onChange={e => setGlobalTaskForm({ ...globalTaskForm, title: e.target.value })} required/></div>
               <div className="form-group"><label>Priority</label><select value={globalTaskForm.priority} onChange={e => setGlobalTaskForm({ ...globalTaskForm, priority: e.target.value })}><option value="High">Must Do</option><option value="Medium">Should Do</option></select></div>
               <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setIsAddingGlobalTask(false)}>Cancel</button><button type="submit" className="primary-btn">Create</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionsView;
