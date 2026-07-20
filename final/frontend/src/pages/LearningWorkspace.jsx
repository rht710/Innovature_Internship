import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import QAWorkspace from '../components/QAWorkspace';
import CodeSandbox from '../components/CodeSandbox';
import AICopilot from '../components/AICopilot';
import ProjectGrader from '../components/ProjectGrader';
import DirectMentorChat from '../components/DirectMentorChat';
import { BookOpen, CheckCircle, Play, FileText, Check, Award, ShieldAlert, Sparkles, Terminal } from 'lucide-react';

const LearningWorkspace = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentProject, setCurrentProject] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // chat, mentor, copilot, sandbox, materials

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId, token]);

  const handleAIGenerateQuiz = () => {
    if (!currentQuiz) return;
    setGeneratingQuiz(true);

    axios.post(`/api/quizzes/${currentQuiz.id}/generate_questions/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      alert(res.data.message || "Fresh quiz questions generated successfully!");
      setQuizAnswers({});
      setQuizResult(null);
      // Wait a moment and re-fetch to reload course details
      fetchCourseDetails();
    })
    .catch(err => {
      console.error(err);
      alert("Failed to generate quiz questions via AI.");
    })
    .finally(() => {
      setGeneratingQuiz(false);
    });
  };

  const fetchCourseDetails = () => {
    // 1. Fetch course details
    axios.get(`/api/courses/${courseId}/`)
      .then(res => {
        setCourse(res.data);
        // Default to first lesson in first module only if nothing is selected
        if (!currentLesson && !currentQuiz && !currentProject) {
          if (res.data.modules && res.data.modules.length > 0) {
            const firstMod = res.data.modules[0];
            if (firstMod.lessons && firstMod.lessons.length > 0) {
              setCurrentLesson(firstMod.lessons[0]);
            } else if (firstMod.quizzes && firstMod.quizzes.length > 0) {
              setCurrentQuiz(firstMod.quizzes[0]);
            }
          }
        }
      })
      .catch(err => console.error(err));

    // 2. Fetch enrollment/progress details
    axios.get('/api/enrollments/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const enrol = res.data.results.find(e => e.course === courseId);
      setEnrollment(enrol);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  const handleLessonComplete = () => {
    if (!enrollment || !currentLesson) return;

    axios.post(`/api/enrollments/${enrollment.id}/complete_lesson/`, {
      lesson_id: currentLesson.id
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      fetchCourseDetails(); // Refresh progress
    })
    .catch(err => console.error(err));
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    if (!currentQuiz) return;

    axios.post(`/api/quizzes/${currentQuiz.id}/submit/`, {
      submissions: quizAnswers
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setQuizResult(res.data);
    })
    .catch(err => console.error(err));
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '60px' }}>Loading learning workspace...</p>;
  if (!course) return <p style={{ textAlign: 'center', marginTop: '60px' }}>Course not found.</p>;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', margin: '0 -5vw' }}>
      
      {/* 1. Left Sidebar: Curriculum structure */}
      <div style={{ width: '320px', borderRight: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', overflowY: 'auto', padding: '20px' }}>
        <h3 style={{ marginBottom: '8px' }}>Syllabus</h3>
        
        {enrollment && (
          <div style={{ marginBottom: '24px', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span>Your Progress</span>
              <span>{Math.round(enrollment.progress_percentage)}%</span>
            </div>
            <div style={{ height: '6px', backgroundColor: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${enrollment.progress_percentage}%`, height: '100%', background: 'linear-gradient(95deg, var(--accent-primary), var(--accent-secondary))', transition: 'width 0.3s ease' }}></div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {course.modules?.map((mod, modIdx) => (
            <div key={mod.id}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Module {modIdx + 1}: {mod.title}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {mod.lessons?.map(les => (
                  <button 
                    key={les.id}
                    onClick={() => { setCurrentLesson(les); setCurrentQuiz(null); setCurrentProject(null); setQuizResult(null); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      backgroundColor: currentLesson?.id === les.id ? 'var(--bg-tertiary)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentLesson?.id === les.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      fontSize: '0.85rem'
                    }}
                  >
                    {les.content_type === 'VIDEO' ? <Play size={14} /> : <FileText size={14} />}
                    <span style={{ flex: 1 }}>{les.title}</span>
                  </button>
                ))}

                {mod.quizzes?.map(qz => (
                  <button 
                    key={qz.id}
                    onClick={() => { setCurrentQuiz(qz); setCurrentLesson(null); setCurrentProject(null); setQuizResult(null); setQuizAnswers({}); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      backgroundColor: currentQuiz?.id === qz.id ? 'var(--bg-tertiary)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentQuiz?.id === qz.id ? 'var(--accent-secondary)' : 'var(--accent-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Award size={14} />
                    <span style={{ flex: 1 }}>Quiz: {qz.title}</span>
                  </button>
                ))}

                {mod.projects?.map(proj => (
                  <button 
                    key={proj.id}
                    onClick={() => { setCurrentProject(proj); setCurrentLesson(null); setCurrentQuiz(null); setQuizResult(null); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      backgroundColor: currentProject?.id === proj.id ? 'var(--bg-tertiary)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      color: currentProject?.id === proj.id ? 'var(--accent-primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Terminal size={14} style={{ color: 'var(--accent-primary)' }} />
                    <span style={{ flex: 1 }}>Project: {proj.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Middle Section: Media Player / Quiz Workspace */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {currentLesson ? (
          <div>
            <h2 style={{ marginBottom: '12px' }}>{currentLesson.title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>{currentLesson.description}</p>

            {/* Video Player */}
            {currentLesson.content_type === 'VIDEO' && currentLesson.video_url && (
              <div style={{ width: '100%', aspectRatio: '16/9', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', marginBottom: '32px' }}>
                <iframe 
                  src={currentLesson.video_url} 
                  title={currentLesson.title} 
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  allowFullScreen
                />
              </div>
            )}

            {/* PDF / Document Viewer */}
            {currentLesson.content_type !== 'VIDEO' && (
              <div style={{ marginBottom: '32px' }}>
                {(currentLesson.attachment || currentLesson.file) ? (() => {
                  const fileUrl = currentLesson.attachment || currentLesson.file;
                  const isPdf = fileUrl?.toLowerCase().includes('.pdf');
                  const fileName = fileUrl?.split('/').pop() || 'attachment';
                  return (
                    <div className="premium-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
                      <div style={{
                        width: '72px', height: '72px', borderRadius: '16px',
                        backgroundColor: 'rgba(99,102,241,0.12)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <FileText size={36} style={{ color: 'var(--accent-primary)' }} />
                      </div>
                      <div>
                        <h3 style={{ marginBottom: '6px' }}>{currentLesson.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{fileName}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary"
                          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          {isPdf ? '📄 Open PDF' : '📁 Open File'}
                        </a>
                        <a
                          href={fileUrl}
                          download={fileName}
                          className="btn btn-secondary"
                          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          ⬇ Download
                        </a>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Opens in a new browser tab
                      </p>
                    </div>
                  );
                })() : (
                  <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px', textAlign: 'center' }}>
                    <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                    <h3 style={{ color: 'var(--text-secondary)' }}>No attachment for this lesson.</h3>
                  </div>
                )}
              </div>
            )}

            <button onClick={handleLessonComplete} className="btn btn-primary" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} />
              <span>Mark Lesson as Completed</span>
            </button>
          </div>
        ) : currentQuiz ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0 }}>Quiz: {currentQuiz.title}</h2>
              <button 
                type="button" 
                onClick={handleAIGenerateQuiz} 
                className="btn btn-secondary" 
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)', cursor: 'pointer' }}
                disabled={generatingQuiz}
              >
                <span>{generatingQuiz ? 'Generating...' : '✨ Generate Questions via AI'}</span>
              </button>
            </div>
            
            {quizResult ? (
              <div className="premium-card" style={{ textAlign: 'center', padding: '40px' }}>
                <Award size={48} style={{ color: quizResult.passed ? 'var(--accent-success)' : 'var(--accent-danger)', marginBottom: '16px' }} />
                <h3>{quizResult.passed ? 'Congratulations, You Passed!' : 'Quiz Failed'}</h3>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Your score: <strong>{quizResult.score}%</strong> (Passing requirement: {quizResult.passing_score}%)
                </p>
                <button onClick={() => setQuizResult(null)} className="btn btn-secondary" style={{ marginTop: '24px' }}>Retake Quiz</button>
              </div>
            ) : (
              <form onSubmit={handleQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {currentQuiz.questions?.map((q, idx) => (
                  <div key={q.id} className="premium-card" style={{ padding: '20px' }}>
                    <div style={{ fontWeight: '600', marginBottom: '12px' }}>Q{idx + 1}: {q.question_text}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {q.options?.map(opt => (
                        <label 
                          key={opt.id} 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '12px',
                            backgroundColor: 'var(--bg-tertiary)',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer'
                          }}
                        >
                          <input 
                            type="radio" 
                            name={q.id} 
                            value={opt.id} 
                            checked={quizAnswers[q.id] === opt.id}
                            onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                          />
                          <span>{opt.option_text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Submit Quiz</button>
              </form>
            )}
          </div>
        ) : currentProject ? (
          <ProjectGrader 
            project={currentProject} 
            enrollment={enrollment} 
            onComplete={fetchCourseDetails} 
          />
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Select a lesson, quiz, or project from the syllabus.</p>
        )}
      </div>

      {/* 3. Right Sidebar: Q&A / Study Material toggle */}
      <div style={{ width: '360px', borderLeft: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border-color)', fontFamily: 'var(--font-title)', fontSize: '0.8rem' }}>
          <button
            onClick={() => setActiveTab('mentor')}
            style={{
              padding: '12px 8px', background: 'none', border: 'none',
              color: activeTab === 'mentor' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'mentor' ? '2px solid var(--accent-primary)' : 'none', fontWeight: '600', cursor: 'pointer'
            }}
          >
            Mentor
          </button>
          <button
            onClick={() => setActiveTab('chat')} 
            style={{ 
              padding: '12px 8px', 
              background: 'none', 
              border: 'none', 
              color: activeTab === 'chat' ? 'var(--accent-primary)' : 'var(--text-secondary)', 
              borderBottom: activeTab === 'chat' ? '2px solid var(--accent-primary)' : 'none',
              fontWeight: '600',
              cursor: 'pointer' 
            }}
          >
            Chat Discussion
          </button>
          <button 
            onClick={() => setActiveTab('copilot')} 
            style={{ 
              padding: '12px 8px', 
              background: 'none', 
              border: 'none', 
              color: activeTab === 'copilot' ? 'var(--accent-primary)' : 'var(--text-secondary)', 
              borderBottom: activeTab === 'copilot' ? '2px solid var(--accent-primary)' : 'none',
              fontWeight: '600',
              cursor: 'pointer' 
            }}
          >
            AI Co-Pilot
          </button>
          <button 
            onClick={() => setActiveTab('sandbox')} 
            style={{ 
              padding: '12px 8px', 
              background: 'none', 
              border: 'none', 
              color: activeTab === 'sandbox' ? 'var(--accent-primary)' : 'var(--text-secondary)', 
              borderBottom: activeTab === 'sandbox' ? '2px solid var(--accent-primary)' : 'none',
              fontWeight: '600',
              cursor: 'pointer' 
            }}
          >
            Playground
          </button>
          <button 
            onClick={() => setActiveTab('materials')} 
            style={{ 
              padding: '12px 8px', 
              background: 'none', 
              border: 'none', 
              color: activeTab === 'materials' ? 'var(--accent-primary)' : 'var(--text-secondary)', 
              borderBottom: activeTab === 'materials' ? '2px solid var(--accent-primary)' : 'none',
              fontWeight: '600',
              cursor: 'pointer' 
            }}
          >
            Materials
          </button>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'chat' && (
            <QAWorkspace courseId={courseId} />
          )}
          {activeTab === 'mentor' && (
            <DirectMentorChat courseId={courseId} courseTitle={course?.title} />
          )}
          {activeTab === 'copilot' && (
            <AICopilot course={course} currentLesson={currentLesson} />
          )}
          {activeTab === 'sandbox' && (
            <div style={{ padding: '16px', height: '100%' }}>
              <CodeSandbox course={course} />
            </div>
          )}
          {activeTab === 'materials' && (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 style={{ marginBottom: '8px' }}>Recommended Resources</h4>
              {course.suggested_materials && course.suggested_materials.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No recommended materials available yet.</p>
              ) : (
                course.suggested_materials?.map((mat, idx) => (
                  <a 
                    key={idx} 
                    href={mat.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="premium-card" 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '8px', 
                      padding: '16px', 
                      textDecoration: 'none',
                      backgroundColor: 'var(--bg-tertiary)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '0.9rem', color: mat.type === 'YOUTUBE' ? 'var(--accent-danger)' : 'var(--accent-primary)' }}>
                      <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: mat.type === 'YOUTUBE' ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)' }}>
                        {mat.type}
                      </span>
                      <span>{mat.title}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>{mat.description}</p>
                  </a>
                ))
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default LearningWorkspace;
