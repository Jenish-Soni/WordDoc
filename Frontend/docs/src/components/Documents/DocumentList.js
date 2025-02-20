import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentService } from '../../services/api';

const DocumentList = () => {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadDocuments = async () => {
    try {
      const docs = await documentService.list();
      console.log('Loaded documents:', docs);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents');
    }
  };

  const createNewDocument = async () => {
    try {
      const title = prompt('Enter document title:') || 'Untitled Document';
      const response = await documentService.create(title);
      console.log('Created document:', response);
      
      // Refresh the list and navigate to new document
      await loadDocuments();
      navigate(`/editor/${response.documentId}`);
    } catch (error) {
      console.error('Error creating document:', error);
      setError('Failed to create document');
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  return (
    <div className="documents-container">
      <h1>My Documents</h1>
      {error && <div className="error-message">{error}</div>}
      
      <button onClick={createNewDocument} className="create-doc-button">
        Create New Document
      </button>

      <div className="documents-list">
        {documents.map(doc => (
          <div key={doc._id} className="document-item">
            <div onClick={() => navigate(`/editor/${doc._id}`)} 
                 className="document-link">
              <h3>{doc.title}</h3>
              <p>Last modified: {new Date(doc.lastModified).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList; 