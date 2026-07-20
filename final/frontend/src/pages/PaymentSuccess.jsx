import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [courseId, setCourseId] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const token = localStorage.getItem('access_token');

    if (!sessionId) {
      setStatus('error');
      setMessage('No payment session found.');
      return;
    }

    // Ask backend to verify the Stripe session and enroll the student
    axios.post('/api/payments/confirm_stripe_session/', {
      session_id: sessionId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setStatus('success');
      setCourseId(res.data.course_id);
      setMessage(res.data.message || 'Payment confirmed! You are now enrolled.');
      // Auto-redirect to learning workspace after 2.5s
      setTimeout(() => {
        if (res.data.course_id) {
          navigate(`/learn/${res.data.course_id}`);
        } else {
          navigate('/dashboard');
        }
      }, 2500);
    })
    .catch(err => {
      // If already enrolled or session already processed, redirect gracefully
      const errMsg = err.response?.data?.error || err.message || 'Unknown error';
      if (errMsg.includes('already enrolled') || errMsg.includes('already processed')) {
        setStatus('success');
        setMessage('You are already enrolled in this course!');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setStatus('error');
        setMessage(errMsg);
      }
    });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-primary)',
      padding: '20px'
    }}>
      <div className="premium-card" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '48px 36px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        textAlign: 'center'
      }}>

        {/* VERIFYING */}
        {status === 'verifying' && (
          <>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              border: '4px solid var(--accent-primary)',
              borderTopColor: 'transparent',
              animation: 'spin 0.8s linear infinite'
            }} />
            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>Verifying Payment…</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Please wait while we confirm your transaction with Stripe and set up your course access.
            </p>
          </>
        )}

        {/* SUCCESS */}
        {status === 'success' && (
          <>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              backgroundColor: 'rgba(16,185,129,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.2rem',
              animation: 'scaleUp 0.4s ease-out'
            }}>
              ✓
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#10b981' }}>Payment Successful!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{message}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Redirecting you to your learning workspace…</p>
          </>
        )}

        {/* ERROR */}
        {status === 'error' && (
          <>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              backgroundColor: 'rgba(239,68,68,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', color: '#ef4444'
            }}>
              ✕
            </div>
            <h2 style={{ fontSize: '1.4rem', color: '#ef4444' }}>Payment Error</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{message}</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/')}
              style={{ marginTop: '8px' }}
            >
              Return to Home
            </button>
          </>
        )}

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scaleUp { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default PaymentSuccess;
