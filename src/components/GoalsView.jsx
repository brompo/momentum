import React, { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import GoalCard from './GoalCard';
import './GoalsView.css';

const GoalsView = ({ onSelectGoal }) => {
  const { goals, addGoal, visionStatement, setVisionStatement, pillars } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    note: '',
    startDate: '',
    endDate: '',
    targetNumber: ''
  });

  const [error, setError] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.title.trim()) {
      setError('Goal Name is required.');
      return;
    }

    addGoal(
      newGoal.title,
      newGoal.pillarId || 'personal',
      newGoal.note,
      newGoal.startDate,
      newGoal.endDate,
      newGoal.targetNumber
    );
    setNewGoal({ title: '', note: '', startDate: '', endDate: '', targetNumber: '', pillarId: 'personal' });
    setError('');
    setIsAdding(false);
  };

  return (
    <>
      <div className="goals-view safe-area animate-fade-in">
      <div className={`header-row ${isScrolled ? 'scrolled' : ''}`}>
        <h1>Achievements</h1>
      </div>

      {isAdding && (
        <div className="modal-overlay glass" onClick={() => setIsAdding(false)}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2>New Goal</h2>

            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleAddGoal} className="expanded-form">
              <div className="form-group">
                <label>Pillar Category</label>
                <select 
                  value={newGoal.pillarId || 'personal'} 
                  onChange={e => setNewGoal({ ...newGoal, pillarId: e.target.value })}
                  className="modal-input"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.08)', background: '#fff', color: '#1e293b' }}
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

      <div className="pillars-container" style={{ marginTop: '24px', width: '100%' }}>
        {pillars.map(pillar => {
          const pillarGoals = goals.filter(g => g.pillarId === pillar.id || (!g.pillarId && pillar.id === 'personal'));
          return (
            <div key={pillar.id} className="pillar-group" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '6px' }}>
                <span style={{ fontSize: '1.25rem' }}>{pillar.icon}</span>
                <h2 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{pillar.title}</h2>
              </div>
              <div className="goals-list">
                {pillarGoals.length === 0 ? (
                  <p className="empty-state" style={{ fontSize: '0.8rem', color: 'var(--text-dim)', padding: '12px 4px', fontStyle: 'italic' }}>No achievements defined yet.</p>
                ) : (
                  pillarGoals.map(goal => (
                    <GoalCard key={goal.id} goal={goal} onClick={onSelectGoal} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div>

      <button className="fab-btn smooth-all" onClick={() => setIsAdding(true)}>+</button>
    </>
  );
};

export default GoalsView;
