import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Editor from './components/Editor/Editor';
import DocumentList from './components/Documents/DocumentList';
import PrivateRoute from './components/Auth/PrivateRoute';
import './styles/global.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <DocumentList />
          </PrivateRoute>
        } />
        
        {/* Editor Routes */}
        <Route path="/editor" element={
          <PrivateRoute>
            <Navigate to="/" replace />
          </PrivateRoute>
        } />
        <Route path="/editor/:id" element={
          <PrivateRoute>
            <Editor />
          </PrivateRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App; 