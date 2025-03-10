import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { initializeSocket, disconnectSocket } from '../../services/socket';
import { documentService, grammarService } from '../../services/api';
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
  const [grammarSuggestions, setGrammarSuggestions] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const grammarCheckTimeout = useRef(null);
  const navigate = useNavigate();

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

  // Update the grammar check function
  const checkGrammar = useCallback(async (text) => {
    try {
      setIsChecking(true);
      const data = await grammarService.checkGrammar(text);
      if (data.suggestions) {
        setGrammarSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Grammar check error:', error);
      if (error.response?.status === 403) {
        // Handle unauthorized access
        navigate('/login');
      }
      setGrammarSuggestions([]);
    } finally {
      setIsChecking(false);
    }
  }, [navigate]);

  // Update handleChange to debounce properly
  const handleChange = useCallback((newContent) => {
    isLocalUpdate.current = true;
    setContent(newContent);
    
    // Clear existing timeout
    if (grammarCheckTimeout.current) {
      clearTimeout(grammarCheckTimeout.current);
    }

    // Only check grammar if there's actual content
    const plainText = newContent.replace(/<[^>]*>/g, '').trim();
    if (plainText) {
      grammarCheckTimeout.current = setTimeout(() => {
        checkGrammar(plainText);
      }, 1000);
    } else {
      setGrammarSuggestions([]);
    }

    if (socketRef.current) {
      socketRef.current.emit('edit-document', {
        documentId: id,
        content: newContent
      });
    }

    setTimeout(() => {
      isLocalUpdate.current = false;
    }, 100);
  }, [id, checkGrammar]);

  // Add this effect to clean up timeouts
  useEffect(() => {
    return () => {
      if (grammarCheckTimeout.current) {
        clearTimeout(grammarCheckTimeout.current);
      }
    };
  }, []);

  // Setup debounced save on content change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (content && !isLocalUpdate.current) {
        saveContent(content);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [content, saveContent]);

  // Custom Quill modules to avoid deprecation warning
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    },
    history: {
      delay: 1000,
      maxStack: 500,
      userOnly: true
    }
  }), []);

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

      {/* Show loading state in grammar suggestions */}
      <div className={`grammar-suggestions ${grammarSuggestions.length > 0 || isChecking ? 'active' : ''}`}>
        <h3>
          Grammar Suggestions
          {isChecking && <span className="checking-indicator">Checking...</span>}
        </h3>
        {isChecking ? (
          <div className="checking-message">Analyzing text...</div>
        ) : grammarSuggestions.length > 0 ? (
          <ul>
            {grammarSuggestions.map((suggestion, index) => (
              <li key={index} className="suggestion-item">
                <div className="suggestion-original">
                  Original: <span>{suggestion.original}</span>
                </div>
                <div className="suggestion-correction">
                  Correction: <span>{suggestion.correction}</span>
                </div>
                <div className="suggestion-explanation">
                  {suggestion.explanation}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-suggestions">No suggestions</div>
        )}
      </div>
    </div>
  );
};

export default Editor; 