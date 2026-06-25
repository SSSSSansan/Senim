import { useEffect, useState } from 'react';
import type { Emotion } from '../types';

const EMOTION_MAP: Record<Emotion, { emoji: string; label: string; color: string }> = {
  joy:     { emoji: '😊', label: 'Радость',      color: 'bg-yellow-50 border-yellow-200' },
  sadness: { emoji: '😔', label: 'Грусть',       color: 'bg-blue-50 border-blue-200' },
  anxiety: { emoji: '😟', label: 'Тревога',      color: 'bg-purple-50 border-purple-200' },
  anger:   { emoji: '😡', label: 'Злость',       color: 'bg-red-50 border-red-200' },
  neutral: { emoji: '😐', label: 'Нейтрально',   color: 'bg-gray-50 border-gray-200' },
};

interface Props {
  emotion: Emotion;
}

export default function EmotionBadge({ emotion }: Props) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<Emotion>(emotion);
  const [tooltipOpen, setTooltipOpen] = useState(false);

  // Плавное появление при монтировании
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Анимация смены эмоции: fade out → swap → fade in
  useEffect(() => {
    if (emotion === current) return;
    setVisible(false);
    const t = setTimeout(() => {
      setCurrent(emotion);
      setVisible(true);
    }, 200);
    return () => clearTimeout(t);
  }, [emotion, current]);

  const { emoji, label, color } = EMOTION_MAP[current];

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={() => setTooltipOpen((v) => !v)}
        onBlur={() => setTooltipOpen(false)}
        className={`
          flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs
          transition-all duration-200 cursor-default select-none
          ${color}
          ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
        `}
        aria-label={label}
      >
        <span className={`text-base transition-transform duration-200 ${visible ? 'scale-100' : 'scale-50'}`}>
          {emoji}
        </span>
        <span className="text-gray-500 hidden sm:inline">{label}</span>
      </button>

      {/* Tooltip (мобайл — по клику, десктоп — по hover через sm:hidden выше) */}
      {tooltipOpen && (
        <div className="absolute left-0 bottom-8 whitespace-nowrap bg-gray-800 text-white text-xs
                        rounded-lg px-2.5 py-1.5 shadow-lg z-10 sm:hidden">
          {label}
          <div className="absolute -bottom-1 left-3 w-2 h-2 bg-gray-800 rotate-45" />
        </div>
      )}
    </div>
  );
}
