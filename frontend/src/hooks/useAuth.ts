import { useState, useCallback } from 'react';

const TOKEN_KEY = 'senim_jwt';
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export type AuthStep = 'email' | 'code' | 'done';

export interface AuthState {
  step: AuthStep;
  email: string;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    step: localStorage.getItem(TOKEN_KEY) ? 'done' : 'email',
    email: '',
    token: localStorage.getItem(TOKEN_KEY),
    loading: false,
    error: null,
  });

  const setError = (error: string | null) =>
    setState((s) => ({ ...s, error, loading: false }));

  /**  отправить код на email */
  const requestCode = useCallback(async (email: string) => {
    setState((s) => ({ ...s, loading: true, error: null, email }));
    try {
      const res = await fetch(`${API_BASE}/api/auth/request-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Не удалось отправить код');
      setState((s) => ({ ...s, step: 'code', loading: false }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка сети');
    }
  }, []);

  /** проверить код и получить JWT */
  const verifyCode = useCallback(async (code: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: state.email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Неверный или истёкший код');
      localStorage.setItem(TOKEN_KEY, data.token);
      setState((s) => ({ ...s, step: 'done', token: data.token, loading: false }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка сети');
    }
  }, [state.email]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setState({ step: 'email', email: '', token: null, loading: false, error: null });
  }, []);

  /** Вернуться к вводу email (если ошиблись) */
  const backToEmail = useCallback(() => {
    setState((s) => ({ ...s, step: 'email', error: null }));
  }, []);

  return { ...state, requestCode, verifyCode, logout, backToEmail };
}