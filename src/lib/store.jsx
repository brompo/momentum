import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  // Initialize state from localStorage
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('ga_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('ga_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState('Goals'); // Default tab
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [previousTab, setPreviousTab] = useState(null);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('ga_theme');
    return saved || 'dark';
  });

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('ga_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('ga_notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('ga_theme', theme);
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Actions
  const addGoal = (title, note = '', startDate = '', endDate = '', targetNumber = '') => {
    const newGoal = {
      id: crypto.randomUUID(),
      title,
      note,
      startDate,
      endDate,
      targetNumber,
      year: new Date().getFullYear(),
      milestones: [],
      metrics: [],
      createdAt: new Date().toISOString()
    };
    setGoals(prev => [...prev, newGoal]);
    return newGoal;
  };

  const addMilestone = (goalId, title, priority = 'Low') => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: [
            ...goal.milestones,
            {
              id: crypto.randomUUID(),
              title,
              priority,
              tasks: [],
              createdAt: new Date().toISOString()
            }
          ]
        };
      }
      return goal;
    }));
  };

  const addTask = (goalId, milestoneId, title, value = 0, scheduledDate, priority = 'Medium', taskId = crypto.randomUUID(), parentTaskId = null, parentUpdates = {}, subtasks = []) => {
    let finalDate = scheduledDate;
    if (finalDate && !finalDate.includes('T')) {
      finalDate = finalDate + 'T09:00';
    }

    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: goal.milestones.map(ms => {
            if (ms.id === milestoneId) {
              const updatedTasks = (ms.tasks || []).map(t => 
                t.id === parentTaskId ? { ...t, followUpTaskId: taskId, ...parentUpdates } : t
              );
              return {
                ...ms,
                tasks: [
                  ...updatedTasks,
                  {
                    id: taskId,
                    title,
                    value: Number(value) || 0,
                    scheduledDate: finalDate,
                    priority,
                    completed: false,
                    createdAt: new Date().toISOString(),
                    subtasks: subtasks || []
                  }
                ]
              };
            }
            return ms;
          })
        };
      }
      return goal;
    }));
  };

  const toggleTask = (goalId, milestoneId, taskId) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: goal.milestones.map(ms => {
            if (ms.id === milestoneId) {
              return {
                ...ms,
                tasks: ms.tasks.map(task => 
                  task.id === taskId ? { ...task, completed: !task.completed } : task
                )
              };
            }
            return ms;
          })
        };
      }
      return goal;
    }));
  };

  const deleteTask = (goalId, milestoneId, taskId) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: goal.milestones.map(ms => {
            if (ms.id === milestoneId) {
              return {
                ...ms,
                tasks: ms.tasks.filter(task => task.id !== taskId)
              };
            }
            return ms;
          })
        };
      }
      return goal;
    }));
  };

  const updateTask = (goalId, milestoneId, taskId, updates) => {
    let finalUpdates = { ...updates };
    if (finalUpdates.scheduledDate && !finalUpdates.scheduledDate.includes('T')) {
      finalUpdates.scheduledDate = finalUpdates.scheduledDate + 'T09:00';
    }

    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: (goal.milestones || []).map(ms => {
            if (ms.id === milestoneId) {
              return {
                ...ms,
                tasks: (ms.tasks || []).map(task => 
                  task.id === taskId ? { ...task, ...finalUpdates } : task
                )
              };
            }
            return ms;
          })
        };
      }
      return goal;
    }));
  };

  const addSubtask = (goalId, milestoneId, taskId, title) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: (goal.milestones || []).map(ms => {
            if (ms.id === milestoneId) {
              return {
                ...ms,
                tasks: (ms.tasks || []).map(task => 
                  task.id === taskId ? { 
                    ...task, 
                    subtasks: [
                      ...(task.subtasks || []), 
                      { id: crypto.randomUUID(), title, completed: false }
                    ] 
                  } : task
                )
              };
            }
            return ms;
          })
        };
      }
      return goal;
    }));
  };

  const updateSubtaskTitle = (goalId, milestoneId, taskId, subtaskId, newTitle) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: (goal.milestones || []).map(ms => {
            if (ms.id === milestoneId) {
              return {
                ...ms,
                tasks: (ms.tasks || []).map(task => 
                  task.id === taskId ? { 
                    ...task, 
                    subtasks: (task.subtasks || []).map(sub => 
                      sub.id === subtaskId ? { ...sub, title: newTitle } : sub
                    )
                  } : task
                )
              };
            }
            return ms;
          })
        };
      }
      return goal;
    }));
  };

  const toggleSubtask = (goalId, milestoneId, taskId, subtaskId) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: (goal.milestones || []).map(ms => {
            if (ms.id === milestoneId) {
              return {
                ...ms,
                tasks: (ms.tasks || []).map(task => 
                  task.id === taskId ? { 
                    ...task, 
                    subtasks: (task.subtasks || []).map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s) 
                  } : task
                )
              };
            }
            return ms;
          })
        };
      }
      return goal;
    }));
  };

  const deleteSubtask = (goalId, milestoneId, taskId, subtaskId) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: (goal.milestones || []).map(ms => {
            if (ms.id === milestoneId) {
              return {
                ...ms,
                tasks: (ms.tasks || []).map(task => 
                  task.id === taskId ? { 
                    ...task, 
                    subtasks: (task.subtasks || []).filter(s => s.id !== subtaskId) 
                  } : task
                )
              };
            }
            return ms;
          })
        };
      }
      return goal;
    }));
  };

  const addNote = (milestoneId, content) => {
    const newNote = {
      id: crypto.randomUUID(),
      milestoneId,
      content,
      timestamp: new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);
  };

  const updateGoal = (goalId, updates) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    ));
  };

  const deleteGoal = (goalId) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const addMetric = (goalId, title, targetValue) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          metrics: [
            ...(goal.metrics || []),
            {
              id: crypto.randomUUID(),
              title,
              currentValue: 0,
              targetValue: Number(targetValue) || 0,
              entries: [],
              createdAt: new Date().toISOString()
            }
          ]
        };
      }
      return goal;
    }));
  };

  const updateMetricValue = (goalId, metricId, valueDelta) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          metrics: (goal.metrics || []).map(m => {
            if (m.id === metricId) {
              const newVal = Math.max(0, (m.currentValue || 0) + valueDelta);
              return { ...m, currentValue: m.targetValue ? Math.min(newVal, m.targetValue) : newVal };
            }
            return m;
          })
        };
      }
      return goal;
    }));
  };

  const addMetricEntry = (goalId, metricId, { text, date, value }) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          metrics: (goal.metrics || []).map(m => {
            if (m.id === metricId) {
              const numericValue = Number(value) || 0;
              const newEntries = [
                ...(m.entries || []),
                {
                  id: crypto.randomUUID(),
                  text: text || '',
                  date: date || new Date().toISOString().split('T')[0],
                  value: numericValue,
                  createdAt: new Date().toISOString()
                }
              ];
              const newVal = (m.currentValue || 0) + numericValue;
              return {
                ...m,
                entries: newEntries,
                currentValue: m.targetValue ? Math.min(newVal, m.targetValue) : newVal
              };
            }
            return m;
          })
        };
      }
      return goal;
    }));
  };

  const deleteMetricEntry = (goalId, metricId, entryId) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          metrics: goal.metrics.map(m => {
            if (m.id === metricId) {
              const entry = m.entries.find(e => e.id === entryId);
              const decrementValue = entry ? Number(entry.value) : 0;
              return {
                ...m,
                currentValue: Math.max(0, (m.currentValue || 0) - decrementValue),
                entries: m.entries.filter(e => e.id !== entryId)
              };
            }
            return m;
          })
        };
      }
      return goal;
    }));
  };

  const updateMetricEntry = (goalId, metricId, entryId, updates) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          metrics: goal.metrics.map(m => {
            if (m.id === metricId) {
              const entry = m.entries.find(e => e.id === entryId);
              const oldValue = entry ? Number(entry.value) : 0;
              const newValue = updates.value !== undefined ? Number(updates.value) : oldValue;
              const valueDelta = newValue - oldValue;
              const newVal = (m.currentValue || 0) + valueDelta;
              
              return {
                ...m,
                currentValue: Math.max(0, m.targetValue ? Math.min(newVal, m.targetValue) : newVal),
                entries: (m.entries || []).map(e => e.id === entryId ? { ...e, ...updates, value: newValue } : e)
              };
            }
            return m;
          })
        };
      }
      return goal;
    }));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const value = {
    goals,
    notes,
    activeTab,
    setActiveTab,
    selectedGoalId,
    setSelectedGoalId,
    selectedMilestoneId,
    setSelectedMilestoneId,
    previousTab,
    setPreviousTab,
    addGoal,
    addMilestone,
    addTask,
    toggleTask,
    addSubtask,
    updateSubtaskTitle,
    toggleSubtask,
    deleteSubtask,
    addNote,
    theme,
    toggleTheme,
    updateGoal,
    deleteGoal,
    addMetric,
    updateMetricValue,
    addMetricEntry,
    deleteTask,
    updateTask,
    deleteMetricEntry,
    updateMetricEntry
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};
