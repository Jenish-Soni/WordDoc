const express = require('express');
const router = express.Router();
const grammarService = require('../services/grammarService');
const streamingGrammarService = require('../services/streamingGrammarService');
const verifyToken = require('../middleware/verifyToken');

// Grammar check endpoint
router.post('/check', verifyToken, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const suggestions = await grammarService.checkGrammar(text);
        res.json(suggestions);
    } catch (error) {
        console.error('Grammar check error:', error);
        res.status(500).json({ error: 'Failed to check grammar' });
    }
});

// Streaming grammar check endpoint
router.post('/check/stream', verifyToken, async (req, res) => {
    try {
        const { text } = req.body;
        
        // Set headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const grammarStream = await streamingGrammarService.checkGrammarStream(text);
        
        for await (const chunk of grammarStream) {
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }

        res.end();
    } catch (error) {
        console.error('Grammar stream error:', error);
        res.status(500).json({ error: 'Failed to stream grammar check' });
    }
});

module.exports = router; 