import React, { useState } from 'react';
import { useStore } from '../lib/store';

const VisionView = () => {
  const { visionStatements, updateVisionStatement, pillars, addPillar } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newPillar, setNewPillar] = useState({ title: '', icon: '📌' });

  const handleAddPillar = (e) => {
    e.preventDefault();
    if (!newPillar.title.trim()) return;
    addPillar(newPillar.title, newPillar.icon);
    setNewPillar({ title: '', icon: '📌' });
    setIsAdding(false);
  };

  return (
    <>
      <div className="safe-area animate-fade-in" style={{ paddingBottom: '120px' }}>
        <div className="header-row">
          <h1>Vision</h1>
        </div>
        <div className="vision-container" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pillars.map(pillar => (
            <div key={pillar.id} className="vision-board-header glass-card" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '1.25rem' }}>{pillar.icon}</span>
                <label style={{ fontSize: '0.725rem', fontWeight: 600, color: '#cc599c', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{pillar.title}</label>
              </div>
              <textarea 
                value={visionStatements[pillar.id] || ''} 
                onChange={(e) => updateVisionStatement(pillar.id, e.target.value)} 
                placeholder={`Define your long-term vision for ${pillar.title}...`} 
                style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', resize: 'none', fontSize: '0.95rem', fontStyle: 'italic', lineHeight: '1.45', padding: 0, minHeight: '60px', color: 'var(--text-main)' }}
                rows="3"
              />
            </div>
          ))}
        </div>
      </div>

      {isAdding && (
        <div className="modal-overlay glass" onClick={() => setIsAdding(false)}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2>New Growth Pillar</h2>
            <form onSubmit={handleAddPillar} className="expanded-form">
              <div className="form-group">
                <label>Pillar Title</label>
                <input 
                  type="text" 
                  value={newPillar.title} 
                  onChange={e => setNewPillar({ ...newPillar, title: e.target.value })} 
                  className="modal-input" 
                  required 
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Icon (Emoji)</label>
                <input 
                  type="text" 
                  value={newPillar.icon} 
                  onChange={e => setNewPillar({ ...newPillar, icon: e.target.value })} 
                  className="modal-input" 
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Pillar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button className="fab-btn smooth-all" onClick={() => setIsAdding(true)}>+</button>
    </>
  );
};

export default VisionView;
