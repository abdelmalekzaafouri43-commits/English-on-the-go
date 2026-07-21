import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { DEFAULT_QUIZZES, DEFAULT_CROSSWORDS } from './src/quizData.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;

app.use(express.json());

// Initialize Gemini Client
// Uses process.env.GEMINI_API_KEY. Gracefully handles absence.
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("Warning: GEMINI_API_KEY is not defined. AI features will be unavailable.");
}

let isRateLimited = false;
let rateLimitResetTime = 0;

function handleRateLimitError(error: any) {
  const errMsg = error.message || '';
  const errStatus = error.status || '';
  const errCode = error.code || 0;

  if (
    errCode === 429 ||
    errStatus === 'RESOURCE_EXHAUSTED' ||
    errMsg.includes('429') ||
    errMsg.includes('quota') ||
    errMsg.includes('Quota') ||
    errMsg.includes('RESOURCE_EXHAUSTED') ||
    errMsg.includes('limit')
  ) {
    console.warn("Gemini API Rate Limit (429 / Quota Exceeded) detected! Entering offline backup mode for 60s.");
    isRateLimited = true;
    rateLimitResetTime = Date.now() + 60000; // rate limit state lasts 60s
  }
}

// Robust helper to query Gemini with retry and exponential backoff
async function generateContentWithRetry(params: {
  model: string;
  contents: any;
  config?: any;
}, retries = 3, initialDelay = 1000): Promise<any> {
  if (!ai) {
    throw new Error('Gemini AI client is not initialized.');
  }

  if (isRateLimited) {
    if (Date.now() > rateLimitResetTime) {
      isRateLimited = false;
    } else {
      throw new Error('Gemini API is temporarily rate limited. Serving offline fallbacks.');
    }
  }

  let delay = initialDelay;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent(params);
      return response;
    } catch (error: any) {
      console.warn(`Gemini API attempt ${attempt} failed:`, error.message || error);
      
      handleRateLimitError(error);

      // If we got rate limited, throw immediately so we fallback without retrying
      if (isRateLimited) {
        throw error;
      }

      const isTransient = 
        error.status === 'UNAVAILABLE' || 
        error.code === 503 ||
        error.message?.includes('503') ||
        error.message?.includes('UNAVAILABLE') ||
        error.message?.includes('overloaded') ||
        error.message?.includes('high demand') ||
        error.message?.includes('temporary');

      if (isTransient && attempt < retries) {
        const jitter = Math.random() * 500;
        const sleepTime = delay + jitter;
        console.log(`Retrying Gemini call in ${Math.round(sleepTime)}ms... (Attempt ${attempt}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, sleepTime));
        delay *= 2; // exponential backoff
      } else {
        throw error;
      }
    }
  }
}

// Fallback Generators to ensure 100% uptime and robust UX
function getFallbackQuiz(sectionId: string, quizIndex: any): any {
  const sId = sectionId || 'present';
  const idx = Number(quizIndex) || 0;
  const quizzes = DEFAULT_QUIZZES[sId] || [];
  
  if (quizzes.length > 0) {
    const quiz = quizzes[idx % quizzes.length];
    return {
      title: `${quiz.title} (Practice Mode)`,
      questions: quiz.questions.map(q => ({
        question: q.question,
        options: [...q.options],
        answerIndex: q.answerIndex,
        explanation: q.explanation
      }))
    };
  }
  
  return {
    title: "English Grammar Practice",
    questions: [
      {
        question: "Choose the correct word: She _______ to school every day.",
        options: ["walk", "walks", "walking", "walked"],
        answerIndex: 1,
        explanation: "Simple present third person singular takes -s."
      }
    ]
  };
}

function getFallbackCrossword(levelIndex: any): any {
  const idx = Number(levelIndex) || 0;
  return DEFAULT_CROSSWORDS[idx % DEFAULT_CROSSWORDS.length] || DEFAULT_CROSSWORDS[0];
}

// Check online server status
app.get('/api/status', (req, res) => {
  if (isRateLimited && Date.now() > rateLimitResetTime) {
    isRateLimited = false;
  }
  res.json({ 
    status: 'online', 
    apiAvailable: !!ai && !isRateLimited,
    apiRateLimited: isRateLimited
  });
});

// AI Tutor chat endpoint
app.post('/api/tutor', async (req, res) => {
  const { messages, currentQuizContext } = req.body;
  
  if (!ai) {
    return res.json({ 
      text: "I am currently running in offline simulation mode because the Gemini API Key is missing. Let me know what you'd like to learn!" 
    });
  }

  try {
    const chatMessages = messages || [];
    
    // Construct System Instruction to give the tutor its persona
    let systemInstruction = `You are a friendly, encouraging, and highly professional AI English Tutor for the mobile app "English on the go" (developed by Mr.Zaafouri Labs).
The app has 6 sections: Simple Present, Simple Past, Future, Antonyms, Synonyms, and Games (Crossword Puzzles).
Explain English grammar and vocabulary concepts with clarity, elegance, and fun examples.
Keep your answers highly concise, readable, and structured for a mobile screen. 
Use lists, bullet points, and bold text to present definitions. DO NOT output complex markdown tables.
${currentQuizContext ? `The user is currently studying the section: "${currentQuizContext.section}" and working on Quiz #${currentQuizContext.quizNum + 1}: "${currentQuizContext.title}".` : ''}
Be conversational but brief. Guide the user rather than giving away exact answers directly unless requested.`;

    const contents = chatMessages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Error in AI Tutor Endpoint, using fallback:', error);
    
    // Offline fallback tutor answers
    const lastUserMessage = messages?.[messages.length - 1]?.text || '';
    let offlineAnswer = "I'm currently responding in offline tutoring mode! ";
    
    if (lastUserMessage.toLowerCase().includes('present')) {
      offlineAnswer += "Regarding the Simple Present: we use verb+s for he/she/it (e.g., 'She studies'). For questions, we use 'Do' or 'Does'.";
    } else if (lastUserMessage.toLowerCase().includes('past')) {
      offlineAnswer += "Regarding the Simple Past: regular verbs add '-ed' (e.g., 'started'), while irregular verbs change form completely (e.g., 'write' becomes 'wrote').";
    } else if (lastUserMessage.toLowerCase().includes('future')) {
      offlineAnswer += "Regarding the Future tense: we use 'will' for sudden decisions or predictions, and 'be going to' for planned intentions.";
    } else if (lastUserMessage.toLowerCase().includes('antonym')) {
      offlineAnswer += "Antonyms are opposite meanings! (e.g., 'joy' vs 'sorrow', 'abundant' vs 'scarce').";
    } else if (lastUserMessage.toLowerCase().includes('synonym')) {
      offlineAnswer += "Synonyms are similar meanings! (e.g., 'commence' and 'start', 'intelligent' and 'smart').";
    } else {
      offlineAnswer += "I received your message! Let's practice English. We can focus on Simple Present, Simple Past, Future tenses, Synonyms, or Antonyms. Ask me any question!";
    }
    
    res.json({ text: offlineAnswer });
  }
});

// Generate dynamic / changeable quizzes on-the-fly!
app.post('/api/generate-quiz', async (req, res) => {
  const { sectionId, sectionName, quizIndex } = req.body;

  if (!ai) {
    const fallback = getFallbackQuiz(sectionId, quizIndex);
    return res.json(fallback);
  }

  try {
    const prompt = `You are an English language curriculum generator for the app "English on the go" by Mr.Zaafouri Labs.
Create a completely unique, interactive, and high-quality quiz for the section "${sectionName}" (identifier: "${sectionId}"), specifically for Level ${Number(quizIndex) + 1}.
Generate exactly 5 multiple-choice questions.

Return your response in STRICT JSON format matching this exact TypeScript schema:
{
  "title": "A fun level title",
  "questions": [
    {
      "question": "Question text with a blank ____ or clear prompt",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0, // 0-based index of correct option
      "explanation": "Brief description of why this is correct"
    }
  ]
}

Ensure the grammar rules match the category perfectly (e.g., if ${sectionId} is past, use simple past, if it is antonyms, use opposites). Make the questions educational, creative, and fun.
Return ONLY the raw JSON object, no markdown formatting blocks (like \`\`\`json) or additional text outside the JSON.`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 1.0, // Higher temperature for varied and fresh quiz questions on each load
      }
    });

    const quizText = response.text || '';
    const cleanQuizText = quizText.replace(/^```json/, '').replace(/```$/, '').trim();
    const quizData = JSON.parse(cleanQuizText);
    res.json(quizData);
  } catch (error: any) {
    console.error('Error generating dynamic quiz, falling back:', error);
    const fallback = getFallbackQuiz(sectionId, quizIndex);
    res.json(fallback);
  }
});

// Dynamic Crossword Generator endpoint
app.post('/api/generate-crossword', async (req, res) => {
  const { levelIndex } = req.body;

  if (!ai) {
    const fallback = getFallbackCrossword(levelIndex);
    return res.json(fallback);
  }

  try {
    const prompt = `You are a crossword puzzle designer for the English grammar application "English on the go".
Create a fun 8x8 crossword puzzle for Level ${Number(levelIndex) + 1}.
The puzzle must contain 5-7 intersecting or simple words related to English learning, grammar, or common nouns/adjectives.

Return your response in STRICT JSON format matching this exact TypeScript schema:
{
  "title": "Dynamic Crossword Level ${Number(levelIndex) + 1}",
  "size": 8,
  "clues": [
    {
      "number": 1,
      "direction": "across", // must be "across" or "down"
      "clue": "Clue text explaining the word",
      "answer": "WORD", // UPPERCASE word letters only
      "row": 2, // 0-based start row index (0 to 7)
      "col": 1  // 0-based start col index (0 to 7)
    }
  ]
}

Make sure the coordinates are correct and the letters fit together if they overlap.
Return ONLY raw JSON, do not include markdown \`\`\`json wrappers or comments.`;

    const response = await generateContentWithRetry({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      }
    });

    const crosswordText = response.text || '';
    const cleanCrosswordText = crosswordText.replace(/^```json/, '').replace(/```$/, '').trim();
    const crosswordData = JSON.parse(cleanCrosswordText);
    res.json(crosswordData);
  } catch (error: any) {
    console.error('Error generating dynamic crossword, falling back:', error);
    const fallback = getFallbackCrossword(levelIndex);
    res.json(fallback);
  }
});


// Dev vs Prod Asset Delivery and Routing
if (process.env.NODE_ENV !== 'production' && process.env.DISABLE_VITE_INTEGRATION !== 'true') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  // Serve production build files
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
