import React, { useState } from 'react';
import { useStore } from '../lib/store';
import './PriorityView.css';

const PriorityView = () => {
  const { goals, updateTask, toggleTask } = useStore();
  
  const [isThisWeekExpanded, setIsThisWeekExpanded] = useState(false);

  // Date logic
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const currentDay = todayDate.getDay() || 7; 
  const startOfWeek = new Date(todayDate);
  startOfWeek.setDate(todayDate.getDate() - (currentDay - 1)); 
  startOfWeek.setHours(0,0,0,0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); 
  endOfWeek.setHours(23,59,59,999);

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

  // --- Streak Calculation ---
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
  while(completedDateStrings.includes(loopDate.toLocaleDateString('en-CA'))) {
     currentStreak++;
     loopDate.setDate(loopDate.getDate() - 1);
  }

  // --- Bucketing ---
  const overdue = [];
  const thisWeekTasks = [];
  const upNext = [];
  const todayFocus = [];

  allTasks.forEach(t => {
     if (!t.scheduledDate) return;
     const tDate = new Date(t.scheduledDate);
     tDate.setHours(0,0,0,0);
     
     const completedToday = t.completed && t.completedAt && (new Date(t.completedAt).toLocaleDateString('en-CA') === todayDate.toLocaleDateString('en-CA'));
     
     // 1. THIS WEEK logic (includes completed)
     if (tDate >= startOfWeek && tDate <= endOfWeek) {
        thisWeekTasks.push(t);
     }
     
     // 2. TODAY'S FOCUS logic
     if (t.isPriorityFocus || completedToday) {
        todayFocus.push(t);
     }

     // 3. OVERDUE and UP NEXT (only incomplete)
     if (!t.completed) {
        if (tDate < todayDate) overdue.push(t);
        else if (tDate > endOfWeek) upNext.push(t);
     }
  });

  overdue.sort((a,b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  thisWeekTasks.sort((a,b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  thisWeekTasks.sort((a,b) => (a.completed === b.completed ? 0 : a.completed ? -1 : 1)); 

  todayFocus.sort((a,b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  todayFocus.sort((a,b) => (a.completed === b.completed ? 0 : a.completed ? -1 : 1));

  const incompleteFocusCount = todayFocus.filter(t => !t.completed).length;

  const handleToggle = (item, e) => {
    e?.stopPropagation();
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

  const handleToggleFocus = (item, e) => {
    e?.stopPropagation();
    const newValue = !item.isPriorityFocus;
    if (newValue && incompleteFocusCount >= 3) {
      alert("Focus full! Today's Focus can only have max 3 actions. Un-swap one first.");
      return;
    }

    if (item.type === 'result') {
      updateTask(item.goalId, item.milestoneId, item.id, { isPriorityFocus: newValue });
    } else {
      const g = goals.find(g => g.id === item.goalId);
      const ms = g?.milestones.find(m => m.id === item.milestoneId);
      const parentResult = ms?.tasks.find(r => r.id === item.resultId);
      if (parentResult) {
        const newSubtasks = parentResult.subtasks.map(s =>
          s.id === item.id ? { ...s, isPriorityFocus: newValue } : s
        );
        updateTask(item.goalId, item.milestoneId, item.resultId, { subtasks: newSubtasks });
      }
    }
  };

  const headerDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(todayDate);
  const maxOverdue = 3;
  const overdueRender = overdue.slice(0, maxOverdue);

  const weeklyTotal = thisWeekTasks.length;
  const displayTotal = weeklyTotal === 0 ? 5 : weeklyTotal; 
  const weeklyCompleted = thisWeekTasks.filter(t => t.completed).length;

  return (
    <div className="priority-view safe-area animate-fade-in">
       {/* Floating Pulse Widget kept as requested */}
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
          
          <div className="weekly-pulse-card">
             <span className="pulse-text">This week — {weeklyCompleted} of {displayTotal} steps done</span>
             <div className="pulse-dots">
                {Array.from({length: Math.min(displayTotal, 20)}).map((_, i) => (
                   <span key={i} className={`pulse-dot ${i < weeklyCompleted ? 'filled' : ''}`}></span>
                ))}
             </div>
          </div>

          {/* OVERDUE */}
          <div className="priority-section overdue">
            <div className="priority-section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="dot"></span> OVERDUE
              </div>
              <span className="header-count-alert">{overdue.length} total</span>
            </div>
            
            {overdue.length > 0 ? (
              <>
                <div className="priority-list">
                  {overdueRender.map((t, idx) => (
                    <div key={t.id} className="priority-card overdue" onClick={(e) => handleToggle(t, e)}>
                      <div className="priority-radio"></div>
                      <div className="priority-content">
                        <h4 className="priority-title">{t.title}</h4>
                        <div className="priority-meta-row">
                          <span className="priority-meta">
                            {t.pillarTitle} · {formatDate(t.scheduledDate, true)}
                            {t.isPriorityFocus && <span className="highlight-tag"> · focused</span>}
                          </span>
                          {!t.isPriorityFocus && <span className="reset-delete-btn" onClick={(e)=>{e.stopPropagation(); handleToggleFocus(t, e)}}>focus ⇡</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {overdue.length > maxOverdue && (
                  <div className="show-more-link">
                    Show {overdue.length - maxOverdue} more overdue steps ›
                  </div>
                )}
              </>
            ) : (
                <div className="priority-card completed-blank">
                  All caught up here!
                </div>
            )}
          </div>

          {/* TODAY'S FOCUS */}
          <div className="priority-section due-week">
            <div className="priority-section-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="dot" style={{background: '#b45309'}}></span> TODAY'S FOCUS
              </div>
              <span className="header-count">{todayFocus.filter(t => t.completed).length} of {todayFocus.length} done</span>
            </div>
            {todayFocus.length > 0 ? (
              <div className="priority-list">
                {todayFocus.map(t => (
                  <div key={t.id} className={`priority-card due-week ${t.completed ? 'completed' : ''}`} onClick={(e) => handleToggle(t, e)}>
                    <div className="priority-radio">
                       {t.completed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>}
                    </div>
                    <div className="priority-content">
                      <h4 className="priority-title">{t.title}</h4>
                      <div className="priority-meta-row">
                        <span className="priority-meta">
                          {t.pillarTitle} · {t.completed ? 'done today' : formatDate(t.scheduledDate, false)}
                        </span>
                        {!t.completed && (
                           <span className="swap-text clickable" onClick={(e) => handleToggleFocus(t, e)}>swap ⇆</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
               <div className="priority-card completed-blank">
                  Nothing specifically queued for today. Use 'focus ⇡' to add items!
               </div>
            )}
          </div>

          {/* THIS WEEK COLLAPSIBLE */}
          <div className="priority-section this-week-section">
            <div 
              className="priority-section-header clickable" 
              onClick={() => setIsThisWeekExpanded(!isThisWeekExpanded)}
              style={{ marginBottom: isThisWeekExpanded ? '12px' : '0' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#14b8a6' }}>
                <span className="dot" style={{background: '#14b8a6'}}></span> THIS WEEK
                <div className="mini-pulse-dots" style={{ marginLeft: '6px' }}>
                  {Array.from({length: Math.min(displayTotal, 7)}).map((_, i) => (
                    <span key={i} className={`mini-dot ${i < weeklyCompleted ? 'filled' : ''}`}></span>
                  ))}
                </div>
              </div>
              <span className="header-count">{weeklyCompleted} of {displayTotal} done ›</span>
            </div>

            {isThisWeekExpanded && (
              <div className="this-week-expanded-tray animate-slide-down">
                <div className="tray-instruction">↑ Tap "{weeklyCompleted} of {displayTotal} done ›" to collapse</div>
                
                <div className="tray-list">
                  {thisWeekTasks.map(t => {
                    if (t.completed) {
                      return (
                        <div key={t.id} className="tray-item completed" onClick={(e) => handleToggle(t, e)}>
                          <div className="tray-mini-check">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                          </div>
                          <span className="tray-title">{t.title}</span>
                        </div>
                      );
                    }

                    if (t.isPriorityFocus) {
                      return (
                        <div key={t.id} className="tray-item focused" onClick={(e) => handleToggle(t, e)}>
                          <div className="priority-radio" style={{ borderColor: '#d97706', width: '18px', height: '18px' }}></div>
                          <div className="tray-content">
                            <h4 className="tray-title" style={{ fontSize: '0.9rem', margin: 0, color: '#1e293b' }}>{t.title}</h4>
                            <span className="tray-meta" style={{ fontSize: '0.75rem', color: '#92400e' }}>
                               Due {formatDate(t.scheduledDate, false).replace('due ', '')} · <span className="highlight-text" style={{fontWeight: 700}}>in today's focus</span>
                            </span>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={t.id} className="tray-item normal" onClick={(e) => handleToggle(t, e)}>
                         <div className="priority-radio" style={{ width: '18px', height: '18px' }}></div>
                         <div className="tray-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="tray-title" style={{ fontSize: '0.85rem', color: '#64748b' }}>{t.title}</span>
                            <span className="add-focus-btn clickable" onClick={(e) => handleToggleFocus(t, e)}>focus ⇡</span>
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* UP NEXT */}
          <div className="priority-section up-next">
            <div className="priority-section-header no-margin">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                <span className="dot" style={{background: '#94a3b8'}}></span> UP NEXT
              </div>
              <span className="header-count">{upNext.length} steps ›</span>
            </div>
          </div>
          
       </div>
    </div>
  );
};

export default PriorityView;
