import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('access_token');
  const userRole = localStorage.getItem('user_role');
  const userIsApprovedMentor = localStorage.getItem('is_approved_mentor') === 'true';

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
    if (allowedRoles.includes('MENTOR') && userRole === 'MENTOR' && !userIsApprovedMentor) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
