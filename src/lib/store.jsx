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

  const addMilestone = (goalId, title) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: [
            ...goal.milestones,
            {
              id: crypto.randomUUID(),
              title,
              tasks: [],
              createdAt: new Date().toISOString()
            }
          ]
        };
      }
      return goal;
    }));
  };

  const addTask = (goalId, milestoneId, title, value = 0, scheduledDate) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: goal.milestones.map(ms => {
            if (ms.id === milestoneId) {
              return {
                ...ms,
                tasks: [
                  ...ms.tasks,
                  {
                    id: crypto.randomUUID(),
                    title,
                    value: Number(value) || 0,
                    scheduledDate,
                    completed: false,
                    createdAt: new Date().toISOString()
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const value = {
    goals,
    notes,
    activeTab,
    setActiveTab,
    addGoal,
    addMilestone,
    addTask,
    toggleTask,
    addNote,
    theme,
    toggleTheme,
    updateGoal,
    deleteGoal,
    addMetric,
    updateMetricValue,
    addMetricEntry
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};
