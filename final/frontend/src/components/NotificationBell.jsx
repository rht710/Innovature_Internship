import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (!token || !userId) return;

    // Fetch existing notifications
    axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/notifications/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setNotifications(res.data.results || res.data))
    .catch(err => console.error(err));

    // Connect WebSocket
    const wsUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsUrl}/ws/notifications/?user_id=${userId}`);

    ws.onmessage = (event) => {
      const newNotif = JSON.parse(event.data);
      setNotifications(prev => [newNotif, ...prev]);
    };

    return () => ws.close();
  }, [token, userId]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleMarkAllRead = () => {
    axios.post('/api/notifications/mark_all_read/', {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    })
    .catch(err => console.error(err));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', position: 'relative', display: 'flex', alignItems: 'center' }}
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: 'var(--accent-danger)',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '35px',
          width: '320px',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-premium)',
          zIndex: 1000,
          padding: '16px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
            <h4 style={{ margin: 0 }}>Notifications</h4>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead} 
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '12px' }}
              >
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '15px' }}>No notifications</p>
          ) : (
            notifications.map(n => (
              <div 
                key={n.id} 
                style={{
                  padding: '10px',
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: n.is_read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                  borderRadius: '6px',
                  marginBottom: '6px'
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '13px' }}>{n.title}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '3px' }}>{n.message}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
