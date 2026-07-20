import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, ShieldAlert } from 'lucide-react';

const AdminPanel = () => {
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const coursesRes = await axios.get('/api/courses/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const usersRes = await axios.get('/api/users/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCourses(coursesRes.data.results || coursesRes.data);
      setUsers(usersRes.data.results || usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCourse = (courseId) => {
    axios.post(`/api/courses/${courseId}/approve_course/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => fetchAdminData())
    .catch(err => console.error(err));
  };

  const handleRejectCourse = (courseId) => {
    axios.post(`/api/courses/${courseId}/reject_course/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => fetchAdminData())
    .catch(err => console.error(err));
  };

  const handleApproveMentor = (userId) => {
    axios.post(`/api/users/${userId}/approve_mentor/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => fetchAdminData())
    .catch(err => console.error(err));
  };

  const pendingCourses = courses.filter(c => c.status === 'PENDING_APPROVAL' || c.status === 'DRAFT');
  const pendingMentors = users.filter(u => u.role === 'MENTOR' && !u.is_approved_mentor);

  if (loading) return <p style={{ textAlign: 'center', marginTop: '60px' }}>Loading admin dashboard...</p>;

  return (
    <div>
      <h1 style={{ marginBottom: '32px' }}>Admin Control Center</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* 1. Mentor Approval Queue */}
        <section>
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={22} style={{ color: 'var(--accent-warning)' }} />
            <span>Mentor Approvals ({pendingMentors.length})</span>
          </h2>
          <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Mentor Name</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Email</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Bio</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingMentors.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No mentors awaiting approval.</td>
                  </tr>
                ) : (
                  pendingMentors.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px 24px', fontWeight: '500' }}>{m.username}</td>
                      <td style={{ padding: '16px 24px' }}>{m.email}</td>
                      <td style={{ padding: '16px 24px' }}>{m.bio || 'No bio provided'}</td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <button onClick={() => handleApproveMentor(m.id)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                          <Check size={14} /> Approve
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Course Approval Queue */}
        <section>
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={22} style={{ color: 'var(--accent-warning)' }} />
            <span>Course Approvals ({pendingCourses.length})</span>
          </h2>
          <div className="premium-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Course Title</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Mentor</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Price</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingCourses.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No courses awaiting approval.</td>
                  </tr>
                ) : (
                  pendingCourses.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '16px 24px', fontWeight: '500' }}>{c.title}</td>
                      <td style={{ padding: '16px 24px' }}>{c.mentor_name}</td>
                      <td style={{ padding: '16px 24px' }}>{c.price === '0.00' ? 'Free' : `₹${parseFloat(c.price).toLocaleString()}`}</td>
                      <td style={{ padding: '16px 24px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleApproveCourse(c.id)} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: 'var(--accent-success)' }}>
                          Approve
                        </button>
                        <button onClick={() => handleRejectCourse(c.id)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', color: 'var(--accent-danger)' }}>
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminPanel;
