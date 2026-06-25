import { useState, useRef} from 'react';
import type { KeyboardEvent } from 'react';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
    // Сбрасываем высоту textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter — отправить, Shift+Enter — перенос строки
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 140) + 'px';
  };

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-100">
      <div className="flex items-end gap-2 bg-[#F8F7FF] rounded-2xl px-4 py-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Напиши что-нибудь..."
          disabled={disabled}
          className="flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400
                     focus:outline-none leading-relaxed py-1 max-h-36 disabled:opacity-50"
        />

        <button
          onClick={handleSend}
          disabled={!canSend}
          className="flex-shrink-0 w-9 h-9 mb-0.5 rounded-xl bg-[#7C6AF7] flex items-center justify-center
                     text-white transition hover:bg-[#6a59e0] active:scale-90
                     disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Отправить"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>

      <p className="text-center text-xs text-gray-300 mt-2">
        Senim — не замена психологу · Телефон доверия{' '}
        <a href="tel:150" className="text-[#7C6AF7]">150</a>
      </p>
    </div>
  );
}
