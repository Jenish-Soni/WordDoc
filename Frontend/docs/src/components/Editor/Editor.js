import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initializeSocket, disconnectSocket } from '../../services/socket';
import { documentService } from '../../services/api';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './Editor.css';

const Editor = () => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { id } = useParams();
  const quillRef = useRef(null);
  const socketRef = useRef(null);
  const isLocalUpdate = useRef(false);

  // Memoize saveContent function
  const saveContent = useCallback(async (contentToSave) => {
    try {
      await documentService.updateContent(id, contentToSave);
    } catch (error) {
      console.error('Error saving document:', error);
      setError('Failed to save document');
    }
  }, [id]);

  // Socket connection and event listeners
  useEffect(() => {
    if (!id) {
      setError('No document ID provided');
      return;
    }

    socketRef.current = initializeSocket(token);

    if (!socketRef.current) {
      setError('Could not initialize socket connection');
      return;
    }

    socketRef.current.emit('join-document', { documentId: id });

    // Listen for document updates
    const handleDocumentUpdate = (data) => {
      if (data.documentId === id && !isLocalUpdate.current) {
        setContent(data.content);
      }
    };

    // Listen for title updates
    const handleTitleUpdate = (data) => {
      if (data.documentId === id && !isLocalUpdate.current) {
        setTitle(data.title);
      }
    };

    socketRef.current.on('document-update', handleDocumentUpdate);
    socketRef.current.on('title-update', handleTitleUpdate);

    return () => {
      if (socketRef.current) {
        socketRef.current.off('document-update', handleDocumentUpdate);
        socketRef.current.off('title-update', handleTitleUpdate);
        socketRef.current.emit('leave-document', { documentId: id });
        disconnectSocket();
      }
    };
  }, [id, token]);

  // Fetch initial document data
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const doc = await documentService.getDocument(id);
        setTitle(doc.title);
        setContent(doc.content || '');
        setLoading(false);
      } catch (error) {
        console.error('Error fetching document:', error);
        setError('Failed to load document');
        setLoading(false);
      }
    };

    if (id) {
      fetchDocument();
    }
  }, [id]);

  // Handle title changes
  const handleTitleChange = async (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    try {
      await documentService.updateTitle(id, newTitle);
      if (socketRef.current) {
        socketRef.current.emit('title-update', {
          documentId: id,
          title: newTitle
        });
      }
    } catch (error) {
      console.error('Error updating title:', error);
      setError('Failed to update title');
    }
  };

  // Handle content changes
  const handleChange = (newContent) => {
    isLocalUpdate.current = true;
    setContent(newContent);
    
    if (socketRef.current) {
      socketRef.current.emit('edit-document', {
        documentId: id,
        content: newContent
      });
    }

    // Reset the local update flag after a short delay
    setTimeout(() => {
      isLocalUpdate.current = false;
    }, 100);
  };

  // Setup debounced save on content change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (content && !isLocalUpdate.current) {
        saveContent(content);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [content, saveContent]);

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ],
    },
    clipboard: {
      matchVisual: false
    },
    history: {
      delay: 1000,
      maxStack: 500,
      userOnly: true
    }
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'list', 'bullet',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  if (loading) {
    return (
      <div className="editor-wrapper">
        <div className="editor-loading">Loading document...</div>
      </div>
    );
  }

  return (
    <div className="editor-wrapper">
      {error && <div className="error-message">{error}</div>}
      
      <div className="editor-container">
        <div className="editor-header">
          <input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="document-title-input"
            placeholder="Untitled Document"
          />
        </div>

        <div className="editor-content">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            placeholder="Start typing..."
            preserveWhitespace={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Editor; 