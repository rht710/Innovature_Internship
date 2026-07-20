import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, BookOpen, Clock, Award, CreditCard, Loader2 } from 'lucide-react';
import CourseDetailsModal from './CourseDetailsModal';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [userId, setUserId] = useState(null);
  const [enrollmentId, setEnrollmentId] = useState(null);
  
  // Interactive Sandbox Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null); // 'stripe', 'paypal', or 'razorpay'
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [stripeTransactionId, setStripeTransactionId] = useState(null);

  // Stripe form fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // PayPal form fields
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalPassword, setPaypalPassword] = useState('');

  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('user_role');

  useEffect(() => {
    // Check if enrolled
    if (token && role === 'STUDENT') {
      axios.get('/api/enrollments/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const enrollment = res.data.results.find(e => e.course === id || parseInt(e.course) === parseInt(id));
        if (enrollment) {
          setEnrolled(true);
          setEnrollmentId(enrollment.id);
        } else {
          setEnrolled(false);
          setEnrollmentId(null);
        }
      })
      .catch(err => console.error(err));

      // Fetch user profile to get User ID for Stripe Webhook simulation
      axios.get('/api/users/me/', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setUserId(res.data.id);
      })
      .catch(err => console.error(err));
    }

    // Fetch course details
    axios.get(`/api/courses/${id}/`)
      .then(res => {
        setCourse(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id, token, role]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const triggerRazorpayCheckout = async () => {
    const resScript = await loadRazorpayScript();
    if (!resScript) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      // 1. Create simulated order in backend
      const orderRes = await axios.post('/api/payments/create_razorpay_order/', {
        course_id: course.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const orderData = orderRes.data;

      if (orderData.simulated) {
        // If dummy keys, allow explicit sandbox success/failure simulation.
        const simulateSuccess = window.confirm(
          "Razorpay Sandbox Mode:\n\nOK = simulate successful payment\nCancel = simulate failed payment"
        );

        if (simulateSuccess) {
          await axios.post('/api/payments/verify_razorpay_payment/', {
            razorpay_order_id: orderData.razorpay_order_id,
            razorpay_payment_id: 'pay_simulated_demo',
            razorpay_signature: 'sig_simulated_demo'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setEnrolled(true);
          navigate('/dashboard');
        } else {
          try {
            await axios.post('/api/payments/verify_razorpay_payment/', {
              razorpay_order_id: orderData.razorpay_order_id,
              razorpay_payment_id: 'pay_failed_simulated',
              razorpay_signature: 'sig_failed_simulated'
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (_) {
            // Expected failure in sandbox simulation.
          }
          alert('Razorpay sandbox payment was simulated as failed. Please retry or choose another gateway.');
        }
      } else {
        // Trigger real Razorpay popup
        const options = {
          key: orderData.razorpay_key_id,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Learning Platform',
          description: `Enroll in: ${orderData.course_title}`,
          order_id: orderData.razorpay_order_id,
          handler: async function (response) {
            await axios.post('/api/payments/verify_razorpay_payment/', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setEnrolled(true);
            navigate('/dashboard');
          },
          prefill: {
            name: orderData.student_name,
            email: orderData.student_email
          },
          theme: {
            color: '#6366f1'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Razorpay checkout failed.');
    }
  };

  const triggerStripeCheckout = async () => {
    setEnrolling(true);
    try {
      const res = await axios.post('/api/payments/create_checkout_session/', {
        course_id: course.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.simulated) {
        // Stripe is unavailable or sandbox mode is active, show the local sandbox flow.
        setStripeTransactionId(res.data.transaction_id || null);
        setSelectedGateway('stripe');
        setShowPaymentModal(true);
        setPaymentSuccess(false);
        setSandboxLoading(false);
        setEnrolling(false);
      } else if (res.data.checkout_url) {
        // Redirect directly to official Stripe-hosted checkout page.
        window.location.href = res.data.checkout_url;
      } else {
        throw new Error('No Stripe checkout URL returned.');
      }
    } catch (err) {
      const backendMessage = err.response?.data?.error || err.message;
      console.warn("Stripe checkout failed to initiate:", backendMessage, err);
      if (backendMessage && backendMessage.toLowerCase().includes('already enrolled')) {
        alert(backendMessage);
      } else {
        alert('Stripe payment could not be completed. Falling back to Razorpay.');
        await triggerRazorpayCheckout();
      }
      setEnrolling(false);
    }
  };

  const handleStripeSandboxPay = async (e) => {
    e.preventDefault();
    if (!cardNumber || !cardName) {
      alert("Please fill out your card details.");
      return;
    }

    setSandboxLoading(true);

    try {
      // Direct POST call to Stripe Webhook to simulate the Stripe server callback logic
      const transactionId = stripeTransactionId || `txn_sim_${Date.now()}`;
      await axios.post('/api/payments/stripe_webhook/', {
        type: 'checkout.session.completed',
        data: {
          object: {
            metadata: {
              transaction_id: transactionId,
              user_id: userId,
              course_id: course.id
            }
          }
        }
      });

      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPaymentModal(false);
        setEnrolled(true);
        navigate('/dashboard');
      }, 1500);

    } catch (err) {
      console.error(err);
      alert("Stripe sandbox checkout failed.");
    } finally {
      setSandboxLoading(false);
    }
  };

  const handlePaypalSandboxPay = async (e) => {
    e.preventDefault();
    if (!paypalEmail || !paypalPassword) {
      alert("Please enter your sandbox PayPal login.");
      return;
    }

    setSandboxLoading(true);

    try {
      // 1. Create order in backend
      const res = await axios.post('/api/payments/create_paypal_payment/', {
        course_id: course.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const orderId = res.data.transaction_id;

      await new Promise(resolve => setTimeout(resolve, 1500));

      // 2. Capture payment in backend
      await axios.post('/api/payments/capture_paypal_payment/', {
        order_id: orderId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPaymentSuccess(true);
      setTimeout(() => {
        setShowPaymentModal(false);
        setEnrolled(true);
        navigate('/dashboard');
      }, 1500);

    } catch (err) {
      console.error(err);
      alert("PayPal sandbox checkout failed.");
    } finally {
      setSandboxLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (!window.confirm("Are you sure you want to unenroll from this course? Your progress will be lost.")) return;
    setEnrolling(true);
    try {
      await axios.delete(`/api/enrollments/${enrollmentId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrolled(false);
      setEnrollmentId(null);
      alert("Successfully unenrolled from the course.");
    } catch (err) {
      console.error(err);
      alert("Failed to unenroll.");
    } finally {
      setEnrolling(false);
    }
  };

  const handleDemoBypass = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setEnrolling(true);
    try {
      const orderRes = await axios.post('/api/payments/create_razorpay_order/', {
        course_id: course.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await axios.post('/api/payments/verify_razorpay_payment/', {
        razorpay_order_id: orderRes.data.razorpay_order_id,
        razorpay_payment_id: 'pay_simulated_demo',
        razorpay_signature: 'sig_simulated_demo'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrolled(true);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      // Fallback
      try {
        await axios.post('/api/enrollments/', { course: course.id }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEnrolled(true);
        navigate('/dashboard');
      } catch (e) {
        alert("Demo bypass failed.");
      }
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '60px' }}>Loading course...</p>;
  if (!course) return <p style={{ textAlign: 'center', marginTop: '60px' }}>Course not found.</p>;

  return (
    <>
      <CourseDetailsModal
        show={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedGateway(null);
          setPaymentSuccess(false);
          setSandboxLoading(false);
        }}
        title={selectedGateway === 'stripe' ? 'Stripe Sandbox Checkout' : 'Payment Checkout'}
      >
        {selectedGateway === 'stripe' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Since Stripe is running in sandbox/demo mode locally, enter mock card data and submit to complete enrollment.
            </p>
            {paymentSuccess ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: 600, color: 'var(--accent-success)' }}>Payment completed successfully.</p>
                <p style={{ color: 'var(--text-secondary)' }}>Redirecting to your dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleStripeSandboxPay} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Card Number (eg. 4242 4242 4242 4242)"
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  className="input-field"
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    className="input-field"
                    style={{ flex: 1 }}
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    value={cardCvc}
                    onChange={e => setCardCvc(e.target.value)}
                    className="input-field"
                    style={{ width: '140px' }}
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={sandboxLoading}>
                  {sandboxLoading ? 'Completing payment...' : 'Complete Stripe Payment'}
                </button>
              </form>
            )}
          </div>
        )}
      </CourseDetailsModal>

      <div style={{ display: 'flex', gap: '40px', position: 'relative' }}>
      
      {/* Course Main Details */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>{course.title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '32px' }}>
          {course.description}
        </p>

        {/* Syllabus / Modules */}
        <h2 style={{ marginBottom: '20px' }}>Course Curriculum</h2>
        {course.modules && course.modules.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No curriculum outline published yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {course.modules?.map((mod, idx) => (
              <div key={mod.id} className="premium-card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Module {idx + 1}: {mod.title}</h4>
                <ul style={{ listStyle: 'none', paddingLeft: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {mod.lessons?.map(les => (
                    <li key={les.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={16} />
                        <span>{les.title} ({les.content_type})</span>
                      </div>
                      {les.attachment && (
                        <a href={les.attachment} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textDecoration: 'underline', marginLeft: '24px' }}>
                          View document
                        </a>
                      )}
                      {!les.attachment && les.file && (
                        <a href={les.file} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textDecoration: 'underline', marginLeft: '24px' }}>
                          View file
                        </a>
                      )}
                      {les.content_type === 'VIDEO' && les.video_url && (
                        <a href={les.video_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textDecoration: 'underline', marginLeft: '24px' }}>
                          Watch video
                        </a>
                      )}
                    </li>
                  ))}
                  {mod.quizzes?.map(qz => (
                    <li key={qz.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-secondary)' }}>
                      <Award size={16} />
                      <span>Quiz: {qz.title} (Passing score: {qz.passing_score}%)</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pricing / Call-to-action Sidebar */}
      <div className="premium-card" style={{ width: '360px', flexShrink: 0, height: 'fit-content' }}>
        <h3 style={{ marginBottom: '16px' }}>Course Enrollment</h3>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px' }}>
          {course.price === '0.00' ? 'Free' : `₹${parseFloat(course.price).toLocaleString()}`}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} />
            <span>Lifetime Access</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} />
            <span>Shareable Certificate upon Completion</span>
          </div>
        </div>

        {role === 'MENTOR' || role === 'ADMIN' ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
            Log in as a Student to enroll in courses.
          </p>
        ) : enrolled ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button onClick={() => navigate(`/learn/${id}`)} className="btn btn-primary" style={{ width: '100%' }}>
              Go to Learning Workspace
            </button>
            <button 
              onClick={handleUnenroll} 
              className="btn btn-secondary" 
              style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}
              disabled={enrolling}
            >
              Unenroll from Course
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={() => {
                if (!token) {
                  navigate('/login');
                  return;
                }
                if (course.price === '0.00') {
                  handleDemoBypass();
                } else {
                  triggerStripeCheckout();
                }
              }} 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={enrolling || showPaymentModal}
            >
              {enrolling ? 'Processing...' : course.price === '0.00' ? 'Enroll Now' : 'Purchase Course'}
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default CourseDetails;
