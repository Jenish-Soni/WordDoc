import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { initializeSocket, disconnectSocket } from '../../services/socket';
import './EditorStyles.css';

const Editor = () => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const { token } = useAuth();
  const docId = 'doc123'; // This could be dynamic based on your needs

  useEffect(() => {
    console.log('Current token:', token); // Debug log
    const socket = initializeSocket(token);

    if (!socket) {
      setError('Could not initialize socket connection');
      return;
    }

    socket.emit('load-document', docId);

    socket.on('document-data', (data) => {
      setContent(data.content);
    });

    socket.on('document-update', (data) => {
      if (data.docId === docId) {
        setContent(data.content);
      }
    });

    socket.on('error', (error) => {
      setError(error.message);
    });

    return () => {
      disconnectSocket();
    };
  }, [token]);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    const socket = initializeSocket(token);
    if (socket) {
      socket.emit('edit-document', {
        docId,
        content: newContent,
      });
    }
  };

  return (
    <div className="editor-container">
      <h1>Collaborative Editor</h1>
      {error && <div className="error-message">{error}</div>}
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