import React from 'react';

const StepPersonalInfo = ({ formData, setFormData, errors }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="step-content">
      <div className={`form-group ${errors.firstName ? 'error' : ''}`}>
        <label htmlFor="firstName">First Name</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="e.g. Jane"
        />
        {errors.firstName && <span className="error-text">{errors.firstName}</span>}
      </div>

      <div className={`form-group ${errors.lastName ? 'error' : ''}`}>
        <label htmlFor="lastName">Last Name</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="e.g. Doe"
        />
        {errors.lastName && <span className="error-text">{errors.lastName}</span>}
      </div>
      
      <div className={`form-group ${errors.dob ? 'error' : ''}`}>
        <label htmlFor="dob">Date of Birth</label>
        <input
          type="date"
          id="dob"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
        />
        {errors.dob && <span className="error-text">{errors.dob}</span>}
      </div>
    </div>
  );
};

export default StepPersonalInfo;
