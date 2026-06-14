import React, { useState, useEffect } from 'react';
import './index.css';
import ProgressBar from './components/ProgressBar';
import StepPersonalInfo from './components/StepPersonalInfo';
import StepAccountInfo from './components/StepAccountInfo';
import StepReview from './components/StepReview';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('registrationFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Don't load passwords for security reasons in real apps, but for this demo we can
        setFormData(parsedData);
      } catch (e) {
        console.error("Failed to parse local storage data");
      }
    }
  }, []);

  // Save to local storage whenever formData changes
  useEffect(() => {
    // Only save if not submitted to avoid saving empty state after clear
    if (!isSubmitted) {
      localStorage.setItem('registrationFormData', JSON.stringify(formData));
    }
  }, [formData, isSubmitted]);

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = 'First name is required';
        isValid = false;
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = 'Last name is required';
        isValid = false;
      }
      if (!formData.dob) {
        newErrors.dob = 'Date of birth is required';
        isValid = false;
      }
    } else if (step === 2) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
        isValid = false;
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
        isValid = false;
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
        isValid = false;
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
        isValid = false;
      } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)) {
        newErrors.password = 'Password must contain both letters and numbers';
        isValid = false;
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
    setErrors({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(3)) { // 3rd step has no specific inputs to validate, just submit
      console.log('Form Submitted:', formData);
      setIsSubmitted(true);
      // Optional: Clear form data from local storage
      // localStorage.removeItem('registrationFormData');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepPersonalInfo 
            formData={formData} 
            setFormData={setFormData} 
            errors={errors} 
          />
        );
      case 2:
        return (
          <StepAccountInfo 
            formData={formData} 
            setFormData={setFormData} 
            errors={errors} 
          />
        );
      case 3:
        return <StepReview formData={formData} />;
      default:
        return null;
    }
  };

  if (isSubmitted) {
    return (
      <div className="app-container">
        <div className="form-card" style={{ textAlign: 'center' }}>
          <div className="success-icon">✓</div>
          <h2 style={{ marginBottom: '1rem' }}>Registration Complete!</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Your account has been successfully created.
          </p>
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '2rem' }}
            onClick={() => {
              setIsSubmitted(false);
              setCurrentStep(1);
              setFormData({ firstName: '', lastName: '', dob: '', email: '', password: '', confirmPassword: '' });
              localStorage.removeItem('registrationFormData');
            }}
          >
            Register Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="form-card">
        <div className="form-header">
          <h1>Join Us Today</h1>
          <p>Create your account in just 3 simple steps.</p>
        </div>

        <ProgressBar currentStep={currentStep} totalSteps={3} />

        <div style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--primary-color)', fontWeight: '600' }}>
          {currentStep === 1 && "Step 1 of 3: Personal Information"}
          {currentStep === 2 && "Step 2 of 3: Account Details (Email & Password)"}
          {currentStep === 3 && "Step 3 of 3: Review Details"}
        </div>

        <form onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()}>
          {renderStep()}

          <div className="btn-container">
            {currentStep > 1 && (
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={prevStep}
              >
                Back
              </button>
            )}
            
            {currentStep < 3 ? (
              <button 
                key="next-btn"
                type="button" 
                className="btn btn-primary" 
                onClick={nextStep}
              >
                Continue
              </button>
            ) : (
              <button 
                key="submit-btn"
                type="submit" 
                className="btn btn-primary"
              >
                Submit Registration
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
