import { CohereClient } from 'cohere-ai';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';


const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY
});

export const askAI = catchAsync(async (req, res) => {
    const { message, context } = req.body;

    if (!message) {
        throw new AppError('Message is required', 400);
    }

    try {
        const response = await cohere.chat({
            model: 'command-a-03-2025',
            message: message,
            preamble: `You are a helpful AI learning assistant for a student platform. 
You help students with questions about their courses, articles, and learning materials.
Be concise, friendly, and educational. Current context: ${context || 'Browsing learning platform'}`,
            temperature: 0.7,
            max_tokens: 500
        });

        res.status(200).json({
            status: 'success',
            data: {
                response: response.text,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('AI API Error:', error);

        const fallbackResponse = getFallbackResponse(message);

        res.status(200).json({
            status: 'success',
            data: {
                response: fallbackResponse,
                timestamp: new Date().toISOString(),
                isFallback: true
            }
        });
    }
});


const getFallbackResponse = (message) => {
    const fallbacks = [
        "I'm here to help! Could you please rephrase your question?",
        "That's an interesting question! Let me think about that for a moment.",
        "I'm still learning! Could you ask me something about your courses or articles?",
        "I'd be happy to help with that! What specific topic are you studying?",
        "Great question! While I process that, feel free to ask about any article you're reading."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};