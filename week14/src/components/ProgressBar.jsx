import React from 'react';

const ProgressBar = ({ currentStep, totalSteps }) => {
  const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="progress-container">
      <div className="progress-track">
        <div 
          className="progress-fill" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="progress-labels">
        <span className={`step-label ${currentStep >= 1 ? 'active' : ''}`}>Personal</span>
        <span className={`step-label ${currentStep >= 2 ? 'active' : ''}`}>Account</span>
        <span className={`step-label ${currentStep >= 3 ? 'active' : ''}`}>Review</span>
      </div>
    </div>
  );
};

export default ProgressBar;
