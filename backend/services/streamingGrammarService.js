const { GoogleGenerativeAI } = require("@google/generative-ai");

class StreamingGrammarService {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    async *checkGrammarStream(text) {
        try {
            const prompt = `Please analyze this text for grammar and provide corrections:
                          "${text}"`;

            const result = await this.model.generateContentStream(prompt);
            
            for await (const chunk of result.stream) {
                if (chunk.text) {
                    yield chunk.text;
                }
            }
        } catch (error) {
            console.error('Grammar stream error:', error);
            throw error;
        }
    }
}

module.exports = new StreamingGrammarService(); 