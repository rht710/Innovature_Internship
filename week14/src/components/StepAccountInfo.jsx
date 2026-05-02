import React from 'react';

const StepAccountInfo = ({ formData, setFormData, errors }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="step-content">
      <div className={`form-group ${errors.email ? 'error' : ''}`}>
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="name@example.com"
        />
        {errors.email && <span className="error-text">{errors.email}</span>}
      </div>

      <div className={`form-group ${errors.password ? 'error' : ''}`}>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Min 8 chars, 1 letter, 1 number"
        />
        {errors.password && <span className="error-text">{errors.password}</span>}
      </div>

      <div className={`form-group ${errors.confirmPassword ? 'error' : ''}`}>
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm your password"
        />
        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
      </div>
    </div>
  );
};

export default StepAccountInfo;
