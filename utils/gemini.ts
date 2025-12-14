import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateMentorResponse(
    processTitle: string,
    processDesc: string,
    phase: string,
    feedback: any[]
) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const feedbackSummary = feedback.map(f => `- [${f.type}]: ${f.content}`).join('\n');

    const prompt = `
    You are a Creative Mentor for an artist. 
    CONTEXT:
    Title: "${processTitle}"
    Description: "${processDesc}"
    Phase: "${phase}"
    
    FEEDBACK RECEIVED FROM PEERS:
    ${feedbackSummary || 'No feedback yet.'}

    YOUR ROLE:
    1. Summarize the feedback (if any) and identifying patterns.
    2. Ask 2-3 deep reflective questions to help unblock or advance the artist.
    3. Suggest 1 SHORT, creative exercise (oblique strategy style) to shift perspective.

    STRICT RULES:
    - DO NOT generate art, poetry, or actual creative content.
    - DO NOT critique the work directly, only reflect on the process.
    - Be concise, calm, and encouraging but not cheesy.
    - Return JSON format: { "summary": "...", "questions": ["...", "..."], "exercise": "..." }
  `;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        // Clean markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (e) {
        console.error('Gemini Error:', e);
        return null; // Handle error gracefully
    }
}
