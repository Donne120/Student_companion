import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? '';

export interface TutorMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export async function askSCA(params: {
  userMessage: string;
  courseTitle: string;
  currentLesson?: string;
  conversationHistory: TutorMessage[];
}): Promise<string> {
  const { userMessage, courseTitle, currentLesson, conversationHistory } = params;

  if (!API_KEY) {
    return 'SCA is not configured yet. Please contact an admin to set up VITE_GEMINI_API_KEY.';
  }

  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const systemPrompt = `You are SCA (Student Companion Assistant), an AI tutor built into the Student Companion AI learning platform.

You are helping a student enrolled in: "${courseTitle}".
Current lesson: "${currentLesson ?? 'General course content'}".

Your role:
- Explain topics in the simplest possible words, using analogies and real examples
- Define terms clearly and concisely  
- Summarise lessons in 3-5 memorable bullet points
- Show how concepts apply in real-world or academic (especially African career) contexts
- Give encouraging quiz questions to test understanding
- Dive deeper into topics students find interesting

Tone: Friendly, encouraging, like a smart peer tutor.
Length: Concise (3-6 sentences or bullet points). Never overwhelm.
Format: Markdown — **bold** key terms, bullet lists, short paragraphs.
Always relate to ${courseTitle} and career development for African students.
NEVER invent facts. If unsure, say so.`;

  // Map conversation history to Gemini format
  const history = conversationHistory.map((msg) => ({
    role: msg.role === 'assistant' ? ('model' as const) : ('user' as const),
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({
    history,
    systemInstruction: systemPrompt,
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
}
