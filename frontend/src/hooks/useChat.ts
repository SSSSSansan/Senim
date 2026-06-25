import { useState, useCallback } from 'react';
import type { Message, ChatApiResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

function getToken() {
  return localStorage.getItem('senim_jwt');
}

function makeId() {
  return Math.random().toString(36).slice(2);
}

interface UseChatOptions {
  conversationId?: string;
  onEmergency?: () => void;
  onRecommendations?: (recs: string[]) => void;
  onConversationCreated?: (id: string) => void;
}

export function useChat({
  conversationId: initialConversationId,
  onEmergency,
  onRecommendations,
  onConversationCreated,
}: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | undefined>(initialConversationId);

  const sendMessage = useCallback(
    async (text: string, scenario?: string) => {
      if (!text.trim() || isLoading) return;

      // Сразу показываем сообщение пользователя
      const userMessage: Message = {
        id: makeId(),
        role: 'user',
        content: text.trim(),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            conversationId,
            message: text.trim(),
            ...(scenario ? { scenario } : {}),
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? `Ошибка сервера (${res.status})`);
        }

        const data: ChatApiResponse = await res.json();

        // Запоминаем conversationId если новый диалог
        if (!conversationId && data.conversationId) {
          setConversationId(data.conversationId);
          onConversationCreated?.(data.conversationId);
        }

        const botMessage: Message = {
          id: data.messageId ?? makeId(),
          role: 'assistant',
          content: data.reply,
          emotion: data.emotion,
          isEmergency: data.isEmergency,
          recommendations: data.recommendations,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, botMessage]);

        if (data.isEmergency) onEmergency?.();
        if (data.recommendations?.length) onRecommendations?.(data.recommendations);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Не удалось отправить сообщение');
        // Убираем сообщение пользователя если запрос упал
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId, isLoading, onEmergency, onRecommendations, onConversationCreated],
  );

  const loadMessages = useCallback((msgs: Message[]) => {
    setMessages(msgs);
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setConversationId(undefined);
    setError(null);
  }, []);

  return { messages, isLoading, error, conversationId, sendMessage, loadMessages, reset };
}