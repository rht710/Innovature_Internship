import React from 'react';

const StepReview = ({ formData }) => {
  return (
    <div className="step-content">
      <div className="review-card">
        <div className="review-item">
          <span className="review-label">Full Name</span>
          <span className="review-value">{formData.firstName} {formData.lastName}</span>
        </div>
        <div className="review-item">
          <span className="review-label">Date of Birth</span>
          <span className="review-value">{formData.dob || 'Not provided'}</span>
        </div>
        <div className="review-item">
          <span className="review-label">Email Address</span>
          <span className="review-value">{formData.email}</span>
        </div>
        <div className="review-item">
          <span className="review-label">Password</span>
          <span className="review-value">••••••••</span>
        </div>
      </div>
      <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
        Please review your details. Click Submit to complete registration.
      </p>
    </div>
  );
};

export default StepReview;
