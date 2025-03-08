import React from 'react';
import './GrammarSuggestions.css';

const GrammarSuggestions = ({ suggestions }) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <div className="grammar-suggestions">
            <h3>Grammar Suggestions</h3>
            <ul>
                {suggestions.map((suggestion, index) => (
                    <li key={index} className="suggestion-item">
                        <span className="error-text">{suggestion.original}</span>
                        <span className="suggestion-arrow">→</span>
                        <span className="correction-text">{suggestion.correction}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GrammarSuggestions; 