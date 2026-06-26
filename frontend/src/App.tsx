import { useState, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import Sidebar from './components/Sidebar';
import QuickScenarios from './components/QuickScenarios';
import { useAuth } from './hooks/useAuth';
import { useChat } from './hooks/useChat';
import { useHistory } from './hooks/useHistory';
import type { Conversation } from './types';

export default function App() {
  const { step, logout, email, loading, error: authError, requestCode, verifyCode, backToEmail } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<Conversation | undefined>();

  const { conversations, loading: historyLoading, fetchConversations, fetchMessages, addConversation } = useHistory();

  const handleConversationCreated = useCallback(
    (id: string) => {
      const newConv: Conversation = {
        id,
        title: 'Новый диалог',
        createdAt: new Date().toISOString(),
      };
      addConversation(newConv);
      setActiveConversation(newConv);
      setTimeout(fetchConversations, 1500);
    },
    [addConversation, fetchConversations],
  );

  const { messages, isLoading, error: chatError, sendMessage, loadMessages, reset } = useChat({
    conversationId: activeConversation?.id,
    onConversationCreated: handleConversationCreated,
  });

  const handleSelectConversation = useCallback(
    async (conv: Conversation) => {
      setActiveConversation(conv);
      setSidebarOpen(false);
      try {
        const msgs = await fetchMessages(conv.id);
        loadMessages(msgs);
      } catch {
        loadMessages([]);
      }
    },
    [fetchMessages, loadMessages],
  );

  const handleNewConversation = useCallback(() => {
    setActiveConversation(undefined);
    reset();
    setSidebarOpen(false);
  }, [reset]);

  const handleScenario = useCallback(
    (message: string, scenario: string) => {
      sendMessage(message, scenario);
    },
    [sendMessage],
  );

  const showScenarios = messages.length === 0 && !isLoading;

  if (step !== 'done') {
    return (
      <LoginScreen
        step={step}
        email={email}
        loading={loading}
        error={authError}
        requestCode={requestCode}
        verifyCode={verifyCode}
        backToEmail={backToEmail}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F7FF] overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
          fixed md:relative z-20 h-full transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <Sidebar
          conversations={conversations}
          activeId={activeConversation?.id}
          loading={historyLoading}
          onSelect={handleSelectConversation}
          onNew={handleNewConversation}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-gray-500 hover:text-gray-700 transition"
              aria-label="Открыть меню"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <span className="text-xl">💙</span>
            <span className="font-semibold text-gray-800">
              {activeConversation?.title ?? 'Senim'}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            Выйти
          </button>
        </header>

        {chatError && (
          <div className="mx-4 mt-3 px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-xs text-red-500">
            {chatError}
          </div>
        )}

        <ChatWindow messages={messages} isLoading={isLoading} />

        {showScenarios && (
          <QuickScenarios onSelect={handleScenario} />
        )}

        <MessageInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
