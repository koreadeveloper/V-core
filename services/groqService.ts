import { SummaryLength, VideoMetadata } from "../types";

// Environment variable handling
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

// Interface definitions (Partial)
export interface SummaryResponse {
  metadata: VideoMetadata;
  summary: string;
  transcript: string;
}

export interface MindMapResponse {
  markdown_code: string;
}

export interface QuizItem {
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
}

export interface QuizResponse {
  quizzes: QuizItem[];
}

export interface FlashcardItem {
  term: string;
  definition: string;
}

export interface FlashcardResponse {
  flashcards: FlashcardItem[];
}

// --- API Calls ---

export const analyzeVideoSummary = async (
  videoUrl: string,
  length: SummaryLength,
  language: string = 'ko'
): Promise<SummaryResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/analyze/summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: videoUrl, length, language }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null); // Return null on parse fail

    if (errorData && errorData.detail && typeof errorData.detail === 'object') {
      // Structure: { detail: { code: "...", message: "..." } }
      throw new Error(`[${errorData.detail.code}] ${errorData.detail.message}`);
    } else if (errorData && errorData.detail) {
      // Structure: { detail: "String message" }
      throw new Error(`[ERR_HTTP_${response.status}] ${errorData.detail}`);
    } else {
      // Parsing failed or no detail
      throw new Error(`[ERR_HTTP_${response.status}] ${response.statusText || 'Unknown Network Error'}`);
    }
  }
  return response.json();
};

export const generateMindMap = async (transcript: string, title: string): Promise<MindMapResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/analyze/mindmap`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, title }),
  });

  if (!response.ok) throw new Error("Failed to generate mind map");
  return response.json();
};

export const generateQuiz = async (transcript: string, title: string): Promise<QuizResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/analyze/quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, title }),
  });

  if (!response.ok) throw new Error("Failed to generate quiz");
  return response.json();
};

export const generateFlashcards = async (transcript: string, title: string): Promise<FlashcardResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/analyze/flashcards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript, title }),
  });

  if (!response.ok) throw new Error("Failed to generate flashcards");
  return response.json();
};

// Legacy/Chat Support
export const chatWithVideo = async (
  query: string,
  context: string,
  history: { role: string; parts: { text: string }[] }[],
  language: string = 'ko'
): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      context,
      language,
      history: history.map(h => ({
        role: h.role,
        content: h.parts.map(p => p.text).join("\n"),
      })),
    }),
  });

  if (!response.ok) return "Error connecting to AI chat.";
  const data = await response.json();
  return data.response;
};
