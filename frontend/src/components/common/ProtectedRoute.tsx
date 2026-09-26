import React from 'react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication removed: allow unrestricted instant access to all platform views
  return <>{children}</>;
};
