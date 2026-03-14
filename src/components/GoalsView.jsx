import React, { useState } from 'react';
import { useStore } from '../lib/store';
import GoalCard from './GoalCard';
import './GoalsView.css';

const GoalsView = ({ onSelectGoal }) => {
  const { goals, addGoal } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (newGoalTitle.trim()) {
      addGoal(newGoalTitle);
      setNewGoalTitle('');
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
            <form onSubmit={handleAddGoal}>
              <input 
                autoFocus
                type="text" 
                placeholder="What do you want to achieve?" 
                value={newGoalTitle}
                onChange={e => setNewGoalTitle(e.target.value)}
                className="modal-input"
              />
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
