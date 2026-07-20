import React from 'react';

const CourseDetailsModal = ({ show, onClose, title, children }) => {
  if (!show) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={closeBtnStyle} aria-label="Close modal">×</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0, 0, 0, 0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
};

const modalStyle = {
  width: '100%',
  maxWidth: '520px',
  backgroundColor: 'var(--bg-primary)',
  borderRadius: '18px',
  padding: '26px',
  boxShadow: '0 18px 45px rgba(0, 0, 0, 0.18)',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '18px',
};

const closeBtnStyle = {
  border: 'none',
  background: 'transparent',
  fontSize: '1.8rem',
  lineHeight: 1,
  cursor: 'pointer',
};

export default CourseDetailsModal;
