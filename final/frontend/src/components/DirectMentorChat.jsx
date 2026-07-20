import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';

const DirectMentorChat = ({ courseId, courseTitle, isMentor = false }) => {
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedMode, setSelectedMode] = useState(isMentor ? 'all' : 'student');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [unreadContactIds, setUnreadContactIds] = useState(new Set());
  const [hasGroupUnread, setHasGroupUnread] = useState(false);
  const [showConversationMenu, setShowConversationMenu] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const token = localStorage.getItem('access_token');
  const userId = localStorage.getItem('user_id');

  const loadDirectConversations = useCallback(async () => {
    try {
      const response = await axios.get(`/api/qa-messages/direct/?course=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allDirect = response.data;
      setContacts([...new Map(allDirect.map((message) => {
        const otherId = String(message.user) === String(userId) ? message.recipient : message.user;
        const otherName = String(message.user) === String(userId) ? message.recipient_name : message.user_name;
        return [otherId, { id: otherId, name: otherName }];
      })).values()]);

      const unreadIds = new Set();
      allDirect.forEach((message) => {
        if (String(message.user) !== String(userId) && String(message.recipient) === String(userId) && !message.is_read) {
          unreadIds.add(String(message.user));
        }
      });
      setUnreadContactIds(unreadIds);
    } catch (error) {
      console.error(error);
    }
  }, [courseId, token, userId]);

  const loadGroupMessages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/qa-messages/?course=${courseId}&mark_read=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const groupMessages = response.data.results || response.data;
      setMessages(groupMessages);
      setHasGroupUnread(groupMessages.some((message) => String(message.user) !== String(userId) && !message.is_read));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [courseId, token, userId]);

  const loadConversation = useCallback(async () => {
    setLoading(true);
    try {
      if (isMentor && selectedMode === 'all') {
        await loadGroupMessages();
        setHasGroupUnread(false);
        return;
      }

      const response = await axios.get(`/api/qa-messages/direct/?course=${courseId}${selectedStudentId ? `&student=${selectedStudentId}` : ''}&mark_read=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
      if (selectedStudentId) {
        setUnreadContactIds((current) => {
          const next = new Set(current);
          next.delete(selectedStudentId);
          return next;
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [courseId, token, isMentor, selectedMode, selectedStudentId, loadGroupMessages]);

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;
    setContacts((current) => {
      const next = [...current];
      const [moved] = next.splice(draggedIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDraggedIndex(null);
  };

  useEffect(() => {
    if (isMentor) {
      loadDirectConversations();
    }
  }, [isMentor, loadDirectConversations]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  const selectedStudentName = selectedStudentId ? contacts.find((c) => c.id === selectedStudentId)?.name : '';

  const selectStudent = async (studentId) => {
    const newMode = studentId === 'all' ? 'all' : 'student';
    const newStudentId = studentId === 'all' ? '' : studentId;
    const sameSelection = newMode === selectedMode && newStudentId === selectedStudentId;

    setSelectedMode(newMode);
    setSelectedStudentId(newStudentId);
    setShowConversationMenu(false);

    if (sameSelection) {
      await loadConversation();
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!text.trim() || (isMentor && selectedMode === 'student' && !selectedStudentId)) return;
    try {
      const endpoint = selectedMode === 'all' ? '/api/qa-messages/' : '/api/qa-messages/direct/';
      const payload = {
        course: courseId,
        message: text.trim(),
        ...(isMentor && selectedMode === 'student' ? { recipient: selectedStudentId } : {})
      };
      const response = await axios.post(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } });
      setMessages((current) => [...current, response.data]);
      setText('');
      if (isMentor) {
        if (selectedMode === 'student') {
          setUnreadContactIds((current) => {
            const next = new Set(current);
            next.delete(selectedStudentId);
            return next;
          });
        } else if (selectedMode === 'all') {
          setHasGroupUnread(false);
        }
      }
    } catch (error) {
      alert(error.response?.data?.detail || 'Could not send your message.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '360px', padding: '20px', gap: '14px' }}>
      <div>
        <h3 style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: 0 }}><MessageCircle size={20} /> {isMentor ? 'Student messages' : 'Message your mentor'}</h3>
        <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{courseTitle || 'Private course conversation'}</p>
      </div>

      {isMentor && (
        <div style={{ display: 'grid', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <strong>Mentor conversations</strong>
          </div>
          <button
            type="button"
            onClick={async () => {
              setShowConversationMenu((current) => !current);
              if (selectedMode === 'all') {
                await loadConversation();
              }
            }}
            style={{
              textAlign: 'left',
              padding: '10px 12px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>{selectedMode === 'all' ? 'All students' : selectedStudentName || 'Choose a student'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {selectedMode === 'all' && hasGroupUnread && <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'red' }} />}
              {showConversationMenu ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>
          {showConversationMenu && (
            <div style={{ display: 'grid', gap: '6px' }}>
              <button
                type="button"
                onClick={() => selectStudent('all')}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: selectedMode === 'all' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  background: selectedMode === 'all' ? 'var(--bg-tertiary)' : 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>All students</span>
                {hasGroupUnread && <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'red' }} />}
              </button>
              {contacts.map((contact, index) => {
                const hasUnread = unreadContactIds.has(contact.id);
                return (
                  <button
                    key={contact.id}
                    type="button"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    onClick={() => selectStudent(contact.id)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: selectedStudentId === contact.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      background: selectedStudentId === contact.id ? 'var(--bg-tertiary)' : 'transparent',
                      color: 'inherit',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>{contact.name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {hasUnread && <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'red' }} />}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>↕</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: 0 }}>
        {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading messages…</p> : messages.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '32px' }}>{isMentor && selectedMode === 'student' && !selectedStudentId ? 'Choose a student to view their conversation.' : 'No messages yet. Start the conversation.'}</p>
        ) : messages.map((message) => {
          const mine = String(message.user) === String(userId);
          return <div key={message.id} style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '86%', padding: '10px 12px', borderRadius: '12px', background: mine ? 'var(--accent-primary)' : 'var(--bg-tertiary)', color: mine ? '#fff' : 'var(--text-primary)' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, marginBottom: '4px' }}>{mine ? 'You' : message.user_name}</div>
            <div style={{ fontSize: '0.88rem', whiteSpace: 'pre-wrap' }}>{message.message}</div>
          </div>;
        })}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '8px' }}>
        <input className="form-input" value={text} onChange={(event) => setText(event.target.value)} disabled={isMentor && selectedMode === 'student' && !selectedStudentId} placeholder={isMentor && selectedMode === 'student' && !selectedStudentId ? 'Choose a student first' : 'Write a private message…'} />
        <button type="submit" className="btn btn-primary" disabled={isMentor && selectedMode === 'student' && !selectedStudentId} aria-label="Send message"><Send size={18} /></button>
      </form>
    </div>
  );
};

export default DirectMentorChat;
