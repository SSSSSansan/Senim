import { useEffect, useRef } from 'react';
import type { Message } from '../types';
import EmotionBadge from './EmotionBadge';

interface Props {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatWindow({ messages, isLoading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className={`flex-1 px-4 py-6 space-y-4 ${messages.length > 0 ? 'overflow-y-auto' : 'overflow-hidden'}`}>
      {isEmpty && (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 select-none">
          <img src={`${import.meta.env.BASE_URL}senim_logo2.png`} alt="Senim" className="w-16 h-16 object-contain mb-3" />
          <p className="text-sm">Привет! Я Senim.<br />Расскажи, как ты сегодня?</p>
        </div>
      )}

      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {msg.role === 'assistant' && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#7C6AF7] flex items-center justify-center text-white text-sm">
              💙
            </div>
          )}

          <div className={`flex flex-col gap-1.5 max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div
              className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words
                ${msg.role === 'user'
                  ? 'bg-[#7C6AF7] text-white rounded-br-sm'
                  : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                }`}
            >
              {msg.content}
            </div>

            {msg.role === 'assistant' && msg.emotion && (
              <EmotionBadge emotion={msg.emotion} />
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex items-end gap-2">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#7C6AF7] flex items-center justify-center text-white text-sm">
            💙
          </div>
          <div className="bg-white shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
            <span className="text-xs text-gray-400 mr-1">Senim печатает</span>
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
