import { useState, useCallback } from 'react';
import type { StaffUser } from '../types/staff';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const STAFF_TOKEN_KEY = 'senim_staff_jwt';

export function useStaffAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem(STAFF_TOKEN_KEY));
  const [staff, setStaff] = useState<StaffUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/staff/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Ошибка входа');
      localStorage.setItem(STAFF_TOKEN_KEY, data.token);
      setToken(data.token);
      setStaff(data.staff);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STAFF_TOKEN_KEY);
    setToken(null);
    setStaff(null);
  }, []);

  return { token, staff, loading, error, login, logout, isLoggedIn: !!token };
}