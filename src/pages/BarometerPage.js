import React, { useState } from 'react';
import './BarometerPage.css';

const BarometerPage = ({ t }) => {
  const [rankings] = useState([
    {
      rank: 1,
      name: 'MOO Digital Agency',
      category: 'Digital Agencies',
      stashPercent: 92,
      trashPercent: 8,
      trend: 'up',
      votes: 245,
    },
    {
      rank: 2,
      name: 'Agency X',
      category: 'Creative Agencies',
      stashPercent: 85,
      trashPercent: 15,
      trend: 'up',
      votes: 189,
    },
    {
      rank: 3,
      name: 'Media Corp',
      category: 'Media',
      stashPercent: 72,
      trashPercent: 28,
      trend: 'down',
      votes: 156,
    },
    {
      rank: 4,
      name: 'Edelman Group',
      category: 'Global Communications',
      stashPercent: 88,
      trashPercent: 12,
      trend: 'up',
      votes: 203,
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <div className="barometer-page">
      <div className="barometer-container">
        <div className="barometer-header">
          <h1>Creative Barometer</h1>
          <p className="subtitle">Real-time Brand Rankings & Sentiment</p>
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          <button className={`filter-btn ${selectedCategory === 'All' ? 'active' : ''}`} onClick={() => setSelectedCategory('All')}>
            All
          </button>
          <button className={`filter-btn ${selectedCategory === 'Tech' ? 'active' : ''}`} onClick={() => setSelectedCategory('Tech')}>
            Tech
          </button>
          <button className={`filter-btn ${selectedCategory === 'Media' ? 'active' : ''}`} onClick={() => setSelectedCategory('Media')}>
            Media
          </button>
          <button className={`filter-btn ${selectedCategory === 'Consultancy' ? 'active' : ''}`} onClick={() => setSelectedCategory('Consultancy')}>
            Consultancy
          </button>
        </div>

        {/* Rankings */}
        <div className="rankings-grid">
          {rankings.map((brand) => (
            <div key={brand.rank} className="ranking-card">
              <div className="ranking-badge">{brand.rank}</div>

              <div className="ranking-header">
                <h2>{brand.name}</h2>
                <span className="category-tag">{brand.category}</span>
              </div>

              <div className="ranking-metrics">
                <div className="metric">
                  <span className="metric-label">Last 30 Days</span>
                  <span className={`metric-value trend-${brand.trend}`}>
                    {brand.trend === 'up' ? '📈' : '📉'}
                  </span>
                </div>
                <div className="metric">
                  <span className="metric-label">Total Votes</span>
                  <span className="metric-value">{brand.votes}</span>
                </div>
              </div>

              <div className="sentiment-bar">
                <div className="sentiment-stash" style={{ width: `${brand.stashPercent}%` }}>
                  <span className="sentiment-label">{brand.stashPercent}% Stash</span>
                </div>
                <div className="sentiment-trash" style={{ width: `${brand.trashPercent}%` }}>
                  <span className="sentiment-label">{brand.trashPercent}% Trash</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BarometerPage;
