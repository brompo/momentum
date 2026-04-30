import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import './MilestoneDetailView.css';

const MilestoneDetailView = ({ goalId, milestoneId, onBack }) => {
  const { goals, updateMilestone, addTask, toggleTask, deleteTask, updateTask, deleteMilestone, promoteTaskToNext, moveTask } = useStore();

  const goal = goals.find(g => g.id === goalId);
  const milestone = goal?.milestones?.find(m => m.id === milestoneId);

  const [editForm, setEditForm] = useState({
    title: '',
    priority: 'Low',
    note: ''
  });

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null); // For 'new' task form
  const [editingTaskId, setEditingTaskId] = useState(null); // For editing existing tasks
  const [taskForm, setTaskForm] = useState({
    title: '',
    scheduledDate: '',
    isCritical: false
  });
  const [taskEditForm, setTaskEditForm] = useState({
    title: '',
    scheduledDate: '',
    isCritical: false
  });

  useEffect(() => {
    window.scrollTo(0, 0); // Reset scroll to top
  }, []);

  useEffect(() => {
    if (milestone) {
      setEditForm({
        title: milestone.title,
        priority: milestone.priority || 'Low',
        note: milestone.note || ''
      });
    }
  }, [milestone]);

  if (!goal || !milestone) {
    return (
      <div className="milestone-detail-view safe-area">
        <button onClick={onBack} className="back-btn-simple">← Back to Goal</button>
        <p>Milestone not found.</p>
      </div>
    );
  }

  const handleUpdate = (updates) => {
    updateMilestone(goalId, milestoneId, updates);
  };

  const handleNoteBlur = () => {
    handleUpdate({ note: editForm.note });
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (taskForm.title.trim()) {
      addTask(goalId, milestoneId, taskForm.title, 1, taskForm.scheduledDate, milestone.priority, taskForm.isCritical);
      setTaskForm({ title: '', scheduledDate: '', isCritical: false });
      setActiveTaskId(null);
    }
  };

  const handleStartEditTask = (task, e) => {
    e.stopPropagation();
    setTaskEditForm({
      title: task.title,
      scheduledDate: task.scheduledDate || '',
      isCritical: !!task.isCritical
    });
    setEditingTaskId(task.id);
  };

  const handleSaveEditTask = (e, taskId) => {
    e && e.preventDefault();
    if (taskEditForm.title.trim()) {
      updateTask(goalId, milestoneId, taskId, {
        title: taskEditForm.title,
        scheduledDate: taskEditForm.scheduledDate,
        isCritical: taskEditForm.isCritical
      });
      setEditingTaskId(null);
    }
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Delete this step?')) {
      deleteTask(goalId, milestoneId, taskId);
      setEditingTaskId(null);
    }
  };

  const renderTaskEditForm = (task) => {
    return (
      <form onSubmit={(e) => handleSaveEditTask(e, task.id)} className="inline-task-edit-form">
        <textarea
          autoFocus
          placeholder="Step title..."
          value={taskEditForm.title}
          onChange={e => {
            setTaskEditForm({ ...taskEditForm, title: e.target.value });
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          className="inline-edit-textarea"
          rows="1"
          onFocus={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
        />
        <div className="inline-edit-actions">
          <div className="inline-edit-meta-inputs">
            <input
              type="date"
              value={taskEditForm.scheduledDate ? taskEditForm.scheduledDate.split('T')[0] : ''}
              onChange={e => setTaskEditForm({ ...taskEditForm, scheduledDate: e.target.value ? e.target.value + 'T09:00' : '' })}
              className="inline-edit-date"
            />

            <label className={`critical-toggle-label ${taskEditForm.isCritical ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={taskEditForm.isCritical}
                onChange={e => setTaskEditForm({ ...taskEditForm, isCritical: e.target.checked })}
              />
              Critical
            </label>
          </div>

          <div className="inline-edit-button-group">
            <button type="button" onClick={() => handleDeleteTask(task.id)} className="edit-btn-delete" title="Delete Step">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
            </button>
            <button 
              type="button" 
              onClick={() => {
                promoteTaskToNext(goalId, milestoneId, task.id);
                setEditingTaskId(null);
              }} 
              className="edit-btn-promote"
            >
              NEXT STEP ↑
            </button>
            <div className="edit-btn-move-group">
              <button 
                type="button" 
                onClick={() => moveTask(goalId, milestoneId, task.id, -1)} 
                className="edit-btn-move"
                title="Move Up"
              >
                ↑
              </button>
              <button 
                type="button" 
                onClick={() => moveTask(goalId, milestoneId, task.id, 1)} 
                className="edit-btn-move"
                title="Move Down"
              >
                ↓
              </button>
            </div>
            <button type="button" onClick={() => setEditingTaskId(null)} className="edit-btn-cancel">Cancel</button>
            <button type="submit" className="edit-btn-save">Save</button>
          </div>
        </div>
      </form>
    );
  };

  const handleDeleteMilestone = () => {
    if (window.confirm('Are you sure you want to delete this milestone? All its steps will be lost.')) {
      deleteMilestone(goalId, milestoneId);
      onBack();
    }
  };

  const allTasks = milestone.tasks || [];
  const completedTasks = allTasks.filter(t => t.completed);
  const pendingTasks = allTasks.filter(t => !t.completed);
  const progress = allTasks.length > 0
    ? Math.round((completedTasks.length / allTasks.length) * 100)
    : 0;

  const formatDateMMM = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    } catch (e) { return dateString; }
  };

  const getPhase = (title) => {
    const parts = title.split(':');
    if (parts.length > 1) return parts[0].trim().toUpperCase();
    return null;
  };

  const getTitleWithoutPhase = (title) => {
    const parts = title.split(':');
    if (parts.length > 1) return parts.slice(1).join(':').trim();
    return title;
  };

  const isTrulyDone = milestone.completed && pendingTasks.length === 0;
  
  let msStatus = 'upcoming';
  if (isTrulyDone) {
    msStatus = 'done';
  } else if (milestone.isOneThing || milestone.inFocus) {
    msStatus = 'active';
  } else {
    msStatus = 'draft';
  }

  const activeTask = pendingTasks.length > 0 ? pendingTasks[0] : null;

  const pillarColors = {
    personal: '#10b981',
    wealth: '#f49d0d',
    growth: '#6366f1'
  };
  const themeColor = pillarColors[goal.pillarId] || '#0d9488';
  const themeColorFaint = themeColor + '14'; // ~8% opacity

  return (
    <div className="milestone-detail-view animate-fade-in" style={{ '--pillar-color': themeColor, '--pillar-color-faint': themeColorFaint }}>
      <div className="ms-detail-top-section">
        <div className="ms-detail-header-row">
          <button className="minimal-icon-btn" onClick={onBack} title="Back to Goal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          
          <div className="ms-header-goal-title">{goal.title}</div>

          <button className="minimal-icon-btn delete-ms-btn" onClick={handleDeleteMilestone} title="Delete Milestone">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
          </button>
        </div>

        {isEditingTitle ? (
          <textarea
            autoFocus
            className="ms-title-edit-textarea"
            value={editForm.title}
            onChange={e => {
              setEditForm({ ...editForm, title: e.target.value });
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            onBlur={() => {
              setIsEditingTitle(false);
              handleUpdate({ title: editForm.title });
            }}
            onFocus={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            rows="1"
          />
        ) : (
          <h1 className="ms-title-large" onClick={() => setIsEditingTitle(true)}>{milestone.title}</h1>
        )}

        <div className="ms-top-status">
          {msStatus === 'active' && <span className="ms-pill active">{milestone.isOneThing ? 'One Thing' : 'Active'}</span>}
          {msStatus === 'done' && <span className="ms-pill done">Done</span>}
          {msStatus === 'draft' && <span className="ms-pill draft">Draft</span>}
          <span className="ms-top-stats">{progress}% · {completedTasks.length} of {allTasks.length} steps done</span>
        </div>

        <div className="ms-top-bar-container">
          <div className="ms-top-bar-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="ms-timeline-body">
        {completedTasks.length > 0 && (
          <div className="timeline-header">Completed Steps</div>
        )}

        {(() => {
          const groups = [];
          completedTasks.forEach(t => {
            const p = getPhase(t.title) || 'General';
            let g = groups.find(group => group.name === p);
            if (!g) {
              g = { name: p, tasks: [] };
              groups.push(g);
            }
            g.tasks.push(t);
          });

          return groups.map((g, gIdx) => (
            <React.Fragment key={g.name}>
              {g.name !== 'General' && (
                <div className="ms-phase-separator">
                  <div className="phase-line"></div>
                  <div className="phase-label">{g.name}</div>
                </div>
              )}
              {g.tasks.map((t, tIdx) => (
                <div key={t.id} className="tl-row">
                  <div className="tl-left">
                    <div className="tl-node done clickable" onClick={(e) => { e.stopPropagation(); toggleTask(goalId, milestoneId, t.id); }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
                    </div>
                    <div className="tl-line done"></div>
                  </div>
                  <div className="tl-right">
                    {editingTaskId === t.id ? (
                      renderTaskEditForm(t)
                    ) : (
                      <>
                        <div className="tl-title" onClick={(e) => handleStartEditTask(t, e)}>{getTitleWithoutPhase(t.title)}</div>
                        <div className="tl-meta done">
                          Completed {formatDateMMM(t.scheduledDate || new Date().toISOString())}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </React.Fragment>
          ));
        })()}

        {activeTask && (
          editingTaskId === activeTask.id ? (
            <div className="tl-row">
              <div className="tl-left">
                <div className="tl-node active clickable" onClick={(e) => { e.stopPropagation(); toggleTask(goalId, milestoneId, activeTask.id); }}>
                  1
                </div>
                <div className="tl-line grey"></div>
              </div>
              <div className="tl-right">
                {renderTaskEditForm(activeTask)}
              </div>
            </div>
          ) : (
            <>
              {(() => {
                const currentPhase = getPhase(activeTask.title);
                const prevTask = completedTasks.length > 0 ? completedTasks[completedTasks.length - 1] : null;
                const prevPhase = prevTask ? getPhase(prevTask.title) : null;
                if (currentPhase && currentPhase !== prevPhase) {
                  return (
                    <div className="ms-phase-separator">
                      <div className="phase-line"></div>
                      <div className="phase-label">{currentPhase}</div>
                    </div>
                  );
                }
                return null;
              })()}
              <div className={`next-step-minimal-row ${activeTask.isCritical ? 'critical' : ''}`} onClick={(e) => handleStartEditTask(activeTask, e)}>
                <div className="ns-accent-line"></div>
                <div className="ns-minimal-content">
                  <div className="ns-minimal-header">
                    <div
                      className="ns-minimal-label"
                      onClick={(e) => { e.stopPropagation(); toggleTask(goalId, milestoneId, activeTask.id); }}
                    >
                      {activeTask.isCritical ? 'CRITICAL Next Step' : 'Next Step'}
                    </div>
                    {activeTask.scheduledDate && (
                      <div className="ns-minimal-date">{formatDateMMM(activeTask.scheduledDate)}</div>
                    )}
                  </div>
                  <div className="ns-minimal-title">{getTitleWithoutPhase(activeTask.title)}</div>
                </div>
              </div>
            </>
          )
        )}

        {pendingTasks.length > 1 && (
          <div className="timeline-header" style={{ marginTop: '8px' }}>Upcoming</div>
        )}

        {(() => {
          const upcoming = pendingTasks.slice(1);
          const phaseMap = new Map();
          
          upcoming.forEach(t => {
            const p = getPhase(t.title) || 'General';
            if (!phaseMap.has(p)) phaseMap.set(p, []);
            phaseMap.get(p).push(t);
          });

          const activePhase = activeTask ? getPhase(activeTask.title) : null;
          const sortedEntries = Array.from(phaseMap.entries()).sort(([nameA], [nameB]) => {
            if (activePhase) {
               if (nameA === activePhase) return -1;
               if (nameB === activePhase) return 1;
            }
            return 0;
          });

          return sortedEntries.map(([phaseName, tasks]) => (
            <React.Fragment key={phaseName}>
              {phaseName !== 'General' && phaseName !== activePhase && (
                <div className="ms-phase-separator">
                  <div className="phase-line"></div>
                  <div className="phase-label">{phaseName}</div>
                </div>
              )}
              {tasks.map((t) => {
                const globalIdx = pendingTasks.findIndex(pt => pt.id === t.id);
                return (
                  <div key={t.id} className="tl-row">
                    <div className="tl-left">
                      <div className="tl-node upcoming clickable" onClick={(e) => { e.stopPropagation(); toggleTask(goalId, milestoneId, t.id); }}>
                        {completedTasks.length + globalIdx + 1}
                      </div>
                      <div className="tl-line grey"></div>
                    </div>
                    <div className="tl-right">
                      {editingTaskId === t.id ? (
                        renderTaskEditForm(t)
                      ) : (
                        <>
                          <div className="tl-title-upcoming" onClick={(e) => handleStartEditTask(t, e)}>
                            {t.isCritical && <span className="critical-tag-badge mini">CRITICAL</span>}
                            {getTitleWithoutPhase(t.title)}
                          </div>

                          <div className="tl-meta upcoming" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                            {t.scheduledDate && <span style={{ fontSize: '0.75rem' }}>Target: {formatDateMMM(t.scheduledDate)}</span>}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ));
        })()}

        {/* Hidden but functional add task form */}
        <div style={{ marginTop: '32px' }}>
          {activeTaskId === 'new' ? (
            <form onSubmit={handleAddTask} style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <input
                autoFocus
                placeholder="Enter step title..."
                value={taskForm.title}
                onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                style={{ width: '100%', border: 'none', borderBottom: '2px solid #3b82f6', outline: 'none', fontSize: '16px', marginBottom: '12px' }}
              />
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input type="date" value={taskForm.scheduledDate ? taskForm.scheduledDate.split('T')[0] : ''} onChange={e => setTaskForm({ ...taskForm, scheduledDate: e.target.value ? e.target.value + 'T09:00' : '' })} style={{ fontSize: '16px', border: 'none', color: '#64748b', background: '#f8fafc', padding: '4px 8px', borderRadius: '4px' }} />

                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: taskForm.isCritical ? '#ef4444' : '#64748b', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={taskForm.isCritical}
                    onChange={e => setTaskForm({ ...taskForm, isCritical: e.target.checked })}
                  />
                  Critical
                </label>

                <div style={{ flex: 1 }}></div>

                <button type="button" onClick={() => setActiveTaskId(null)} style={{ border: 'none', background: 'none', fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>Cancel</button>
                <button type="submit" style={{ border: 'none', background: 'none', fontSize: '14px', fontWeight: 700, color: '#3b82f6' }}>Add Step</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setActiveTaskId('new')} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <span>+</span> Add a new step
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MilestoneDetailView;
