import { useState } from 'react';

interface Props {
  loading: boolean;
  error: string | null;
  onLogin: (username: string, password: string) => void;
}

export default function StaffLogin({ loading, error, onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    if (!username.trim() || !password.trim()) return;
    onLogin(username.trim(), password);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F7FF] px-4">
      <div className="mb-8 text-center">
        <img src="/senim_logo2.png" alt="Senim" className="w-16 h-16 object-contain mx-auto mb-2" />
        <img src="/logo_senim.png" alt="Senim" className="h-8 object-contain mx-auto" />
        <p className="mt-2 text-xs text-gray-400">Панель персонала</p>
      </div>

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Вход для персонала</h2>
        <p className="text-sm text-gray-500 mb-6">Психологи и администраторы KBTU</p>

        <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
          Имя пользователя
        </label>
        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={loading}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm
                     focus:outline-none focus:ring-2 focus:ring-[#7C6AF7] focus:border-transparent
                     transition mb-4 disabled:opacity-50"
        />

        <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
          Пароль
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#7C6AF7] focus:border-transparent
                       transition disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
          >
            {showPassword ? 'Скрыть' : 'Показать'}
          </button>
        </div>

        {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading || !username.trim() || !password.trim()}
          className="mt-5 w-full py-3 rounded-xl bg-[#7C6AF7] text-white text-sm font-medium
                     hover:bg-[#6a59e0] active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Входим...' : 'Войти'}
        </button>
      </div>
    </div>
  );
}
