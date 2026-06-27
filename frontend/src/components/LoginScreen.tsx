import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import type { AuthStep } from '../hooks/useAuth';

const CODE_LENGTH = 6;

interface Props {
  step: AuthStep;
  email: string;
  loading: boolean;
  error: string | null;
  requestCode: (email: string) => void;
  verifyCode: (code: string) => void;
  backToEmail: () => void;
}

export default function LoginScreen({ step, email, loading, error, requestCode, verifyCode, backToEmail }: Props) {
  const [emailInput, setEmailInput] = useState('');
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleEmailSubmit = () => {
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) return;
    requestCode(trimmed);
  };

  useEffect(() => {
    if (step === 'code') {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, CODE_LENGTH).split('');
      const next = [...digits];
      pasted.forEach((ch, i) => { if (index + i < CODE_LENGTH) next[index + i] = ch; });
      setDigits(next);
      const focusIndex = Math.min(index + pasted.length, CODE_LENGTH - 1);
      inputRefs.current[focusIndex]?.focus();
      if (next.every(Boolean)) verifyCode(next.join(''));
      return;
    }
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (next.every(Boolean)) verifyCode(next.join(''));
  };

  const handleDigitKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7FF] px-4">
      <div className="mb-10 text-center">
        <img src="/senim_logo2.png" alt="Senim" className="w-24 h-24 object-contain mb-0 mx-auto" />
        <img src="/logo_senim.png" alt="Senim" className="h-16 object-contain mx-auto" />
        <p className="mt-1 text-sm text-gray-500">Психологическая поддержка студентов KBTU</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        {step === 'email' && (
          <>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Войти</h2>
            <p className="text-sm text-gray-500 mb-6">
              Введи свой email — мы отправим одноразовый код для входа.
            </p>

            <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@gmail.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#7C6AF7] focus:border-transparent transition"
              disabled={loading}
            />

            {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

            <button
              onClick={handleEmailSubmit}
              disabled={loading || !emailInput.trim()}
              className="mt-5 w-full py-3 rounded-xl bg-[#7C6AF7] text-white text-sm font-medium
                         hover:bg-[#6a59e0] active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Отправляем...' : 'Получить код'}
            </button>
          </>
        )}

        {step === 'code' && (
          <>
            <button
              onClick={backToEmail}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-5 transition"
            >
              ← Назад
            </button>

            <h2 className="text-lg font-semibold text-gray-800 mb-1">Введи код</h2>
            <p className="text-sm text-gray-500 mb-6">
              Мы отправили 6-значный код на{' '}
              <span className="font-medium text-gray-700">{email}</span>.
              Проверь папку «Спам», если не видишь письма.
            </p>

            <div className="flex gap-2 justify-between mb-2">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(i, e)}
                  disabled={loading}
                  className="w-11 h-12 text-center text-lg font-semibold rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7C6AF7] focus:border-transparent transition disabled:opacity-50"
                />
              ))}
            </div>

            {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
            {loading && <p className="mt-3 text-xs text-center text-gray-400">Проверяем код...</p>}

            <p className="mt-5 text-xs text-center text-gray-400">
              Не пришло письмо?{' '}
              <button
                onClick={() => requestCode(email)}
                disabled={loading}
                className="text-[#7C6AF7] hover:underline disabled:opacity-50"
              >
                Отправить снова
              </button>
            </p>
          </>
        )}
      </div>

      <p className="mt-8 text-xs text-gray-400 text-center max-w-xs">
        Senim — не замена профессиональному психологу. При кризисе обратись к специалисту
        или позвони на телефон доверия{' '}
        <a href="tel:150" className="text-[#7C6AF7]">150</a>.
      </p>
    </div>
  );
}
