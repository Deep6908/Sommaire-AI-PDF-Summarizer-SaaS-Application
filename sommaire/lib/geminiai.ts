import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

// Make sure to install the package first:
// npm install @google/generative-ai
// or
// yarn add @google/generative-ai
import { SUMMARY_SYSTEM_PROMPT } from '@/utils/prompt'; // Assuming this is your system prompt string

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const generateSummaryFromGemini = async (pdfText: string) => {
    console.log('PDF Text sent to Gemini:', pdfText);
    try {
        // For text-only input, use the gemini-pro model
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            }
         });

        const prompt = {contents: [
            {
                role: 'user',
                parts: [
                    { text: SUMMARY_SYSTEM_PROMPT },
                    {
                        text: `Transform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting:\n\n${pdfText}`
                    },
                ],
            },
        ],
    };
    
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error('Gemini API Error:', error);
        throw error;
    }
};
       

