interface Scenario {
  id: string;
  emoji: string;
  label: string;
  message: string; // текст который уйдёт в чат скрыто
}

const SCENARIOS: Scenario[] = [
  {
    id: 'stress',
    emoji: '😰',
    label: 'Стресс',
    message: 'Я сейчас сильно стрессую и не знаю как справиться.',
  },
  {
    id: 'exam',
    emoji: '📚',
    label: 'Перед экзаменом',
    message: 'У меня скоро экзамен и я очень переживаю.',
  },
  {
    id: 'sad',
    emoji: '😔',
    label: 'Грустно',
    message: 'Мне сейчас грустно, хочу поговорить.',
  },
  {
    id: 'sleep',
    emoji: '😴',
    label: 'Не могу уснуть',
    message: 'Я не могу уснуть, мысли не дают покоя.',
  },
  {
    id: 'burnout',
    emoji: '😣',
    label: 'Выгорание',
    message: 'Я чувствую выгорание, нет сил ни на что.',
  },
];

interface Props {
  onSelect: (message: string, scenario: string) => void;
}

export default function QuickScenarios({ onSelect }: Props) {
  return (
    <div className="px-4 pb-4">
      <p className="text-xs text-gray-400 text-center mb-3">Выбери тему или напиши сам</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.message, s.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200
                       bg-white text-sm text-gray-700 hover:border-[#7C6AF7] hover:text-[#7C6AF7]
                       hover:bg-[#F8F7FF] transition active:scale-95 shadow-sm"
          >
            <span>{s.emoji}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}