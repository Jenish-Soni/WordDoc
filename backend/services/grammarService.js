const { GoogleGenerativeAI } = require("@google/generative-ai");

class GrammarService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    }

    async checkGrammar(text) {
        try {
            const prompt = `Analyze this text for grammar errors and return ONLY a JSON object (no markdown formatting, no backticks) in this exact format:
                          {"corrections": [{"original": "incorrect phrase", "correction": "corrected phrase", "explanation": "reason for correction"}]}
                          
                          Text to analyze: "${text}"`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return this.formatResponse(response.text());
        } catch (error) {
            console.error('Grammar check error:', error);
            throw error;
        }
    }

    formatResponse(content) {
        try {
            // Remove any markdown formatting or backticks
            let cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
            
            // Try to find JSON object if there's additional text
            const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                cleanContent = jsonMatch[0];
            }

            const parsed = JSON.parse(cleanContent);
            return {
                suggestions: parsed.corrections || []
            };
        } catch (error) {
            console.error('Error parsing grammar response:', error);
            console.log('Raw content:', content); // For debugging
            return {
                suggestions: [{
                    original: "parsing error",
                    correction: "Could not parse API response",
                    explanation: "The API response format was unexpected"
                }]
            };
        }
    }
}

module.exports = new GrammarService(); 
