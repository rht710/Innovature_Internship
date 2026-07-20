import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, BookOpen, DollarSign, ListOrdered, Settings, Eye, Trash2, ArrowRight } from 'lucide-react';
import DirectMentorChat from '../components/DirectMentorChat';

const MentorDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form fields for course
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0.00');

  // Manual Module Builder State
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [messageCourse, setMessageCourse] = useState(null);
  const [courseMessageAlerts, setCourseMessageAlerts] = useState({});
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);

  const userId = localStorage.getItem('user_id');

  // Lesson Builder State
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState('DOCUMENT');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');
  const [newLessonDesc, setNewLessonDesc] = useState('');
  const [newLessonFile, setNewLessonFile] = useState(null);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchMentorCourses();
  }, [token]);

  const loadCourseMessageAlerts = async (coursesList) => {
    if (!coursesList.length) {
      setCourseMessageAlerts({});
      return;
    }

    const alerts = {};
    await Promise.all(coursesList.map(async (course) => {
      try {
        const [directResp, groupResp] = await Promise.all([
          axios.get(`/api/qa-messages/direct/?course=${course.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`/api/qa-messages/?course=${course.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const directMessages = directResp.data || [];
        const hasDirectUnread = directMessages.some((msg) => String(msg.recipient) === String(userId) && String(msg.user) !== String(userId) && !msg.is_read);
        const groupMessages = groupResp.data.results || groupResp.data || [];
        const hasGroupUnread = groupMessages.some((msg) => String(msg.user) !== String(userId) && !msg.is_read);

        alerts[course.id] = hasDirectUnread || hasGroupUnread;
      } catch (error) {
        console.error('Error loading course message alerts for', course.id, error);
        alerts[course.id] = false;
      }
    }));

    setCourseMessageAlerts(alerts);
  };

  const fetchMentorCourses = () => {
    axios.get('/api/courses/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const courseList = res.data.results || res.data;
      setCourses(courseList);
      loadCourseMessageAlerts(courseList);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  };

  const handleCreateCourse = (e) => {
    e.preventDefault();

    axios.post('/api/courses/', {
      title,
      description,
      price
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      setShowForm(false);
      setTitle('');
      setDescription('');
      setPrice('0.00');
      
      // Instantly append new course to local state to avoid refresh delay
      const newCourse = res.data;
      setCourses(prev => [newCourse, ...prev]);
      
      // Trigger background refetch to keep data fully synced
      fetchMentorCourses();
    })
    .catch(err => {
      console.error(err);
      alert("Failed to create course.");
    });
  };

  const handleAIGenerate = (courseId) => {
    if (!window.confirm("This will overwrite the existing curriculum. Proceed?")) return;
    
    alert("AI generation starting. Please wait...");

    axios.post(`/api/courses/${courseId}/generate_ai_content/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      alert(res.data.message || "AI Syllabus generated successfully!");
      fetchMentorCourses();
      if (selectedCourse && selectedCourse.id === courseId) {
        fetchCourseModules(courseId);
      }
    })
    .catch(err => {
      console.error(err);
      alert("Failed to generate AI syllabus.");
    });
  };

  const handleDeleteCourse = (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;

    axios.delete(`/api/courses/${courseId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setCourses(prev => prev.filter(c => c.id !== courseId));
      if (selectedCourse?.id === courseId) {
        setSelectedCourse(null);
      }
    })
    .catch(err => {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to delete course.");
    });
  };

  const handleTogglePublishStatus = (course) => {
    const newStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    axios.patch(`/api/courses/${course.id}/`, {
      status: newStatus
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setCourses(prev => prev.map(c => c.id === course.id ? res.data : c));
    })
    .catch(err => {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to update status.");
    });
  };

  // Manual Module Operations
  const handleOpenModuleBuilder = (course) => {
    setSelectedCourse(course);
    fetchCourseModules(course.id);
  };

  const fetchCourseModules = (courseId) => {
    setLoadingModules(true);
    axios.get(`/api/courses/${courseId}/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setModules(res.data.modules || []);
    })
    .catch(err => console.error(err))
    .finally(() => setLoadingModules(false));
  };

  const handleAddModule = (e) => {
    e.preventDefault();
    if (!newModuleTitle.trim() || !selectedCourse) return;

    axios.post('/api/modules/', {
      course: selectedCourse.id,
      title: newModuleTitle,
      order: modules.length + 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      setNewModuleTitle('');
      fetchCourseModules(selectedCourse.id);
      fetchMentorCourses(); // Refresh modules count in parent
    })
    .catch(err => {
      console.error(err);
      alert("Failed to add module.");
    });
  };

  const handleAddLesson = (moduleId) => {
    if (!newLessonTitle.trim()) return;

    const formData = new FormData();
    formData.append('module', moduleId);
    formData.append('title', newLessonTitle);
    formData.append('content_type', newLessonType);
    formData.append('order', (modules.find(m => m.id === moduleId)?.lessons?.length || 0) + 1);

    if (newLessonType === 'VIDEO') {
      formData.append('video_url', newLessonVideoUrl);
    } else if (newLessonType === 'DOCUMENT') {
      formData.append('description', newLessonDesc);
    } else if (newLessonType === 'PDF' && newLessonFile) {
      formData.append('file', newLessonFile);
    }

    axios.post('/api/lessons/', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(() => {
      setNewLessonTitle('');
      setNewLessonVideoUrl('');
      setNewLessonDesc('');
      setNewLessonFile(null);
      fetchCourseModules(selectedCourse.id); // Refresh nested lessons list
    })
    .catch(err => {
      console.error(err);
      alert("Failed to add lesson.");
    });
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '60px' }}>Loading mentor dashboard...</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Mentor Dashboard</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} />
          <span>New Course</span>
        </button>
      </div>

      {/* Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: '12px', color: 'var(--accent-primary)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Courses</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '4px' }}>{courses.length}</div>
          </div>
        </div>

        <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(168,85,247,0.1)', borderRadius: '12px', color: 'var(--accent-secondary)' }}>
            <ListOrdered size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Drafts Pending</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '4px' }}>
              {courses.filter(c => c.status === 'DRAFT').length}
            </div>
          </div>
        </div>

        <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: '12px', color: 'var(--accent-success)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Analytics Status</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '4px', color: 'var(--accent-success)' }}>Active</div>
          </div>
        </div>
      </div>

      {/* Main layout split (Courses list & Module Builder side-by-side if active) */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedCourse ? '1fr 400px' : '1fr', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Side: Course Listings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* New Course Form */}
          {showForm && (
            <form onSubmit={handleCreateCourse} className="premium-card" style={{ maxWidth: '600px', alignSelf: 'start', width: '100%' }}>
              <h3 style={{ marginBottom: '20px' }}>Create New Course</h3>
              
              <div className="form-group">
                <label className="form-label">Course Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="e.g. Advanced Machine Learning"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-input" 
                  rows="4" 
                  required 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Write a clear course overview..."
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Price (INR)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  required 
                  value={price} 
                  onChange={e => setPrice(e.target.value)} 
                  placeholder="0.00 for Free"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button type="submit" className="btn btn-primary">Create Course</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          )}

          {/* Courses List Table */}
          <div className="premium-card" style={{ padding: '0px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Course Title</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Status</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Price</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Rating</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No courses published yet.</td>
                  </tr>
                ) : (
                  courses.map(course => (
                    <tr 
                      key={course.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-color)', 
                        transition: 'var(--transition-smooth)',
                        backgroundColor: selectedCourse?.id === course.id ? 'rgba(99,102,241,0.03)' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '16px 24px', fontWeight: '500' }}>{course.title}</td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: course.status === 'PUBLISHED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                          color: course.status === 'PUBLISHED' ? 'var(--accent-success)' : 'var(--accent-warning)'
                        }}>
                          {course.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        {course.price === '0.00' ? 'Free' : `₹${parseFloat(course.price).toLocaleString()}`}
                      </td>
                      <td style={{ padding: '16px 24px' }}>{course.average_rating.toFixed(1)} / 5.0</td>
                      <td style={{ padding: '16px 24px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => setMessageCourse(course)}
                          className="btn btn-secondary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            position: 'relative'
                          }}
                        >
                          Messages
                          {courseMessageAlerts[course.id] && (
                            <span style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              background: 'red'
                            }} />
                          )}
                        </button>

                        <button
                          onClick={() => handleOpenModuleBuilder(course)}
                          className="btn btn-secondary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                          title="Manage Modules"
                        >
                          <Settings size={12} />
                          <span>Curriculum</span>
                        </button>
                        <button
                          onClick={() => navigate(`/courses/${course.id}`)}
                          className="btn btn-secondary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                          title="View Course Content"
                        >
                          <BookOpen size={12} />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => handleAIGenerate(course.id)}
                          className="btn btn-secondary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            color: 'var(--accent-secondary)',
                            borderColor: 'var(--accent-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                          title="Generate Syllabus Automatically"
                        >
                          <Plus size={12} />
                          <span>AI Gen</span>
                        </button>

                        <button
                          onClick={() => handleTogglePublishStatus(course)}
                          className="btn btn-secondary"
                          disabled={course.status === 'PUBLISHED' && course.enrollment_count > 0}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            color: course.status === 'PUBLISHED' ? 'var(--accent-warning)' : 'var(--accent-success)',
                            borderColor: course.status === 'PUBLISHED' ? 'var(--accent-warning)' : 'var(--accent-success)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: course.status === 'PUBLISHED' && course.enrollment_count > 0 ? 'not-allowed' : 'pointer',
                            opacity: course.status === 'PUBLISHED' && course.enrollment_count > 0 ? 0.55 : 1
                          }}
                          title={course.status === 'PUBLISHED' && course.enrollment_count > 0 ? 'Cannot unpublish: students are enrolled' : course.status === 'PUBLISHED' ? 'Move to Draft' : 'Publish Course'}
                        >
                          <Eye size={12} />
                          <span>{course.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="btn btn-secondary"
                          disabled={course.enrollment_count > 0}
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.8rem',
                            color: '#ef4444',
                            borderColor: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: course.enrollment_count > 0 ? 'not-allowed' : 'pointer',
                            opacity: course.enrollment_count > 0 ? 0.55 : 1
                          }}
                          title={course.enrollment_count > 0 ? 'Cannot delete: students are enrolled' : 'Delete Course'}
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Manual Module Builder Panel */}
        {selectedCourse && (
          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>Manage Syllabus</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Course: {selectedCourse.title}</p>
              </div>
              <button 
                onClick={() => setSelectedCourse(null)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            {/* List of Modules */}
            <div>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '12px' }}>Modules</h4>
              {loadingModules ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading syllabus...</p>
              ) : modules.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No modules created yet. Create one manually below or click "AI Gen" to build it automatically.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {modules.map((mod, idx) => (
                    <div 
                      key={mod.id} 
                      style={{
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div 
                        onClick={() => setExpandedModuleId(expandedModuleId === mod.id ? null : mod.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>#{idx+1}</span>
                          <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{mod.title}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: '500' }}>
                          {expandedModuleId === mod.id ? 'Collapse' : `Expand (${mod.lessons?.length || 0} Lessons)`}
                        </div>
                      </div>

                      {/* Expandable Lesson Builder Section */}
                      {expandedModuleId === mod.id && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
                          
                          {/* Lessons list */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {(!mod.lessons || mod.lessons.length === 0) ? (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '8px' }}>No lessons created yet.</div>
                            ) : (
                              mod.lessons.map((les, lIdx) => (
                                <div key={les.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '4px 8px', backgroundColor: 'var(--bg-primary)', borderRadius: '4px' }}>
                                  <span style={{ color: 'var(--text-primary)' }}>{lIdx + 1}. {les.title}</span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{les.content_type}</span>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Quick Add Lesson Form */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px', padding: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: '1px dashed var(--border-color)' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Add Lesson</div>
                            
                            <input
                              type="text"
                              placeholder="Lesson Title"
                              className="form-input"
                              value={newLessonTitle}
                              onChange={e => setNewLessonTitle(e.target.value)}
                              style={{ height: '32px', fontSize: '0.8rem', padding: '6px' }}
                            />
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <select
                                className="form-input"
                                value={newLessonType}
                                onChange={e => setNewLessonType(e.target.value)}
                                style={{ height: '32px', fontSize: '0.8rem', padding: '0 6px', flex: 1 }}
                              >
                                <option value="DOCUMENT">Text Document</option>
                                <option value="VIDEO">Video Link</option>
                                <option value="PDF">PDF Document</option>
                              </select>
                            </div>
                            {newLessonType === 'VIDEO' ? (
                              <input
                                type="text"
                                placeholder="Video Link URL"
                                className="form-input"
                                value={newLessonVideoUrl}
                                onChange={e => setNewLessonVideoUrl(e.target.value)}
                                style={{ height: '32px', fontSize: '0.8rem', padding: '6px' }}
                              />
                            ) : newLessonType === 'PDF' ? (
                              <input
                                type="file"
                                accept=".pdf"
                                className="form-input"
                                onChange={e => setNewLessonFile(e.target.files[0])}
                                style={{ height: 'auto', fontSize: '0.8rem', padding: '6px' }}
                              />
                            ) : (
                              <textarea
                                placeholder="Lesson Content / Text..."
                                className="form-input"
                                rows="3"
                                value={newLessonDesc}
                                onChange={e => setNewLessonDesc(e.target.value)}
                                style={{ fontSize: '0.8rem', padding: '6px', resize: 'none' }}
                              />
                            )}

                            <button
                              type="button"
                              onClick={() => handleAddLesson(mod.id)}
                              className="btn btn-primary"
                              style={{ fontSize: '0.75rem', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                            >
                              <Plus size={12} />
                              <span>Save Lesson</span>
                            </button>
                          </div>

                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Add Module Form */}
            <form onSubmit={handleAddModule} style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: '0px' }}>
                <label className="form-label">New Module Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  value={newModuleTitle}
                  onChange={e => setNewModuleTitle(e.target.value)}
                  placeholder="e.g. Introduction to CSS Grid"
                  style={{ height: '38px', fontSize: '0.85rem' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.85rem', padding: '8px' }}>
                <Plus size={16} />
                <span>Add Module</span>
              </button>
            </form>
          </div>
        )}

      </div>
      {messageCourse && (
        <div className="premium-card" style={{ marginTop: '30px', maxWidth: '680px' }}>
          <DirectMentorChat courseId={messageCourse.id} courseTitle={messageCourse.title} isMentor />
        </div>
      )}
    </div>
  );
};

export default MentorDashboard;
