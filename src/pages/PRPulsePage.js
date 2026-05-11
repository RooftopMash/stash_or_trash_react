import React, { useState } from 'react';
import './PRPulsePage.css';

const PRPulsePage = ({ t }) => {
  const [selectedAgency] = useState('MOO Digital Agency');
  const [metrics] = useState({
    totalVotes: 15400,
    averageStashScore: 90,
    activeResolutions: 12,
  });

  const [worldData] = useState([
    { region: 'North America', sentiment: 85, votes: 4200 },
    { region: 'Europe', sentiment: 78, votes: 3100 },
    { region: 'Asia', sentiment: 92, votes: 5200 },
    { region: 'South America', sentiment: 68, votes: 1900 },
    { region: 'Africa', sentiment: 72, votes: 1000 },
  ]);

  return (
    <div className="pulse-page">
      <div className="pulse-container">
        <div className="pulse-header">
          <h1>Agency PR Pulse</h1>
          <p className="pulse-subtitle">{selectedAgency}</p>
        </div>

        {/* Engagement Portal */}
        <div className="engagement-portal">
          <h2>Engagement Portal</h2>
          <div className="portal-buttons">
            <button className="portal-btn resolve-btn">
              🔧 Resolve Client Trash Votes
            </button>
            <button className="portal-btn reward-btn">
              🎁 Reward Top Stashers
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-number">{metrics.totalVotes.toLocaleString()}</div>
            <div className="metric-label">Total Votes</div>
          </div>
          <div className="metric-card">
            <div className="metric-number">{metrics.averageStashScore}%</div>
            <div className="metric-label">Avg Stash Score</div>
          </div>
          <div className="metric-card">
            <div className="metric-number">{metrics.activeResolutions}</div>
            <div className="metric-label">Active Resolutions</div>
          </div>
        </div>

        {/* Sentiment Heatmap */}
        <div className="heatmap-section">
          <h2>Sentiment Heatmap</h2>
          <div className="sentiment-map">
            <svg viewBox="0 0 960 600" className="world-map">
              <rect width="960" height="600" fill="rgba(0,0,0,0.1)" />
              <text x="200" y="100" fontSize="12" fill="white">North America</text>
              <text x="500" y="100" fontSize="12" fill="white">Europe</text>
              <text x="750" y="150" fontSize="12" fill="white">Asia</text>
              <text x="200" y="450" fontSize="12" fill="white">S. America</text>
              <text x="600" y="500" fontSize="12" fill="white">Africa</text>
            </svg>
            <div className="heatmap-legend">
              <div className="legend-item">
                <span className="legend-box" style={{ background: '#4CAF50' }}></span>
                <span>High Sentiment (80-100%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-box" style={{ background: '#FFC107' }}></span>
                <span>Medium Sentiment (60-80%)</span>
              </div>
              <div className="legend-item">
                <span className="legend-box" style={{ background: '#FF6B6B' }}></span>
                <span>Low Sentiment (<60%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Regional Breakdown */}
        <div className="regional-breakdown">
          <h2>Regional Breakdown</h2>
          <div className="regional-grid">
            {worldData.map((region, idx) => (
              <div key={idx} className="regional-card">
                <h3>{region.region}</h3>
                <div className="sentiment-bar">
                  <div
                    className="sentiment-fill"
                    style={{
                      width: `${region.sentiment}%`,
                      background: region.sentiment > 80 ? '#4CAF50' : region.sentiment > 60 ? '#FFC107' : '#FF6B6B',
                    }}
                  />
                </div>
                <div className="regional-stats">
                  <span className="sentiment-percent">{region.sentiment}%</span>
                  <span className="votes-count">{region.votes.toLocaleString()} votes</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Sentiment Trend */}
        <div className="trend-section">
          <h2>Monthly Sentiment Trend</h2>
          <div className="trend-chart">
            <svg viewBox="0 0 600 300">
              {/* Simple line chart */}
              <polyline
                points="50,250 100,200 150,180 200,210 250,160 300,140 350,170 400,150 450,120 500,140 550,100"
                fill="none"
                stroke="#FFD700"
                strokeWidth="3"
              />
              <circle cx="50" cy="250" r="4" fill="#FFD700" />
              <circle cx="100" cy="200" r="4" fill="#FFD700" />
              <circle cx="150" cy="180" r="4" fill="#FFD700" />
              <circle cx="200" cy="210" r="4" fill="#FFD700" />
              <circle cx="250" cy="160" r="4" fill="#FFD700" />
              <circle cx="300" cy="140" r="4" fill="#FFD700" />
              <circle cx="350" cy="170" r="4" fill="#FFD700" />
              <circle cx="400" cy="150" r="4" fill="#FFD700" />
              <circle cx="450" cy="120" r="4" fill="#FFD700" />
              <circle cx="500" cy="140" r="4" fill="#FFD700" />
              <circle cx="550" cy="100" r="4" fill="#FFD700" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PRPulsePage;
