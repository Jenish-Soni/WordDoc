import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import CreateDocumentModal from './CreateDocumentModal';
import './DocumentList.css';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentService.list();
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDocument = async (title) => {
    try {
      const response = await documentService.create(title);
      await loadDocuments();
      navigate(`/editor/${response.documentId}`);
    } catch (error) {
      console.error('Error creating document:', error);
      setError('Failed to create document');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="documents-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="documents-container">
      <div className="documents-header">
        <h1>My Documents</h1>
        <div className="header-actions">
          <button onClick={() => setIsModalOpen(true)} className="create-doc-button">
            <span className="plus-icon">+</span>
            New Document
          </button>
          <button onClick={handleLogout} className="logout-button">
            <i className="fas fa-sign-out-alt"></i>
            Logout
          </button>
        </div>
      </div>

      <CreateDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateDocument}
      />

      {error && <div className="error-message">{error}</div>}

      {documents.length === 0 ? (
        <div className="no-documents">
          <p>No documents yet. Create your first document to get started!</p>
        </div>
      ) : (
        <div className="documents-grid">
          {documents.map(doc => (
            <div key={doc._id} className="document-card" onClick={() => navigate(`/editor/${doc._id}`)}>
              <div className="document-icon">
                <i className="far fa-file-alt"></i>
              </div>
              <div className="document-info">
                <h3 className="document-title">{doc.title}</h3>
                <p className="document-date">Last modified: {formatDate(doc.lastModified)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentList; 