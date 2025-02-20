import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Editor from './components/Editor/Editor';
import DocumentList from './components/Documents/DocumentList';
import './styles/global.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route path="/documents" element={
          <ProtectedRoute>
            <DocumentList />
          </ProtectedRoute>
        } />
        
        {/* Editor Routes */}
        <Route path="/editor" element={
          <ProtectedRoute>
            <Navigate to="/documents" replace />
          </ProtectedRoute>
        } />
        <Route path="/editor/:id" element={
          <ProtectedRoute>
            <Editor />
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/documents" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 