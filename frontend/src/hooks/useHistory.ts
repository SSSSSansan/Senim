import { useState, useEffect, useCallback } from 'react';
import type { Conversation, Message } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

function getToken() {
  return localStorage.getItem('senim_jwt');
}

export function useHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Загрузить список всех диалогов */
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/conversations`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error(`Ошибка ${res.status}`);
      const data: Conversation[] = await res.json();
      setConversations(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить историю');
    } finally {
      setLoading(false);
    }
  }, []);

  /** Загрузить сообщения конкретного диалога */
  const fetchMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    const res = await fetch(`${API_BASE}/api/conversations/${conversationId}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error(`Ошибка ${res.status}`);
    const data = await res.json();
    return data.messages ?? [];
  }, []);

  /** Добавить новый диалог в список (вызывается когда чат создал новый) */
  const addConversation = useCallback((conv: Conversation) => {
    setConversations((prev) => [conv, ...prev]);
  }, []);

  /** Обновить заголовок диалога (первые 30 символов первого сообщения) */
  const updateTitle = useCallback((id: string, title: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title } : c))
    );
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, loading, error, fetchConversations, fetchMessages, addConversation, updateTitle };
}