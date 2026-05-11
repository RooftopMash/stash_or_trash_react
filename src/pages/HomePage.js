import React, { useState, useRef, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import './HomePage.css';

const HomePage = ({ user, t }) => {
  const [brands, setBrands] = useState([
    { id: 1, name: 'MOO', category: 'Digital Agency', description: 'Digital Agency', logo: '🎯' },
    { id: 2, name: 'EDELMAN GROUP', category: 'Global Communications', description: 'Global Communications Firm', logo: '🌍' },
    { id: 3, name: 'AGENCY X', category: 'Creative Agency', description: 'Creative Agency', logo: '⚡' },
  ]);

  const [currentBrandIndex, setCurrentBrandIndex] = useState(0);
  const [stashCount, setStashCount] = useState(42);
  const [trashCount, setTrashCount] = useState(28);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const currentBrand = brands[currentBrandIndex];

  const handleVote = async (voteType) => {
    setLoading(true);
    try {
      if (voteType === 'stash') {
        setStashCount(stashCount + 1);
      } else {
        setTrashCount(trashCount + 1);
      }

      // Add to Firestore
      if (db) {
        await addDoc(collection(db, 'votes'), {
          brand: currentBrand.name,
          voteType,
          userId: user?.uid || 'anonymous',
          timestamp: serverTimestamp(),
        });
      }

      // Move to next brand
      setCurrentBrandIndex((prev) => (prev + 1) % brands.length);
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      <div className="home-container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-title">
            <h1>Stash or Trash™</h1>
            <p className="tagline">Rate Brands. Influence Markets.</p>
          </div>

          {/* Brand Card */}
          <div className="brand-card">
            <div className="brand-card-header">
              <div className="brand-logo">{currentBrand.logo}</div>
              <div className="brand-info">
                <h2>{currentBrand.name}</h2>
                <p className="brand-category">{currentBrand.category}</p>
              </div>
            </div>
            <p className="brand-description">{currentBrand.description}</p>
          </div>

          {/* Voting Buttons */}
          <div className="voting-section">
            <button
              className="vote-btn stash-btn"
              onClick={() => handleVote('stash')}
              disabled={loading}
            >
              <div className="vote-icon">💰</div>
              <span className="vote-label">STASH</span>
              <span className="vote-subtitle">Vote Approval</span>
              <span className="vote-count">{stashCount}</span>
            </button>

            <button
              className="vote-btn trash-btn"
              onClick={() => handleVote('trash')}
              disabled={loading}
            >
              <div className="vote-icon">🗑️</div>
              <span className="vote-label">TRASH</span>
              <span className="vote-subtitle">Vote Poor Service</span>
              <span className="vote-count">{trashCount}</span>
            </button>
          </div>

          {/* Live Pulse */}
          <div className="live-pulse">
            <h3>Live Pulse</h3>
            <div className="pulse-bars">
              <div className="pulse-bar">
                <label>Satisfaction</label>
                <div className="bar-container">
                  <div className="bar" style={{ width: '76%', background: '#FFD700' }}></div>
                  <span>76%</span>
                </div>
              </div>
              <div className="pulse-bar">
                <label>Credibility</label>
                <div className="bar-container">
                  <div className="bar" style={{ width: '68%', background: var(--primary-red) }}></div>
                  <span>68%</span>
                </div>
              </div>
              <div className="pulse-bar">
                <label>Growth</label>
                <div className="bar-container">
                  <div className="bar" style={{ width: '87%', background: '#FFD700' }}></div>
                  <span>87%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
