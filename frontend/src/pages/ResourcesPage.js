import React from 'react';
import '../styles/dashboard.css';

function ResourcesPage() {
  return (
    <div className="dashboard-main">
      <div className="dashboard-header">
        <div>
          <h1>Resources</h1>
          <p>Curated materials and links — template layout only.</p>
        </div>
      </div>

      <div className="glass-card">
        <div className="section-title-row">
          <h3>Recommended</h3>
          <span>Placeholder layout — no content included</span>
        </div>
        <div style={{ padding: '1rem' }}>
          <div className="resources-grid">
            <div className="placeholder-box">Videos</div>
            <div className="placeholder-box">PDFs</div>
            <div className="placeholder-box">Web Links</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResourcesPage;
