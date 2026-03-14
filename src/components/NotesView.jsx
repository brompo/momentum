import React, { useState } from 'react';
import { useStore } from '../lib/store';
import './NotesView.css';

const NotesView = () => {
  const { notes, goals, addNote } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState('');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');

  // Flat list of milestones across all goals
  const allMilestones = goals.flatMap(g => g.milestones.map(ms => ({ ...ms, goalTitle: g.title })));

  const handleAddNote = (e) => {
    e.preventDefault();
    if (content.trim() && selectedMilestoneId) {
      addNote(selectedMilestoneId, content);
      setContent('');
      setSelectedMilestoneId('');
      setIsAdding(false);
    }
  };

  return (
    <div className="notes-view safe-area animate-fade-in">
      <div className="header-row">
        <h1>My Notes</h1>
        <button className="add-btn smooth-all" onClick={() => setIsAdding(true)}>+</button>
      </div>

      {isAdding && (
        <div className="modal-overlay glass" onClick={() => setIsAdding(false)}>
          <div className="modal-content glass-card animate-fade-in" onClick={e => e.stopPropagation()}>
            <h2>Capture Learning</h2>
            <form onSubmit={handleAddNote}>
              <select 
                className="modal-input"
                value={selectedMilestoneId}
                onChange={e => setSelectedMilestoneId(e.target.value)}
                required
              >
                <option value="">Select a Milestone</option>
                {allMilestones.map(ms => (
                  <option key={ms.id} value={ms.id}>{ms.goalTitle} › {ms.title}</option>
                ))}
              </select>
              <textarea 
                autoFocus
                placeholder="What did you learn today?" 
                value={content}
                onChange={e => setContent(e.target.value)}
                className="modal-input note-textarea"
                rows="4"
                required
              />
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsAdding(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Note</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="notes-list">
        {notes.length === 0 ? (
          <p className="empty-state">No notes yet. Link your learnings to milestones!</p>
        ) : (
          notes.map(note => {
            const milestone = allMilestones.find(m => m.id === note.milestoneId);
            return (
              <div key={note.id} className="note-card glass-card animate-fade-in">
                <div className="note-meta">
                  <span className="note-milestone">{milestone ? `${milestone.goalTitle} › ${milestone.title}` : 'General'}</span>
                  <span className="note-date">{new Date(note.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="note-content">{note.content}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NotesView;
