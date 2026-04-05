import React, { createContext, useContext, useState, useEffect } from 'react';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  // Initialize state from localStorage
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('ga_goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [visionStatements, setVisionStatements] = useState(() => {
    const saved = localStorage.getItem('ga_vision_statements');
    if (saved) return JSON.parse(saved);
    return { personal: '', wealth: '', growth: '' };
  });

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('ga_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState('Goals');
  const [activeActionsSubTab, setActiveActionsSubTab] = useState(() => {
    return localStorage.getItem('ga_actions_subtab') || 'Weekly Commitments';
  });
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(null);
  const [previousTab, setPreviousTab] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('ga_theme') || 'dark');

  const [pillars, setPillars] = useState(() => {
    const saved = localStorage.getItem('ga_pillars');
    return saved ? JSON.parse(saved) : [
      { id: 'personal', title: 'Personal & Health', icon: '🌱', subcategories: [] },
      { id: 'wealth', title: 'Wealth & Career', icon: '💼', subcategories: [] },
      { id: 'growth', title: 'Growth & Learning', icon: '🧠', subcategories: [] }
    ];
  });

  useEffect(() => { localStorage.setItem('ga_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('ga_vision_statements', JSON.stringify(visionStatements)); }, [visionStatements]);
  useEffect(() => { localStorage.setItem('ga_pillars', JSON.stringify(pillars)); }, [pillars]);
  useEffect(() => { localStorage.setItem('ga_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('ga_actions_subtab', activeActionsSubTab); }, [activeActionsSubTab]);
  useEffect(() => { 
    localStorage.setItem('ga_theme', theme);
    if (theme === 'light') document.body.classList.add('light-theme');
    else document.body.classList.remove('light-theme');
  }, [theme]);

  // Actions
  const updateVisionStatement = (pillarId, text) => {
    setVisionStatements(prev => ({ ...prev, [pillarId]: text }));
  };

  const addPillar = (title, icon = '📌') => {
    setPillars(prev => [...prev, { id: crypto.randomUUID(), title, icon, subcategories: [] }]);
  };

  const addSubcategory = (pillarId, title, icon = '🔹') => {
    setPillars(prev => prev.map(p => {
      if (p.id === pillarId) {
        return {
          ...p,
          subcategories: [...(p.subcategories || []), { id: crypto.randomUUID(), title, icon }]
        };
      }
      return p;
    }));
  };

  const updateSubcategory = (pillarId, subId, updates) => {
    setPillars(prev => prev.map(p => {
      if (p.id === pillarId) {
        return {
          ...p,
          subcategories: (p.subcategories || []).map(s => s.id === subId ? { ...s, ...updates } : s)
        };
      }
      return p;
    }));
  };

  const deleteSubcategory = (pillarId, subId) => {
    setPillars(prev => prev.map(p => {
      if (p.id === pillarId) {
        return {
          ...p,
          subcategories: (p.subcategories || []).filter(s => s.id !== subId)
        };
      }
      return p;
    }));
    // Re-assign goals in this subcategory to the main pillar
    setGoals(prev => prev.map(g => g.subcategoryId === subId ? { ...g, subcategoryId: null } : g));
  };

  const updatePillar = (pillarId, updates) => {
    setPillars(prev => prev.map(p => p.id === pillarId ? { ...p, ...updates } : p));
  };

  const deletePillar = (pillarId) => {
    if (pillarId === 'personal' || pillarId === 'wealth' || pillarId === 'growth') return; // Protect defaults
    setPillars(prev => prev.filter(p => p.id !== pillarId));
    setGoals(prev => prev.map(g => g.pillarId === pillarId ? { ...g, pillarId: 'personal' } : g));
    setVisionStatements(prev => {
      const { [pillarId]: removed, ...rest } = prev;
      return rest;
    });
  };

  const addGoal = (title, pillarId = 'personal', note = '', startDate = '', endDate = '', targetNumber = '', subcategoryId = null) => {
    const newGoal = {
      id: crypto.randomUUID(),
      title,
      pillarId: pillarId || 'personal',
      subcategoryId,
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
          milestones: [...(goal.milestones || []), {
            id: crypto.randomUUID(),
            title,
            priority,
            tasks: [],
            active: true,
            createdAt: new Date().toISOString()
          }]
        };
      }
      return goal;
    }));
  };

  const updateMilestone = (goalId, milestoneId, updates) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: (goal.milestones || []).map(ms => 
            ms.id === milestoneId ? { ...ms, ...updates } : ms
          )
        };
      }
      return goal;
    }));
  };

  const deleteMilestone = (goalId, milestoneId) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: (goal.milestones || []).filter(ms => ms.id !== milestoneId)
        };
      }
      return goal;
    }));
  };

  const toggleMilestoneActive = (goalId, milestoneId) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: (goal.milestones || []).map(ms => 
            ms.id === milestoneId ? { ...ms, active: !ms.active } : ms
          )
        };
      }
      return goal;
    }));
  };

  const addTask = (goalId, milestoneId, title, value = 0, scheduledDate, priority = 'Medium', taskId = crypto.randomUUID()) => {
    let finalDate = scheduledDate;
    if (finalDate && !finalDate.includes('T')) finalDate = finalDate + 'T09:00';

    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: (goal.milestones || []).map(ms => {
            if (ms.id === milestoneId) {
              return {
                ...ms,
                tasks: [...(ms.tasks || []), {
                  id: taskId,
                  title,
                  value: Number(value) || 0,
                  scheduledDate: finalDate,
                  priority,
                  completed: false,
                  createdAt: new Date().toISOString(),
                  subtasks: []
                }]
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
          milestones: (goal.milestones || []).map(ms => {
            if (ms.id === milestoneId) {
              return {
                ...ms,
                tasks: (ms.tasks || []).map(task => 
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

  const updateGoal = (goalId, updates) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    ));
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

  const deleteTask = (goalId, milestoneId, taskId) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: (goal.milestones || []).map(ms => {
            if (ms.id === milestoneId) {
              return { ...ms, tasks: ms.tasks.filter(t => t.id !== taskId) };
            }
            return ms;
          })
        };
      }
      return goal;
    }));
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const toggleMilestoneCompleted = (goalId, milestoneId) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        return {
          ...goal,
          milestones: (goal.milestones || []).map(ms => 
            ms.id === milestoneId ? { ...ms, completed: !ms.completed } : ms
          )
        };
      }
      return goal;
    }));
  };

  const value = {
    goals,
    notes,
    visionStatements,
    updateVisionStatement,
    pillars,
    addPillar,
    updatePillar,
    deletePillar,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    activeTab,
    setActiveTab,
    activeActionsSubTab,
    setActiveActionsSubTab,
    selectedGoalId,
    setSelectedGoalId,
    selectedMilestoneId,
    setSelectedMilestoneId,
    previousTab,
    setPreviousTab,
    theme,
    toggleTheme,
    addGoal,
    addMilestone,
    toggleMilestoneActive,
    toggleMilestoneCompleted,
    addTask,
    toggleTask,
    updateTask,
    updateGoal,
    updateMilestone,
    deleteMilestone,
    deleteTask
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};
