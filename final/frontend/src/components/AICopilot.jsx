import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import axios from 'axios';

const AICopilot = ({ course, currentLesson }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hi! I'm Lumina, your AI study co-pilot. Ask me anything about our course: **"${course?.title}"** or our current lesson: **"${currentLesson?.title || 'No active lesson'}"**!`
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const studentMessage = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'student', text: studentMessage }]);
    setSending(true);

    axios.post(`/api/courses/${course.id}/ai_copilot/`, {
      message: studentMessage,
      lesson_title: currentLesson?.title || 'General Chat',
      lesson_description: currentLesson?.description || 'Study session discussion'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    })
    .catch(err => {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I couldn't reach the AI service right now. Please check your backend connection." }]);
    })
    .finally(() => {
      setSending(false);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sparkles size={16} style={{ color: 'var(--accent-secondary)' }} />
        <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>AI Study Partner</span>
      </div>

      {/* Message Feed */}
      <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '300px' }}>
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            style={{
              alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end',
              maxWidth: '85%',
              padding: '10px 14px',
              borderRadius: msg.sender === 'ai' ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
              backgroundColor: msg.sender === 'ai' ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
              // AI messages use the light panel background, so they need the
              // theme's primary text color rather than white.
              color: msg.sender === 'ai' ? 'var(--text-primary)' : '#fff',
              fontSize: '0.85rem',
              lineHeight: '1.4',
              whiteSpace: 'pre-wrap',
              border: msg.sender === 'ai' ? '1px solid var(--border-color)' : 'none'
            }}
          >
            {msg.text}
          </div>
        ))}
        {sending && (
          <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: '12px 12px 12px 2px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Lumina is thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} style={{ display: 'flex', borderTop: '1px solid var(--border-color)', padding: '10px' }}>
        <input 
          type="text" 
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question about this lesson..."
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '8px 12px',
            fontSize: '0.85rem',
            outline: 'none'
          }}
        />
        <button 
          type="submit" 
          style={{
            marginLeft: '8px',
            backgroundColor: 'var(--accent-primary)',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 12px',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Send size={16} />
        </button>
      </form>

    </div>
  );
};

export default AICopilot;
