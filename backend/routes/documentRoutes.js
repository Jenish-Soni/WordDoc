const express = require('express');
const router = express.Router();
const Document = require('../model/document');
const verifyToken = require('../middleware/verifyToken');

// Create new document (endpoint will be /api/documents/create)
router.post('/create', verifyToken, async (req, res) => {
    try {
        // console.log('Creating document, received data:', req.body);
        
        const { title } = req.body;
        const document = new Document({
            title: title || 'Untitled Document',
            content: '',
            owner: req.userId,
            lastModified: new Date()
        });

        const savedDoc = await document.save();
        // console.log('Document created:', savedDoc._id);
        
        res.json({
            documentId: savedDoc._id,
            title: savedDoc.title
        });
    } catch (error) {
        console.error('Document creation error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user's documents
router.get('/list', verifyToken, async (req, res) => {
    try {
        const documents = await Document.find({ owner: req.userId })
            .select('_id title lastModified')
            .sort({ lastModified: -1 });
        
        res.json(documents);
    } catch (error) {
        console.error('Document list error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get specific document
router.get('/:id', verifyToken, async (req, res) => {
    try {
        // console.log('Fetching document:', req.params.id);
        
        const document = await Document.findOne({
            _id: req.params.id,
            owner: req.userId
        });

        if (!document) {
            // console.log('Document not found');
            return res.status(404).json({ error: 'Document not found' });
        }

        // console.log('Document found:', document._id);
        res.json(document);
    } catch (error) {
        console.error('Document fetch error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update document content
router.patch('/:id/content', verifyToken, async (req, res) => {
    try {
        // console.log('Updating document content:', req.params.id);
        
        const document = await Document.findOneAndUpdate(
            { 
                _id: req.params.id,
                owner: req.userId 
            },
            { 
                content: req.body.content,
                lastModified: new Date()
            },
            { new: true }
        );

        if (!document) {
            console.log('Document not found or unauthorized');
            return res.status(404).json({ error: 'Document not found' });
        }

        //  console.log('Document content updated:', document._id);
        res.json(document);
    } catch (error) {
        // console.error('Document content update error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update document title
router.patch('/:id/title', verifyToken, async (req, res) => {
    try {
        // console.log('Updating document title:', req.params.id);
        
        const document = await Document.findOneAndUpdate(
            { 
                _id: req.params.id,
                owner: req.userId 
            },
            { 
                title: req.body.title,
                lastModified: new Date()
            },
            { new: true }
        );

        if (!document) {
            // console.log('Document not found or unauthorized');
            return res.status(404).json({ error: 'Document not found' });
        }

        // console.log('Document title updated:', document._id);
        res.json(document);
    } catch (error) {
        // console.error('Document title update error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 