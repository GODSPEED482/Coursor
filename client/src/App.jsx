import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Landing from './Landing';
import CourseStudio from './CourseStudio';
import Auth from './Auth';
import { AuthProvider, useAuth } from './AuthContext';
import LogoutButton from './LogoutButton';

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/auth" />;
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
        <AuthProvider>
            <BrowserRouter>
              <div className="app-container">
                <LogoutButton />
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<ProtectedRoute><Landing /></ProtectedRoute>} />
                  <Route path="/studio/:id" element={<ProtectedRoute><CourseStudio /></ProtectedRoute>} />
                </Routes>
              </div>
            </BrowserRouter>
        </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
