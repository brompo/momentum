import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import GoalCard from './GoalCard';
import './GoalsView.css';

const GoalsView = ({ onSelectGoal }) => {
  const { goals, addGoal, pillars } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    note: '',
    startDate: '',
    endDate: '',
    targetNumber: '',
    pillarId: 'personal'
  });

  const [error, setError] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [collapsedPillars, setCollapsedPillars] = useState({});

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.title.trim()) {
      setError('Goal Name is required.');
      return;
    }
    addGoal(
      newGoal.title,
      newGoal.pillarId,
      newGoal.note,
      newGoal.startDate,
      newGoal.endDate,
      newGoal.targetNumber
    );
    setNewGoal({ title: '', note: '', startDate: '', endDate: '', targetNumber: '', pillarId: 'personal' });
    setError('');
    setIsAdding(false);
  };

  const togglePillar = (id) => {
    setCollapsedPillars(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="goals-view safe-area animate-fade-in">
      <div className={`header-row ${isScrolled ? 'scrolled' : ''}`}>
        <h1>Achievements</h1>
      </div>

      {isAdding && (
        <div className="modal-overlay glass" onClick={() => setIsAdding(false)}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Goal</h2>
              <button className="close-btn" onClick={() => setIsAdding(false)}>&times;</button>
            </div>
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleAddGoal} className="expanded-form">
              <div className="form-group">
                <label>Pillar Category</label>
                <select 
                  value={newGoal.pillarId} 
                  onChange={e => setNewGoal({ ...newGoal, pillarId: e.target.value })}
                  className="modal-input"
                >
                  {pillars.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Goal Name</label>
                <input
                  autoFocus
                  type="text"
                  placeholder="What do you want to achieve?"
                  value={newGoal.title}
                  onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="modal-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Note</label>
                <textarea
                  placeholder="Add some details..."
                  value={newGoal.note}
                  onChange={e => setNewGoal({ ...newGoal, note: e.target.value })}
                  className="modal-input"
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={newGoal.startDate}
                    onChange={e => setNewGoal({ ...newGoal, startDate: e.target.value })}
                    className="modal-input"
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={newGoal.endDate}
                    onChange={e => setNewGoal({ ...newGoal, endDate: e.target.value })}
                    className="modal-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Target Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. $10,000 or 50 lbs"
                  value={newGoal.targetNumber}
                  onChange={e => setNewGoal({ ...newGoal, targetNumber: e.target.value })}
                  className="modal-input"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="pillars-container" style={{ marginTop: '16px', width: '100%', paddingBottom: '110px' }}>
        {pillars.map(pillar => {
          const pillarGoals = goals.filter(g => g.pillarId === pillar.id || (!g.pillarId && pillar.id === 'personal'));
          const isCollapsed = collapsedPillars[pillar.id];
          
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
                <span style={{ fontSize: '1rem', opacity: 0.8 }}>{pillar.icon}</span>
                <h2 style={{ fontSize: '0.7rem', fontWeight: 900, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1 }}>{pillar.title}</h2>
                <svg 
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="3" 
                   style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {!isCollapsed && (
                <div className="goals-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {pillarGoals.length === 0 ? (
                    <p className="empty-state" style={{ fontSize: '0.7rem', color: '#94a3b8', padding: '8px 4px', fontStyle: 'italic' }}>No achievements yet.</p>
                  ) : (
                    pillarGoals.map(goal => (
                      <GoalCard key={goal.id} goal={goal} onClick={onSelectGoal} compact={true} />
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button className="fab-btn smooth-all" onClick={() => setIsAdding(true)}>+</button>
    </div>
  );
};

export default GoalsView;
