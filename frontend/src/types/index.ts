export type Emotion = 'joy' | 'sadness' | 'anxiety' | 'anger' | 'neutral';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  emotion?: Emotion;       // только у ответов бота
  isEmergency?: boolean;
  recommendations?: string[] | null;
  createdAt: string;       // ISO string
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages?: Message[];
}

// Что приходит от POST /api/chat
export interface ChatApiResponse {
  reply: string;
  emotion: Emotion;
  isEmergency: boolean;
  recommendations: string[] | null;
  conversationId: string;
  messageId: string;
}