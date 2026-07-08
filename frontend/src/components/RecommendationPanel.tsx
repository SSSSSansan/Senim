import { useState, useEffect } from 'react';

interface Props {
  recommendations: string[];
  onClose: () => void;
}

export default function RecommendationPanel({ recommendations, onClose }: Props) {
  const [visible, setVisible] = useState(false);

  // fade-in при монтировании
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  if (!recommendations.length) return null;

  return (
    <div
      className={`mx-4 mb-3 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">💡</span>
            <span className="text-sm font-semibold text-gray-800">Рекомендации для тебя</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-500 transition text-lg leading-none"
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        <ul className="flex flex-col gap-2">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[#ede9fe] text-[#7C6AF7] text-xs flex items-center justify-center font-medium">
                {i + 1}
              </span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
