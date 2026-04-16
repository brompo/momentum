import React, { useState } from 'react';
import { useStore } from '../lib/store';
import './MilestonesView.css';

const MilestonesView = () => {
  const { goals, pillars, setSelectedGoalId, setSelectedMilestoneId, setActiveTab, toggleMilestoneCompleted, addTask, toggleTask } = useStore();
  const [collapsedPillars, setCollapsedPillars] = useState({});
  const [collapsedMilestones, setCollapsedMilestones] = useState({});
  const [pendingRemovalIds, setPendingRemovalIds] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('Active'); // 'Active' or 'Completed'

  const [activeMilestoneId, setActiveMilestoneId] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', value: '1', scheduledDate: new Date().toISOString().split('T')[0] + 'T09:00', priority: 'Low', subtasks: [] });

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

  const handleToggleCompletion = (goalId, milestoneId) => {
    toggleMilestoneCompleted(goalId, milestoneId);
    if (activeSubTab === 'Active') {
      setPendingRemovalIds(prev => [...prev, milestoneId]);
      setTimeout(() => {
        setPendingRemovalIds(prev => prev.filter(id => id !== milestoneId));
      }, 5000); // 5s grace
    }
  };

  const toggleMilestoneCollapse = (id, e) => {
    if (e) e.stopPropagation();
    setCollapsedMilestones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddTask = (e, goalId, milestoneId) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    addTask(goalId, milestoneId, taskForm.title, taskForm.value || '1', taskForm.scheduledDate, taskForm.priority);
    setTaskForm({ title: '', value: '1', scheduledDate: new Date().toISOString().split('T')[0] + 'T09:00', priority: 'Low', subtasks: [] });
    setActiveMilestoneId(null);
  };

  const handleMilestoneClick = (goalId, milestoneId) => {
    // If it's the checkbox or +/- button, we handled it.
    // Otherwise, we navigate. 
    // Actually, let's just use the chevron for collapse.
  };

  const togglePillar = (id) => {
    setCollapsedPillars(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getActiveMilestones = () => {
    return (goals || []).flatMap(goal =>
      (goal.milestones || [])
        .filter(ms => {
          if (ms.active !== true) return false;
          if (activeSubTab === 'Active') {
            return (ms.completed !== true || pendingRemovalIds.includes(ms.id));
          } else {
            return (ms.completed === true);
          }
        })
        .map(ms => ({
          ...ms,
          goalTitle: goal.title,
          goalId: goal.id,
          pillarId: goal.pillarId || 'personal'
        }))
    );
  };

  const activeMilestones = getActiveMilestones();

  return (
    <div className="milestones-view-modern safe-area animate-fade-in">
      <div className="milestones-modern-header">
        <h1>Milestones</h1>

        <div className="milestones-tab-capsule">
          <button
            className={`milestone-subtab ${activeSubTab === 'Active' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('Active')}
          >
            Active
          </button>
          <button
            className={`milestone-subtab ${activeSubTab === 'Completed' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('Completed')}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="pillars-container" style={{ paddingTop: '10px' }}>
        {pillars.map(pillar => {
          const pillarMilestones = activeMilestones.filter(ms => ms.pillarId === pillar.id);
          const isCollapsed = collapsedPillars[pillar.id];

          if (pillarMilestones.length === 0) return null;

          return (
            <div key={pillar.id} className="pillar-group" style={{ marginBottom: '12px' }}>
              <div
                className="pillar-group-header"
                onClick={() => togglePillar(pillar.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                  borderBottom: '1px solid rgba(0,0,0,0.03)',
                  paddingBottom: '4px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{pillar.icon}</span>
                <h2 style={{ fontSize: '0.7rem', fontWeight: 900, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1 }}>{pillar.title}</h2>
                <svg
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="3"
                  style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {!isCollapsed && (
                <div className="goals-vertical-stack" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {Object.values(pillarMilestones.reduce((acc, ms) => {
                    if (!acc[ms.goalId]) acc[ms.goalId] = { id: ms.goalId, title: ms.goalTitle, milestones: [] };
                    acc[ms.goalId].milestones.push(ms);
                    return acc;
                  }, {})).map(goalGroup => (
                    <div key={goalGroup.id} className="goal-milestone-group">
                      <div
                        className="milestone-goal-group-header"
                        onClick={() => {
                          setSelectedGoalId(goalGroup.id);
                          setActiveTab('Goals');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '8px',
                          color: '#0d9488',
                          cursor: 'pointer',
                          padding: '0 4px'
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        <h3 style={{ fontSize: '0.75rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.02em' }}>{goalGroup.title}</h3>
                      </div>

                      <div className="milestones-modern-grid" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {goalGroup.milestones.map(ms => {
                          const completedTasks = (ms.tasks || []).filter(t => t.completed);
                          const pendingTasks = (ms.tasks || []).filter(t => !t.completed);
                          const totalCount = (ms.tasks || []).length;
                          const isMsCollapsed = collapsedMilestones[ms.id] !== false;

                          return (
                            <div
                              key={ms.id}
                              className={`milestone-modern-card glass-card ${ms.completed ? 'is-completed' : ''} ${ms.completed && pendingRemovalIds.includes(ms.id) ? 'graduating' : ''}`}
                              style={{ padding: '10px 14px', borderRadius: '14px', position: 'relative' }}
                            >
                              <div
                                className={`milestone-active-check ${ms.completed ? 'checked' : ''}`}
                                onClick={(e) => handleToggleCompletion(ms.goalId, ms.id)}
                                style={{
                                  position: 'absolute',
                                  top: '10px',
                                  right: '12px',
                                  width: '20px',
                                  height: '20px',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '50%',
                                  background: ms.completed ? '#0d9488' : 'white',
                                  borderColor: ms.completed ? '#0d9488' : '#cbd5e1',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  zIndex: 10,
                                  transition: 'all 0.2s'
                                }}
                              >
                                {ms.completed && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                              </div>

                              <div className="milestone-content-header" onClick={(e) => toggleMilestoneCollapse(ms.id, e)} style={{ cursor: 'pointer' }}>
                                <h3 className="milestone-title-text" style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: '8px', paddingRight: '24px', color: ms.completed ? '#94a3b8' : '#1e293b' }}>{ms.title}</h3>

                                <div className="milestone-modern-status" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span className="status-badge done" style={{ background: '#f0fdf4', color: '#10b981', padding: '3px 8px', fontSize: '0.65rem', fontWeight: 800, borderRadius: '99px' }}>
                                    {completedTasks.length}/{totalCount} Done
                                  </span>
                                  <span className={`status-badge priority ${(ms.priority || 'Low').toLowerCase()}`} style={{ padding: '3px 8px', fontSize: '0.65rem', fontWeight: 800, borderRadius: '99px' }}>
                                    {(ms.priority || 'Low').toUpperCase()}
                                  </span>
                                  <div style={{ flex: 1 }} />
                                  <svg
                                    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"
                                    style={{ transform: isMsCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}
                                  >
                                    <path d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>

                              {!isMsCollapsed && (
                                <div className="milestone-tasks-tray animate-fade-in" style={{ borderTop: '1px solid rgba(0,0,0,0.03)', paddingTop: '10px', marginTop: '6px' }}>
                                  <div className="milestone-tasks-list" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '10px' }}>
                                    {pendingTasks.map(task => (
                                      <div key={task.id} className="ms-task-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
                                        <div
                                          onClick={() => toggleTask(ms.goalId, ms.id, task.id)}
                                          style={{ width: '14px', height: '14px', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', flex: 1 }}>{task.title}</span>
                                        {task.scheduledDate && (
                                          <span className={`task-date-badge ${getDateStatusClass(task.scheduledDate)}`} style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px' }}>
                                            {formatDateMMM(task.scheduledDate)}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                    {completedTasks.map(task => (
                                      <div key={task.id} className="ms-task-item completed" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', opacity: 0.5 }}>
                                        <div
                                          onClick={() => toggleTask(ms.goalId, ms.id, task.id)}
                                          style={{ width: '14px', height: '14px', border: '1px solid #0d9488', background: '#0d9488', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
                                        </div>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', flex: 1, textDecoration: 'line-through' }}>{task.title}</span>
                                        {task.scheduledDate && (
                                          <span className="task-date-badge past" style={{ fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px', opacity: 0.5 }}>
                                            {formatDateMMM(task.scheduledDate)}
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                  </div>

                                  {activeMilestoneId === ms.id ? (
                                    <form onSubmit={(e) => handleAddTask(e, ms.goalId, ms.id)} style={{ marginBottom: '6px' }}>
                                      <div style={{ position: 'relative' }}>
                                        <input
                                          autoFocus
                                          placeholder="Enter result..."
                                          value={taskForm.title}
                                          onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                                          style={{ width: '100%', padding: '8px 40px 8px 10px', border: '1.5px solid #0d9488', borderRadius: '10px', fontSize: '0.8rem', outline: 'none' }}
                                        />
                                        <div style={{ position: 'absolute', right: '10px', top: '8px', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2.5" style={{ pointerEvents: 'none' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                          <input
                                            id={`ms-date-${ms.id}`}
                                            type="date"
                                            style={{
                                              position: 'absolute',
                                              top: 0,
                                              left: 0,
                                              width: '100%',
                                              height: '100%',
                                              opacity: 0,
                                              cursor: 'pointer',
                                              fontSize: '16px' // Prevents zoom on iOS
                                            }}
                                            value={taskForm.scheduledDate?.split('T')[0] || ''}
                                            onChange={(e) => setTaskForm({ ...taskForm, scheduledDate: e.target.value + 'T09:00' })}
                                          />
                                        </div>
                                      </div>
                                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px', justifyContent: 'flex-end' }}>
                                        <button type="button" onClick={() => setActiveMilestoneId(null)} style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', background: 'none', border: 'none' }}>Cancel</button>
                                        <button type="submit" style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0d9488', background: 'none', border: 'none' }}>Add Result</button>
                                      </div>
                                    </form>
                                  ) : (
                                    <button
                                      className="add-task-btn-v2"
                                      onClick={() => setActiveMilestoneId(ms.id)}
                                      style={{ width: '100%', padding: '8px', border: '1px dashed #cbd5e1', borderRadius: '10px', background: 'none', color: '#64748b', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                      + Add a result
                                    </button>
                                  )}
                                </div>
                              )}

                              {isMsCollapsed && totalCount > 0 && (
                                <div className="progress-mini-rail" style={{ height: '3px', marginTop: '6px' }}>
                                  <div
                                    className="progress-mini-fill"
                                    style={{ width: `${(completedTasks.length / totalCount) * 100}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {activeMilestones.length === 0 && (
          <div className="empty-state-modern">
            <p>No active milestones. Pin them from your achievements to see them here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestonesView;
