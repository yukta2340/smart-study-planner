import React from 'react';
import '../styles/dashboard.css';

function NotesPage() {
  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        <div>
          <h1>Notes</h1>
          <p>Quick access to your notes. Template layout only — content not included.</p>
        </div>
      </div>

      <div className="glass-card">
        <div className="section-title-row">
          <h3>Quick Actions</h3>
          <span>Create, import, or organize notes</span>
        </div>
        <div style={{ padding: '1rem' }}>
          {/* Layout placeholders */}
          <div className="notes-grid">
            <div className="placeholder-box">+ New Note</div>
            <div className="placeholder-box">Folders</div>
            <div className="placeholder-box">Recent Notes</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotesPage;
