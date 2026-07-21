import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, CornerDownRight, MessageSquare } from 'lucide-react';

const QAWorkspace = ({ courseId }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // Message object we are replying to
  const ws = useRef(null);
  const token = localStorage.getItem('access_token');
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    // Fetch initial QA messages
    axios.get(`/api/qa-messages/?course=${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      // Filter messages for this course (if queryset is not fully filtered by backend default)
      const courseMessages = res.data.results.filter(m => m.course === courseId && !m.parent_message);
      setMessages(courseMessages);
    })
    .catch(err => console.error(err));

    // Connect to WebSocket room
    const apiUrl = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.host}`;
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsHost = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/^https?/, protocol)
      : `${protocol}://${window.location.host}`;
    ws.current = new WebSocket(`${wsHost}/ws/chat/course/${courseId}/`);

    ws.current.onmessage = (event) => {
      const newMsg = JSON.parse(event.data);
      if (newMsg.parent_message) {
        // Find parent and append reply
        setMessages(prev => prev.map(m => {
          if (m.id === newMsg.parent_message) {
            return { ...m, replies: [...(m.replies || []), newMsg] };
          }
          return m;
        }));
      } else {
        setMessages(prev => [...prev, newMsg]);
      }
    };

    return () => ws.current.close();
  }, [courseId, token]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const payload = {
      message: messageText,
      user_id: userId,
      parent_id: replyingTo ? replyingTo.id : null
    };

    ws.current.send(JSON.stringify(payload));
    setMessageText('');
    setReplyingTo(null);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      backgroundColor: 'var(--bg-secondary)',
      borderLeft: '1px solid var(--border-color)',
      padding: '20px'
    }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
        <MessageSquare size={20} /> Course Q&A Chat
      </h3>

      {/* Message List */}
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>No questions asked yet. Be the first!</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>{msg.user_name}</span>
                  <button 
                    onClick={() => setReplyingTo(msg)} 
                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    Reply
                  </button>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{msg.message}</div>
              </div>

              {/* Threaded Replies */}
              {msg.replies && msg.replies.map(reply => (
                <div key={reply.id} style={{ display: 'flex', gap: '8px', marginLeft: '24px' }}>
                  <CornerDownRight size={16} style={{ color: 'var(--text-muted)', marginTop: '8px' }} />
                  <div style={{ flex: 1, padding: '10px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '4px' }}>{reply.user_name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{reply.message}</div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} style={{ position: 'relative' }}>
        {replyingTo && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '6px 12px',
            backgroundColor: 'var(--bg-tertiary)',
            borderTopLeftRadius: '10px',
            borderTopRightRadius: '10px',
            fontSize: '0.8rem',
            border: '1px solid var(--border-color)',
            borderBottom: 'none'
          }}>
            <span>Replying to <strong>{replyingTo.user_name}</strong></span>
            <button onClick={() => setReplyingTo(null)} style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}>Cancel</button>
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder={replyingTo ? "Write a reply..." : "Ask a question..."}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="form-input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '12px' }}>
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default QAWorkspace;
