import React from 'react';
import '../styles/dashboard.css';

function FlashcardsPage() {
  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        <div>
          <h1>Flashcards</h1>
          <p>Flashcard sets and review — template layout only.</p>
        </div>
      </div>

      <div className="glass-card">
        <div className="section-title-row">
          <h3>Your Flashcard Sets</h3>
          <span>Placeholder layout — no content loaded</span>
        </div>
        <div style={{ padding: '1rem' }}>
          <div className="flashcards-grid">
            <div className="placeholder-box">Create Set</div>
            <div className="placeholder-box">Due for Review</div>
            <div className="placeholder-box">All Sets</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlashcardsPage;
