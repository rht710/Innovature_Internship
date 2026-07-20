import React, { useState, useEffect } from 'react';
import { Play, FileText, Download, Sparkles } from 'lucide-react';
import axios from 'axios';

const CodeSandbox = ({ course }) => {
  const isTech = course?.category === 'TECH' || course?.title?.toLowerCase().includes('web') || course?.title?.toLowerCase().includes('python') || course?.title?.toLowerCase().includes('react');

  // Sandbox states
  const [html, setHtml] = useState('<!-- Write your HTML code here -->\n<div class="card">\n  <h1>Hello Lumina!</h1>\n  <p>Start editing CSS and HTML to see live updates.</p>\n</div>');
  const [css, setCss] = useState('/* Write your CSS code here */\nbody {\n  font-family: sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 80vh;\n  background: linear-gradient(135deg, #1e1b4b, #311042);\n  color: #fff;\n}\n.card {\n  padding: 30px;\n  background: rgba(255, 255, 255, 0.1);\n  border-radius: 12px;\n  backdrop-filter: blur(10px);\n  border: 1px solid rgba(255,255,255,0.2);\n  text-align: center;\n}');
  const [js, setJs] = useState('// Write your JS code here\nconsole.log("Sandbox initialized!");');
  const [activeLang, setActiveLang] = useState('html'); // html, css, js
  const [srcDoc, setSrcDoc] = useState('');

  // Notepad states
  const [notes, setNotes] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    if (isTech) {
      const delayDebounceFn = setTimeout(() => {
        const compiled = `
          <html>
            <head>
              <style>${css}</style>
            </head>
            <body>
              ${html}
              <script>${js}</script>
            </body>
          </html>
        `;
        setSrcDoc(compiled);
      }, 500); // Debounce preview generation
      return () => clearTimeout(delayDebounceFn);
    }
  }, [html, css, js, isTech]);

  const handleDownloadNotes = () => {
    const element = document.createElement("a");
    const file = new Blob([notes], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${course.title.replace(/\s+/g, '_')}_notes.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleAISummarize = () => {
    if (!notes.trim()) return alert("Write some notes first!");
    setSummarizing(true);

    const token = localStorage.getItem('access_token');
    axios.post(`/api/courses/${course.id}/ai_copilot/`, {
      message: `Summarize the following study notes and extract key concepts: \n\n${notes}`,
      lesson_title: 'Notes Playground Summary',
      lesson_description: 'Student note-taking sandbox'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setNotes(prev => `${prev}\n\n=== ✨ AI NOTES SUMMARY ===\n${res.data.reply}`);
    })
    .catch(err => {
      console.error(err);
      alert("Failed to summarize notes via AI.");
    })
    .finally(() => {
      setSummarizing(false);
    });
  };

  if (isTech) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['html', 'css', 'js'].map(lang => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: activeLang === lang ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase'
                }}
              >
                {lang}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Play size={12} style={{ color: 'var(--accent-success)' }} /> Live Rendering Preview
          </span>
        </div>

        <div style={{ display: 'flex', flex: 1, gap: '16px', minHeight: '350px' }}>
          {/* Editor textarea */}
          <textarea
            value={activeLang === 'html' ? html : activeLang === 'css' ? css : js}
            onChange={(e) => {
              if (activeLang === 'html') setHtml(e.target.value);
              else if (activeLang === 'css') setCss(e.target.value);
              else setJs(e.target.value);
            }}
            style={{
              flex: 1,
              backgroundColor: '#0f111a',
              color: '#d1d5db',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              resize: 'none',
              outline: 'none'
            }}
          />

          {/* Iframe preview */}
          <div style={{ flex: 1, border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
            <iframe
              srcDoc={srcDoc}
              title="Sandbox Render"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Study Notepad for non-tech subjects
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={18} style={{ color: 'var(--accent-primary)' }} />
          <span>Study Notepad</span>
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleAISummarize}
            disabled={summarizing}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          >
            <Sparkles size={12} style={{ color: 'var(--accent-secondary)' }} />
            <span>{summarizing ? 'Summarizing...' : 'AI Summarize'}</span>
          </button>
          <button
            onClick={handleDownloadNotes}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
          >
            <Download size={12} />
            <span>Save .txt</span>
          </button>
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Type your study notes here while taking the course. Click 'AI Summarize' to get custom insights or download notes as a txt file!"
        style={{
          width: '100%',
          flex: 1,
          minHeight: '350px',
          backgroundColor: 'var(--bg-tertiary)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          padding: '16px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)',
          resize: 'none',
          outline: 'none'
        }}
      />
    </div>
  );
};

export default CodeSandbox;
