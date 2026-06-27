import { useState, useEffect } from 'react';

interface Props {
  onContinue: () => void; // "Продолжить разговор" — на случай ложного срабатывания
}

export default function EmergencyBanner({ onContinue }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`mx-4 mb-3 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🆘</span>
          <span className="text-sm font-semibold text-red-700">Похоже, тебе сейчас очень тяжело</span>
        </div>

        <p className="text-sm text-red-600 mb-3 leading-relaxed">
          Если ты в кризисе — ты не один. Пожалуйста, обратись за помощью прямо сейчас.
        </p>

        <div className="flex flex-col gap-2 mb-3">
          <a
            href="tel:150"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 transition text-sm text-red-700 font-medium"
          >
            <span>📞</span>
            Телефон доверия — 150 (бесплатно, круглосуточно)
          </a>
          <a
            href="tel:+77172704567"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-100 hover:bg-red-200 transition text-sm text-red-700 font-medium"
          >
            <span>🏥</span>
            Психолог KBTU — +7 (717) 270-45-67
          </a>
        </div>

        <p className="text-xs text-red-400 mb-2">
          Твой куратор уведомлён и готов помочь.
        </p>

        <button
          onClick={onContinue}
          className="text-xs text-gray-400 hover:text-gray-600 underline transition"
        >
          Продолжить разговор с Senim
        </button>
      </div>
    </div>
  );
}
