import React, { useState } from 'react';
import { Award, CheckCircle, Code, HelpCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const ProjectGrader = ({ project, enrollment, onComplete }) => {
  const [code, setCode] = useState(project?.starter_code || '// Write your code solution here...\n');
  const [grading, setGrading] = useState(false);
  const [result, setResult] = useState(null);

  const token = localStorage.getItem('access_token');

  const handleSubmit = () => {
    if (!code.trim()) return alert("Please write some code before submitting!");
    setGrading(true);
    setResult(null);

    axios.post(`/api/projects/${project.id}/submit/`, {
      code: code
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      // Decode AI JSON review
      const reviewObj = typeof res.data.submission.ai_review === 'string' 
        ? JSON.parse(res.data.submission.ai_review) 
        : res.data.submission.ai_review;
      
      setResult({
        score: res.data.submission.score,
        grade: res.data.submission.grade,
        feedback: reviewObj.feedback,
        line_by_line: reviewObj.line_by_line || []
      });

      if (res.data.submission.score >= 70 && onComplete) {
        onComplete(); // Trigger workspace reload to update progress percentage
      }
    })
    .catch(err => {
      console.error(err);
      alert("Failed to submit project. Verify backend API connection.");
    })
    .finally(() => {
      setGrading(false);
    });
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', height: '100%' }}>
      
      {/* Left panel: Prompt & Editor */}
      <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="premium-card" style={{ padding: '20px' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Award size={20} style={{ color: 'var(--accent-primary)' }} />
            <span>Assignment: {project.title}</span>
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
            {project.description}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '350px' }}>
          <div style={{ padding: '8px 16px', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderBottom: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code size={14} style={{ color: 'var(--accent-primary)' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>CODE WORKSPACE</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{
              flex: 1,
              width: '100%',
              backgroundColor: '#0f111a',
              color: '#d1d5db',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              padding: '16px',
              borderBottomLeftRadius: '10px',
              borderBottomRightRadius: '10px',
              border: '1px solid var(--border-color)',
              outline: 'none',
              resize: 'none'
            }}
          />
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={grading}
          className="btn btn-primary" 
          style={{ alignSelf: 'flex-start', padding: '12px 32px' }}
        >
          {grading ? 'Reviewing Code...' : 'Submit Assignment'}
        </button>
      </div>

      {/* Right panel: Evaluation Result Panel */}
      <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {grading ? (
          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', border: '4px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <h3>Analyzing Submission</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '0.85rem' }}>
              Lumina AI is inspecting syntax patterns, evaluating requirements, and formulating recommendations...
            </p>
          </div>
        ) : result ? (
          <div className="premium-card" style={{ minHeight: '350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Grade circle & Score */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: result.score >= 70 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `2px solid ${result.score >= 70 ? 'var(--accent-success)' : 'var(--accent-danger)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: result.score >= 70 ? 'var(--accent-success)' : 'var(--accent-danger)'
              }}>
                {result.grade}
              </div>
              <div>
                <h3 style={{ color: result.score >= 70 ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                  {result.score >= 70 ? 'Assignment Passed' : 'Needs Review'}
                </h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Score: <strong>{result.score}%</strong> (Passing score: 70%)
                </span>
              </div>
            </div>

            {/* AI critique */}
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <CheckCircle size={16} style={{ color: 'var(--accent-primary)' }} />
                <span>AI Review Summary</span>
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                {result.feedback}
              </p>
            </div>

            {/* Line by line improvements */}
            {result.line_by_line && result.line_by_line.length > 0 && (
              <div>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <AlertTriangle size={16} style={{ color: 'var(--accent-warning)' }} />
                  <span>Line Suggestions</span>
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.line_by_line.map((item, idx) => (
                    <div key={idx} style={{ padding: '10px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', borderLeft: '3px solid var(--accent-warning)', fontSize: '0.8rem' }}>
                      <strong>Line {item.line}</strong>: {item.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>
        ) : (
          <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '350px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <HelpCircle size={40} style={{ marginBottom: '16px', color: 'var(--text-muted)' }} />
            <h3>Evaluation Results</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>
              Your grade and automated code corrections will render here after you submit.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ProjectGrader;
