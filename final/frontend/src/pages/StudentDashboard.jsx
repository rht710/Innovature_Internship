import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Award, BookOpen, ExternalLink, Shield, Star, Crown, Zap, Lock } from 'lucide-react';

const StudentDashboard = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    // Fetch all details concurrently
    Promise.all([
      axios.get('/api/enrollments/', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get('/api/users/me/', {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get('/api/badges/my_badges/', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
    .then(([enrolRes, userRes, badgeRes]) => {
      setEnrollments(enrolRes.data.results || enrolRes.data);
      setUserProfile(userRes.data);
      setBadges(badgeRes.data);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, [token]);

  const getBadgeIcon = (iconType, unlocked) => {
    const size = 24;
    const color = unlocked ? 'var(--accent-secondary)' : 'var(--text-muted)';
    switch (iconType) {
      case 'SHIELD':
        return <Shield size={size} style={{ color }} />;
      case 'CROWN':
        return <Crown size={size} style={{ color: unlocked ? 'var(--accent-warning)' : 'var(--text-muted)' }} />;
      case 'STAR':
        return <Star size={size} style={{ color: unlocked ? 'var(--accent-warning)' : 'var(--text-muted)' }} />;
      default:
        return <Award size={size} style={{ color }} />;
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '60px' }}>Loading dashboard...</p>;

  // XP calculations: 100 XP per level
  const currentXP = userProfile ? userProfile.xp : 0;
  const currentLevel = userProfile ? userProfile.level : 1;
  const xpInCurrentLevel = currentXP % 100;
  const xpProgressPercent = xpInCurrentLevel; // Out of 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* 1. Gamification Header Panel */}
      {userProfile && (
        <div className="premium-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center', background: 'linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(99,102,241,0.05) 100%)' }}>
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: 'rgba(168,85,247,0.1)',
            border: '1px solid rgba(168,85,247,0.2)',
            textAlign: 'center',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-secondary)' }}>Rank Level</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: '4px' }}>{currentLevel}</div>
          </div>
          
          <div style={{ flex: 1, minWidth: '280px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Zap size={22} style={{ color: 'var(--accent-warning)' }} />
              <span>Welcome Back, {userProfile.username}!</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
              Keep learning to level up your status. Unlock milestones to showcase achievements on your portfolio.
            </p>
            
            {/* XP progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px' }}>
                <span>XP Progress ({xpInCurrentLevel}/100 XP)</span>
                <span>Total XP: {currentXP}</span>
              </div>
              <div style={{ height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${xpProgressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)', borderRadius: '4px' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Column: Courses list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2>My Enrolled Courses</h2>
          {enrollments.length === 0 ? (
            <div className="premium-card" style={{ textAlign: 'center', padding: '60px' }}>
              <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3>No Enrolled Courses</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px', marginBottom: '24px' }}>
                You haven't enrolled in any courses yet. Start browsing the catalog!
              </p>
              <Link to="/" className="btn btn-primary">Browse Catalog</Link>
            </div>
          ) : (
            enrollments.map(enrol => (
              <div key={enrol.id} className="premium-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.4rem', marginBottom: '12px' }}>{enrol.course_title}</h3>
                  
                  {/* Progress Bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '500px' }}>
                    <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${enrol.progress_percentage}%`, height: '100%', background: 'linear-gradient(95deg, var(--accent-primary), var(--accent-secondary))' }}></div>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', minWidth: '40px' }}>
                      {Math.round(enrol.progress_percentage)}%
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {enrol.is_completed && enrol.certificate_url && (
                    <a 
                      href={enrol.certificate_url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-secondary" 
                      style={{ color: 'var(--accent-success)', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Award size={18} />
                      <span>Certificate</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                  <Link to={`/learn/${enrol.course}`} className="btn btn-primary">
                    Resume Course
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Badges cabinet */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2>Achievements Cabinet</h2>
          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {badges.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No achievements configured yet.</p>
            ) : (
              badges.map(badge => (
                <div 
                  key={badge.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    backgroundColor: badge.unlocked ? 'rgba(99,102,241,0.08)' : 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    opacity: badge.unlocked ? 1 : 0.85,
                    transition: 'var(--transition-smooth)'
                  }}
                  title={badge.description}
                >
                  <div style={{
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: badge.unlocked ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: badge.unlocked ? 'none' : '1px solid var(--border-color)'
                  }}>
                    {getBadgeIcon(badge.icon_type, badge.unlocked)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.85rem', color: badge.unlocked ? 'var(--text-primary)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{badge.name}</span>
                      {!badge.unlocked && <Lock size={12} style={{ color: 'var(--text-muted)' }} />}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: badge.unlocked ? 'var(--text-secondary)' : 'var(--text-muted)', marginTop: '2px' }}>{badge.description}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

export default StudentDashboard;
