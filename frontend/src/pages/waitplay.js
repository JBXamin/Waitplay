import React from 'react';
import './WaitPlay.css';

const WaitPlay = () => {
  return (
    <div className="waitplay-container">
      <div className="waitplay-header">
        Your Food will be ready in around
      </div>
      <div className="waitplay-timer">
        25 - 35 mins
      </div>
      <div className="waitplay-message">
        Don’t feel you have to wait, turn your time into something rewarding
      </div>
      <button className="waitplay-button">
        Launch Waitplay Now
      </button>
    </div>
  );
};

export default WaitPlay;
