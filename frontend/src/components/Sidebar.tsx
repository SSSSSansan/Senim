import type { Conversation } from '../types';

interface Props {
  conversations: Conversation[];
  activeId?: string;
  loading: boolean;
  onSelect: (conv: Conversation) => void;
  onNew: () => void;
  onClose: () => void;
}

function groupByDate(conversations: Conversation[]): Record<string, Conversation[]> {
  const groups: Record<string, Conversation[]> = {};
  const now = new Date();

  for (const conv of conversations) {
    const date = new Date(conv.createdAt);
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    let label: string;
    if (diffDays === 0) label = 'Сегодня';
    else if (diffDays === 1) label = 'Вчера';
    else if (diffDays < 7) label = 'На этой неделе';
    else if (diffDays < 30) label = 'В этом месяце';
    else label = 'Раньше';

    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
  }

  return groups;
}

const GROUP_ORDER = ['Сегодня', 'Вчера', 'На этой неделе', 'В этом месяце', 'Раньше'];

export default function Sidebar({ conversations, activeId, loading, onSelect, onNew, onClose }: Props) {
  const groups = groupByDate(conversations);

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-gray-100">
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <span className="font-semibold text-gray-700 text-sm">Диалоги</span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100"
          aria-label="Закрыть"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="px-3 pt-3 pb-2">
        <button
          onClick={onNew}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl
                     bg-[#F3F0FF] hover:bg-[#ede9fe] text-[#7C6AF7] text-sm font-medium
                     transition active:scale-95"
        >
          <span className="text-lg leading-none">＋</span>
          Новый диалог
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {loading && (
          <div className="flex flex-col gap-2 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && conversations.length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-6 px-2">
            Пока нет диалогов.<br />Начни новый разговор!
          </p>
        )}

        {!loading &&
          GROUP_ORDER.filter((g) => groups[g]?.length).map((group) => (
            <div key={group} className="mt-3">
              <p className="text-xs text-gray-400 font-medium px-2 mb-1">{group}</p>
              <div className="flex flex-col gap-0.5">
                {groups[group].map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => onSelect(conv)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition truncate
                      ${activeId === conv.id
                        ? 'bg-[#ede9fe] text-[#7C6AF7] font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {conv.title || 'Без названия'}
                  </button>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}