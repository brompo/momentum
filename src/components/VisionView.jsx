import React, { useState } from 'react';
import { useStore } from '../lib/store';
import './VisionView.css';

const VisionView = () => {
  const { goals, visionStatements, updateVisionStatement, pillars, addPillar, updatePillar, deletePillar, addSubcategory, deleteSubcategory, addGoal } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [addingSubToPillar, setAddingSubToPillar] = useState(null); // id of pillar
  const [newSubTitle, setNewSubTitle] = useState('');
  
  const [addingGoalToSub, setAddingGoalToSub] = useState(null); // { pillarId, subId }
  const [newGoalTitle, setNewGoalTitle] = useState('');

  const [editingPillar, setEditingPillar] = useState(null);
  const [pillarForm, setPillarForm] = useState({ title: '', icon: '📌' });

  const handleOpenAdd = () => {
    setPillarForm({ title: '', icon: '📌' });
    setIsAdding(true);
  };

  const handleOpenEdit = (pillar) => {
    setPillarForm({ title: pillar.title, icon: pillar.icon });
    setEditingPillar(pillar);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (pillarForm.title.trim()) {
      addPillar(pillarForm.title, pillarForm.icon);
      setIsAdding(false);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editingPillar && pillarForm.title.trim()) {
      updatePillar(editingPillar.id, pillarForm);
      setEditingPillar(null);
    }
  };

  const handleDeletePillar = () => {
    if (editingPillar && window.confirm(`Are you sure you want to delete the "${editingPillar.title}" pillar?`)) {
      deletePillar(editingPillar.id);
      setEditingPillar(null);
    }
  };

  const handleAddSub = (pillarId) => {
    if (newSubTitle.trim()) {
      addSubcategory(pillarId, newSubTitle);
      setNewSubTitle('');
      setAddingSubToPillar(null);
    }
  };

  const handleAddGoalShortcut = (pillarId, subId) => {
    if (newGoalTitle.trim()) {
      addGoal(newGoalTitle, pillarId, '', '', '', '', subId);
      setNewGoalTitle('');
      setAddingGoalToSub(null);
    }
  };

  return (
    <div className="vision-view safe-area animate-fade-in">
      <div className="header-row">
        <h1>Vision Board</h1>
      </div>

      <div className="vision-container" style={{ marginTop: '16px' }}>
        {pillars.map(pillar => {
          const pillarGoals = goals.filter(g => g.pillarId === pillar.id && !g.subcategoryId);
          
          return (
            <div key={pillar.id} className="vision-card-v2">
              <div className="pillar-header-v2">
                <div className="pillar-label-group">
                  <div className="pillar-emoji-v2">{pillar.icon}</div>
                  <span className="pillar-title-v2">{pillar.title}</span>
                </div>
                <button className="pillar-edit-btn" onClick={() => handleOpenEdit(pillar)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
              </div>
              
              <textarea 
                className="vision-textarea-v2"
                value={visionStatements[pillar.id] || ''} 
                onChange={(e) => updateVisionStatement(pillar.id, e.target.value)} 
                placeholder={`What is your long-term success state for ${pillar.title.toLowerCase()}?`} 
                rows="2"
              />

              <div className="sub-categories-rack">
                {(pillar.subcategories || []).map(sub => {
                  const subGoals = goals.filter(g => g.subcategoryId === sub.id);
                  const isAddingGoal = addingGoalToSub?.subId === sub.id;

                  return (
                    <div key={sub.id} className="sub-cat-group">
                       <div className="sub-cat-header">
                         <span className="sub-cat-title">{sub.icon} {sub.title}</span>
                         <button className="add-goal-sub-btn" onClick={() => setAddingGoalToSub(isAddingGoal ? null : { pillarId: pillar.id, subId: sub.id })}>
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                         </button>
                       </div>
                       
                       <div className="sub-goals-list">
                         {subGoals.map(g => (
                           <div key={g.id} className="sub-goal-tag">
                             {g.title}
                           </div>
                         ))}
                         
                         {isAddingGoal && (
                           <div className="inline-add-goal">
                             <input 
                               autoFocus
                               placeholder="Goal name..." 
                               value={newGoalTitle}
                               onChange={e => setNewGoalTitle(e.target.value)}
                               onKeyDown={e => e.key === 'Enter' && handleAddGoalShortcut(pillar.id, sub.id)}
                             />
                           </div>
                         )}
                       </div>
                    </div>
                  );
                })}

                {addingSubToPillar === pillar.id ? (
                  <div className="inline-add-sub">
                    <input 
                      autoFocus
                      placeholder="Sub-category name..." 
                      value={newSubTitle}
                      onChange={e => setNewSubTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddSub(pillar.id)}
                      onBlur={() => !newSubTitle && setAddingSubToPillar(null)}
                    />
                  </div>
                ) : (
                  <button className="add-sub-trigger" onClick={() => setAddingSubToPillar(pillar.id)}>
                    + Add sub-category
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button className="fab-btn-teal" onClick={handleOpenAdd}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>

      {/* Add/Edit Pillar Modal */}
      {(isAdding || editingPillar) && (
        <div className="modal-overlay glass" onClick={() => { setIsAdding(false); setEditingPillar(null); }}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header-v2">
              <h2>{isAdding ? 'New Success Pillar' : 'Edit Pillar'}</h2>
              <button className="close-btn" onClick={() => { setIsAdding(false); setEditingPillar(null); }}>&times;</button>
            </div>
            
            <form onSubmit={isAdding ? handleAddSubmit : handleEditSubmit} className="expanded-form">
              <div className="form-group">
                <label>Pillar Name</label>
                <input 
                  autoFocus
                  type="text" 
                  value={pillarForm.title} 
                  onChange={e => setPillarForm({ ...pillarForm, title: e.target.value })} 
                  className="modal-input" 
                  placeholder="e.g. Community, Health, Legacy"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Icon (Emoji)</label>
                <input 
                  type="text" 
                  value={pillarForm.icon} 
                  onChange={e => setPillarForm({ ...pillarForm, icon: e.target.value })} 
                  className="modal-input" 
                  placeholder="Paste an emoji here..."
                />
              </div>
              <div className="modal-actions" style={{ marginTop: '24px' }}>
                {!isAdding && !isDefaultPillar(editingPillar.id) && (
                  <button type="button" className="delete-pillar-btn" onClick={handleDeletePillar}>Delete Pillar</button>
                )}
                <button type="button" className="btn-secondary" onClick={() => { setIsAdding(false); setEditingPillar(null); }}>Cancel</button>
                <button type="submit" className="btn-primary">{isAdding ? 'Create' : 'Apply Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisionView;
