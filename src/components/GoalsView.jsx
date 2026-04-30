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

  const togglePillar = (id) => {
    setCollapsedPillars(prev => ({ ...prev, [id]: !prev[id] }));
  };

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

  const handleAddForPillar = (e, pillarId) => {
    e.stopPropagation();
    setNewGoal({ ...newGoal, pillarId: pillarId });
    setIsAdding(true);
  };

  return (
    <div className="goals-view safe-area animate-fade-in">
      <div className={`header-row ${isScrolled ? 'scrolled' : ''}`}>
        <h1>Achievements</h1>
      </div>

      {isAdding && (
        <div className="modal-overlay glass" onClick={() => setIsAdding(false)}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header-modern">
              <div className="header-title-group">
                <div className="header-icon">🚀</div>
                <h2>New Achievement</h2>
              </div>
              <button className="modal-close-icon" onClick={() => setIsAdding(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            {error && <div className="form-error">{error}</div>}

            <form onSubmit={handleAddGoal} className="modal-form-v2">
              <div className="form-section">
                <div className="form-group-v2">
                  <label>Pillar Category</label>
                  <select
                    value={newGoal.pillarId}
                    onChange={e => setNewGoal({ ...newGoal, pillarId: e.target.value })}
                    className="modal-select-v2"
                  >
                    {pillars.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group-v2">
                  <label>Goal Name</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Launch Studio 19 Assistant"
                    value={newGoal.title}
                    onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="modal-input-v2"
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <div className="form-group-v2">
                  <label>Detailed Note (Optional)</label>
                  <textarea
                    placeholder="Capture the purpose and motivation behind this goal..."
                    value={newGoal.note}
                    onChange={e => setNewGoal({ ...newGoal, note: e.target.value })}
                    className="modal-textarea-v2"
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-section-timeline">
                <label className="section-label">Timeline & Target</label>
                <div className="timeline-grid">
                  <div className="form-group-v2">
                    <label>Start Date</label>
                    <input
                      type={newGoal.startDate ? "date" : "text"}
                      placeholder="Set start date"
                      value={newGoal.startDate}
                      onChange={e => setNewGoal({ ...newGoal, startDate: e.target.value })}
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => !newGoal.startDate && (e.target.type = "text")}
                      className="modal-input-v2"
                    />
                  </div>
                  <div className="form-group-v2">
                    <label>Target Date</label>
                    <input
                      type={newGoal.endDate ? "date" : "text"}
                      placeholder="Set target date"
                      value={newGoal.endDate}
                      onChange={e => setNewGoal({ ...newGoal, endDate: e.target.value })}
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => !newGoal.endDate && (e.target.type = "text")}
                      className="modal-input-v2"
                    />
                  </div>
                </div>

                <div className="form-group-v2" style={{ marginTop: '12px' }}>
                  <label>Metric Goal (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 500M TZS or 100 Leads"
                    value={newGoal.targetNumber}
                    onChange={e => setNewGoal({ ...newGoal, targetNumber: e.target.value })}
                    className="modal-input-v2"
                  />
                </div>
              </div>

              <div className="modal-footer-v2">
                <button type="button" className="btn-cancel-v2" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="btn-create-v2">Create Achievement</button>
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
                  borderTop: '1px solid #0000000d',
                  paddingTop: '8px',
                  cursor: 'pointer'
                }}
              >
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: pillar.id === 'personal' ? '#10b981' : pillar.id === 'wealth' ? '#f49d0d' : pillar.id === 'growth' ? '#6366f1' : '#0d9488'
                }}></span>
                <h2 style={{ fontSize: '0.7rem', fontWeight: 900, color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1 }}>{pillar.title}</h2>
                <button
                  className="add-goal-mini-btn-v2"
                  onClick={(e) => handleAddForPillar(e, pillar.id)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
                </button>
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
    </div>
  );
};

export default GoalsView;
