import React, { createContext, useContext, useState, useEffect } from 'react';
import initialFeatureMap from '../data/featuremap.json';
import { useGoogleSync } from './sync';

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const sync = useGoogleSync();

  // Initialize state from localStorage
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('ga_goals');
    return saved ? JSON.parse(saved) : [];
  });


  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('ga_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('ga_active_tab') || 'Goals');
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

  const [featureMap, setFeatureMap] = useState(() => {
    const saved = localStorage.getItem('ga_feature_map');
    if (saved) return JSON.parse(saved);
    
    // Inject IDs into static json for dynamic store usage
    const withIds = {
      achieved: (initialFeatureMap.achieved || []).map(item => ({ ...item, id: item.id || crypto.randomUUID() })),
      pipeline: (initialFeatureMap.pipeline || []).map(item => ({ ...item, id: item.id || crypto.randomUUID() }))
    };
    return withIds;
  });

  const [lastLocalUpdate, setLastLocalUpdate] = useState(() => {
    return localStorage.getItem('ga_last_update') || new Date(0).toISOString();
  });

  useEffect(() => { localStorage.setItem('ga_goals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('ga_pillars', JSON.stringify(pillars)); }, [pillars]);
  useEffect(() => { localStorage.setItem('ga_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('ga_feature_map', JSON.stringify(featureMap)); }, [featureMap]);
  useEffect(() => { localStorage.setItem('ga_actions_subtab', activeActionsSubTab); }, [activeActionsSubTab]);
  useEffect(() => { localStorage.setItem('ga_theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('ga_last_update', lastLocalUpdate); }, [lastLocalUpdate]);
  useEffect(() => { localStorage.setItem('ga_active_tab', activeTab); }, [activeTab]);

  // Auto-Pull on Boot/Auth
  useEffect(() => {
    const checkCloudUpdate = async () => {
      if (sync.token) {
        const metadata = await sync.getCloudMetadata();
        if (metadata && metadata.modifiedTime) {
          const cloudTime = new Date(metadata.modifiedTime).getTime();
          const localTime = new Date(lastLocalUpdate).getTime();
          
          if (cloudTime > localTime + 1000) { // 1s buffer
            console.log('Automated Sync: Cloud is newer. Pulling updates...');
            await syncCloudToLocal();
          }
        }
      }
    };
    checkCloudUpdate();
  }, [sync.token]);

  // Background Sync Effect (Debounced)
  useEffect(() => {
    if (sync.token) {
      const timer = setTimeout(() => {
        syncLocalToCloud();
      }, 5000); // Wait 5 seconds after last change to backup
      return () => clearTimeout(timer);
    }
    // Update local timestamp on every change even if not syncing
    setLastLocalUpdate(new Date().toISOString());
  }, [goals, pillars, notes, featureMap, sync.token]);

  // Actions

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
            note: '',
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

  const logGoalProgress = (goalId, amount, description, date = new Date().toISOString().split('T')[0]) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        let milestones = [...(goal.milestones || [])];
        // 1. Try to find the user-designated default milestone
        let targetMs = goal.defaultMilestoneId 
          ? milestones.find(m => m.id === goal.defaultMilestoneId)
          : null;
        
        // 2. Fallback to existing "General Progress" if no default or default not found
        if (!targetMs) {
          targetMs = milestones.find(m => m.title === 'General Progress');
        }
        
        // 3. Create "General Progress" if nothing found at all
        if (!targetMs) {
          targetMs = {
            id: crypto.randomUUID(),
            title: 'General Progress',
            priority: 'Low',
            tasks: [],
            note: 'Automatically created for quick progress updates.',
            active: true,
            createdAt: new Date().toISOString()
          };
          milestones.push(targetMs);
        }

        const newTask = {
          id: crypto.randomUUID(),
          title: description || 'Progress Update',
          value: parseFloat(amount) || 0,
          completed: true, // Automatically completed for quick log
          completedAt: date,
          createdAt: new Date().toISOString()
        };

        return {
          ...goal,
          milestones: milestones.map(m => 
            m.id === targetMs.id 
              ? { ...m, tasks: [...(m.tasks || []), newTask] }
              : m
          )
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

  const addFeatureMapItem = (section, item) => {
    setFeatureMap(prev => ({
      ...prev,
      [section]: [{ ...item, id: crypto.randomUUID() }, ...prev[section]]
    }));
  };

  const updateFeatureMapItem = (section, itemId, updates) => {
    setFeatureMap(prev => ({
      ...prev,
      [section]: prev[section].map(item => item.id === itemId ? { ...item, ...updates } : item)
    }));
  };

  const deleteFeatureMapItem = (section, itemId) => {
    setFeatureMap(prev => ({
      ...prev,
      [section]: prev[section].filter(item => item.id !== itemId)
    }));
  };

  const releaseFeature = (pipelineId, version, date, description, changes) => {
    const item = featureMap.pipeline.find(i => i.id === pipelineId);
    if (!item) return;

    const achievedItem = {
      id: crypto.randomUUID(),
      version,
      date,
      description: description || item.title,
      changes: changes || item.features
    };

    setFeatureMap(prev => ({
      achieved: [achievedItem, ...prev.achieved],
      pipeline: prev.pipeline.filter(i => i.id !== pipelineId)
    }));
  };

  const syncLocalToCloud = async () => {
    const fullData = {
       goals,
      pillars,
      notes,
      featureMap,
      theme,
      updatedAt: new Date().toISOString()
    };
    await sync.uploadBackup(fullData);
  };

  const syncCloudToLocal = async () => {
    const res = await sync.downloadBackup();
    if (res && res.data) {
       const cloudData = res.data;
      if (cloudData.goals) setGoals(cloudData.goals);
      if (cloudData.pillars) setPillars(cloudData.pillars);
      if (cloudData.notes) setNotes(cloudData.notes);
      if (cloudData.featureMap) setFeatureMap(cloudData.featureMap);
      if (cloudData.theme) setTheme(cloudData.theme);
      
      if (res.modifiedTime) {
        setLastLocalUpdate(res.modifiedTime);
      }
      return true;
    }
    return false;
  };

  const exportToJSON = () => {
    const data = {
      goals,
      pillars,
      notes,
      featureMap,
      theme,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `momentum_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importFromJSON = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const cloudData = JSON.parse(e.target.result);
          if (cloudData.goals) setGoals(cloudData.goals);
          if (cloudData.pillars) setPillars(cloudData.pillars);
          if (cloudData.notes) setNotes(cloudData.notes);
          if (cloudData.featureMap) setFeatureMap(cloudData.featureMap);
          if (cloudData.theme) setTheme(cloudData.theme);
          setLastLocalUpdate(new Date().toISOString());
          resolve(true);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const value = {
    goals,
    notes,
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
    logGoalProgress,
    toggleMilestoneActive,
    toggleMilestoneCompleted,
    addTask,
    toggleTask,
    updateTask,
    updateGoal,
    updateMilestone,
    deleteMilestone,
    deleteTask,
    featureMap,
    addFeatureMapItem,
    updateFeatureMapItem,
    deleteFeatureMapItem,
    releaseFeature,
    // Sync
    sync,
    syncLocalToCloud,
    syncCloudToLocal,
    exportToJSON,
    importFromJSON
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
};
