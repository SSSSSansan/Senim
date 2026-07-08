import { useState, useEffect, useCallback } from 'react';
import type { Case, CaseStatus, RiskLevel, StaffMessage } from '../types/staff';
import type { StaffUser } from '../types/staff';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
const STAFF_TOKEN_KEY = 'senim_staff_jwt';

function getToken() {
  return localStorage.getItem(STAFF_TOKEN_KEY);
}

const RISK_COLORS: Record<RiskLevel, string> = {
  critical: 'bg-red-100 text-red-700 border-red-200',
  high: 'bg-orange-100 text-orange-700 border-orange-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200',
};

const RISK_LABELS: Record<RiskLevel, string> = {
  critical: 'Критический',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
};

const STATUS_LABELS: Record<CaseStatus, string> = {
  open: 'Открыт',
  in_progress: 'В работе',
  resolved: 'Решён',
  false_positive: 'Ложное срабатывание',
};

const STATUS_COLORS: Record<CaseStatus, string> = {
  open: 'bg-red-50 text-red-600',
  in_progress: 'bg-blue-50 text-blue-600',
  resolved: 'bg-green-50 text-green-600',
  false_positive: 'bg-gray-50 text-gray-500',
};

interface Props {
  staff: StaffUser | null;
  onLogout: () => void;
}

export default function StaffDashboard({ staff, onLogout }: Props) {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [caseMessages, setCaseMessages] = useState<StaffMessage[]>([]);
  const [caseLoading, setCaseLoading] = useState(false);
  const [filterRisk, setFilterRisk] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterRisk) params.set('risk_level', filterRisk);
      if (filterStatus) params.set('status', filterStatus);

      const res = await fetch(`${API_BASE}/api/staff/cases?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setCases(data.cases ?? []);
    } catch {
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [filterRisk, filterStatus]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const openCase = async (c: Case) => {
    setSelectedCase(c);
    setCaseLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/staff/cases/${c.id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      setCaseMessages(data.recentMessages ?? []);
    } catch {
      setCaseMessages([]);
    } finally {
      setCaseLoading(false);
    }
  };

  const updateStatus = async (caseId: number, status: CaseStatus) => {
    try {
      await fetch(`${API_BASE}/api/staff/cases/${caseId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
      });
      setCases((prev) => prev.map((c) => c.id === caseId ? { ...c, status } : c));
      if (selectedCase?.id === caseId) {
        setSelectedCase((prev) => prev ? { ...prev, status } : null);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F7FF] overflow-hidden">
      {/* Шапка */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <img src="/logo_senim.png" alt="Senim" className="h-7 object-contain" />
            <span className="text-xs text-gray-400 border-l border-gray-200 pl-3">Панель персонала</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{staff?.username} · {staff?.role}</span>
            <button
              onClick={onLogout}
              className="text-xs text-gray-400 hover:text-gray-600 transition"
            >
              Выйти
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Список кейсов */}
          <div className={`flex flex-col ${selectedCase ? 'w-1/2' : 'w-full'} border-r border-gray-100`}>
            {/* Фильтры */}
            <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-700">Обращения</span>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="ml-auto text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#7C6AF7]"
              >
                <option value="">Все уровни риска</option>
                <option value="critical">Критический</option>
                <option value="high">Высокий</option>
                <option value="medium">Средний</option>
                <option value="low">Низкий</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#7C6AF7]"
              >
                <option value="">Все статусы</option>
                <option value="open">Открыт</option>
                <option value="in_progress">В работе</option>
                <option value="resolved">Решён</option>
                <option value="false_positive">Ложное срабатывание</option>
              </select>
            </div>

            {/* Список */}
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="flex flex-col gap-2 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              )}

              {!loading && cases.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                  <span className="text-3xl mb-2">✅</span>
                  <p>Нет обращений по выбранным фильтрам</p>
                </div>
              )}

              {!loading && cases.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openCase(c)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-white transition
                    ${selectedCase?.id === c.id ? 'bg-white border-l-2 border-l-[#7C6AF7]' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${RISK_COLORS[c.risk_level]}`}>
                      {RISK_LABELS[c.risk_level]}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>
                      {STATUS_LABELS[c.status]}
                    </span>
                    <span className="ml-auto text-xs text-gray-400">
                      {new Date(c.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 truncate">{c.student_email}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{c.source_message}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Детали кейса */}
          {selectedCase && (
            <div className="flex flex-col w-1/2 bg-white">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{selectedCase.student_email}</p>
                  <p className="text-xs text-gray-400">#{selectedCase.id} · {selectedCase.category}</p>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >✕</button>
              </div>

              {/* Смена статуса */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="text-xs text-gray-500">Статус:</span>
                <select
                  value={selectedCase.status}
                  onChange={(e) => updateStatus(selectedCase.id, e.target.value as CaseStatus)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#7C6AF7]"
                >
                  <option value="open">Открыт</option>
                  <option value="in_progress">В работе</option>
                  <option value="resolved">Решён</option>
                  <option value="false_positive">Ложное срабатывание</option>
                </select>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${RISK_COLORS[selectedCase.risk_level]}`}>
                  {RISK_LABELS[selectedCase.risk_level]}
                </span>
              </div>

              {/* Триггер сообщение */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Триггерное сообщение:</p>
                <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{selectedCase.source_message}</p>
              </div>

              {/* Последние сообщения */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <p className="text-xs text-gray-400 mb-3">Последние сообщения студента:</p>
                {caseLoading && <div className="h-8 bg-gray-100 rounded-xl animate-pulse" />}
                {!caseLoading && caseMessages.length === 0 && (
                  <p className="text-xs text-gray-400">Нет сообщений</p>
                )}
                {!caseLoading && caseMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-2 px-3 py-2 rounded-xl text-xs ${
                      msg.role === 'user'
                        ? 'bg-[#ede9fe] text-gray-800 ml-4'
                        : 'bg-gray-50 text-gray-600 mr-4'
                    }`}
                  >
                    <span className="font-medium">{msg.role === 'user' ? 'Студент' : 'Senim'}:</span>{' '}
                    {msg.content}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
