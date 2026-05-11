import React, { useState } from 'react';
import './DashboardPage.css';

const DashboardPage = ({ user, t }) => {
  const [stats] = useState({
    reputationScore: 2100,
    agencyInfluence: 45,
    trashVotesResolved: 7,
    totalVotes: 15400,
    averageStashScore: 88,
    activeResolutions: 12,
  });

  const [recentActivity] = useState([
    { id: 1, action: 'Voted Stash for Moo Digital Agency', time: '2 hours ago', icon: '💰' },
    { id: 2, action: 'Voted Trash for Moo Digital Agency', time: '1 hour ago', icon: '🗑️' },
    { id: 3, action: 'Voted Stash for Moo Digital Agency', time: '30 mins ago', icon: '💰' },
  ]);

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* User Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="profile-info">
            <h1>Reputation Score: {stats.reputationScore.toLocaleString()}</h1>
            <p>Your influence and voting power across the platform</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <span className="stat-value">{stats.agencyInfluence}</span>
              <span className="stat-label">Agencies Influenced</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <span className="stat-value">{stats.trashVotesResolved}</span>
              <span className="stat-label">Trash Votes Resolved</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <span className="stat-value">{stats.totalVotes.toLocaleString()}</span>
              <span className="stat-label">Total Votes</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <span className="stat-value">{stats.averageStashScore}%</span>
              <span className="stat-label">Avg Stash Score</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Agency Influence Chart */}
          <div className="dashboard-card">
            <h2>Agency Influence</h2>
            <div className="pie-chart">
              <svg viewBox="0 0 200 200">
                {/* Pie Chart SVG */}
                <circle cx="100" cy="100" r="90" fill="none" stroke="#FFD700" strokeWidth="60" strokeDasharray="212 754" />
                <circle cx="100" cy="100" r="90" fill="none" stroke="#CC0000" strokeWidth="60" strokeDasharray="134 754" strokeDashoffset="-212" />
              </svg>
              <div className="pie-legend">
                <div className="legend-item">
                  <span className="legend-color" style={{ background: '#FFD700' }}></span>
                  <span>Agencies Influenced: 45</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ background: '#CC0000' }}></span>
                  <span>Trash Votes Resolved: 7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="dashboard-card">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <span className="activity-icon">{activity.icon}</span>
                  <div className="activity-details">
                    <p className="activity-action">{activity.action}</p>
                    <p className="activity-time">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn btn-primary">🏅 Resolve Client Trash Votes</button>
          <button className="btn btn-secondary">🎁 Reward Top Stashers</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
