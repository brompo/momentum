import React, { useState } from 'react';
import { useStore } from '../lib/store';
import GoalCard from './GoalCard';
import './GoalsView.css';

const GoalsView = ({ onSelectGoal }) => {
  const { goals, addGoal } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    note: '',
    startDate: '',
    endDate: '',
    targetNumber: ''
  });

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (newGoal.title.trim()) {
      addGoal(
        newGoal.title, 
        newGoal.note, 
        newGoal.startDate, 
        newGoal.endDate, 
        newGoal.targetNumber
      );
      setNewGoal({ title: '', note: '', startDate: '', endDate: '', targetNumber: '' });
      setIsAdding(false);
    }
  };

  return (
    <div className="goals-view safe-area animate-fade-in">
      <div className="header-row">
        <h1>Yearly Goals</h1>
        <button className="add-btn smooth-all" onClick={() => setIsAdding(true)}>+</button>
      </div>

      {isAdding && (
        <div className="modal-overlay glass" onClick={() => setIsAdding(false)}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2>New Goal</h2>
            <form onSubmit={handleAddGoal} className="expanded-form">
              <div className="form-group">
                <label>Goal Name</label>
                <input 
                  autoFocus
                  type="text" 
                  placeholder="What do you want to achieve?" 
                  value={newGoal.title}
                  onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                  className="modal-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Note</label>
                <textarea 
                  placeholder="Add some details..." 
                  value={newGoal.note}
                  onChange={e => setNewGoal({...newGoal, note: e.target.value})}
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
                    onChange={e => setNewGoal({...newGoal, startDate: e.target.value})}
                    className="modal-input"
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input 
                    type="date" 
                    value={newGoal.endDate}
                    onChange={e => setNewGoal({...newGoal, endDate: e.target.value})}
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
                  onChange={e => setNewGoal({...newGoal, targetNumber: e.target.value})}
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

      <div className="goals-list">
        {goals.length === 0 ? (
          <p className="empty-state">No goals yet. Pulse the + to start your journey.</p>
        ) : (
          goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} onClick={onSelectGoal} />
          ))
        )}
      </div>
    </div>
  );
};

export default GoalsView;
