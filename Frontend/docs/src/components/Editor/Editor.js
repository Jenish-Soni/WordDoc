import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initializeSocket, disconnectSocket } from '../../services/socket';
import './EditorStyles.css';

const Editor = () => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const { token } = useAuth();
  const { id } = useParams();

  useEffect(() => {
    if (!id) {
      setError('No document ID provided');
      return;
    }

    console.log('Connecting to document:', id); // Debug log
    const socket = initializeSocket(token);

    if (!socket) {
      setError('Could not initialize socket connection');
      return;
    }

    // Join document room and request content
    socket.emit('join-document', { documentId: id });
    console.log('Joined document:', id); // Debug log

    // Handle initial document load
    socket.on('load-document', (data) => {
      console.log('Document loaded:', data); // Debug log
      setContent(data.content || '');
    });

    // Handle real-time updates
    socket.on('document-update', (data) => {
      console.log('Document update received:', data); // Debug log
      if (data.documentId === id) {
        setContent(data.content);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setError(error.message);
    });

    return () => {
      console.log('Leaving document:', id); // Debug log
      socket.emit('leave-document', { documentId: id });
      disconnectSocket();
    };
  }, [id, token]);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    if (!id) {
      setError('No document ID provided');
      return;
    }

    const socket = initializeSocket(token);
    if (socket) {
      console.log('Sending edit for document:', id); // Debug log
      socket.emit('edit-document', {
        documentId: id,
        content: newContent
      });
    }
  };

  return (
    <div className="editor-container">
      {error && <div className="error-message">{error}</div>}
      <div className="document-info">
        Document ID: {id}
      </div>
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Start typing..."
        className="editor-textarea"
      />
    </div>
  );
};

export default Editor; 