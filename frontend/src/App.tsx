import { useState, useCallback } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import Sidebar from './components/Sidebar';
import QuickScenarios from './components/QuickScenarios';
import RecommendationPanel from './components/RecommendationPanel';
import EmergencyBanner from './components/EmergencyBanner';
import { useAuth } from './hooks/useAuth';
import { useChat } from './hooks/useChat';
import { useHistory } from './hooks/useHistory';
import type { Conversation } from './types';

export default function App() {
  const { step, logout, email, loading, error: authError, requestCode, verifyCode, backToEmail } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeConversation, setActiveConversation] = useState<Conversation | undefined>();
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

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

  const handleRecommendations = useCallback((recs: string[]) => {
    setRecommendations(recs);
    setShowRecommendations(true);
  }, []);

  const handleEmergency = useCallback(() => {
    setIsEmergency(true);
  }, []);

  const { messages, isLoading, error: chatError, sendMessage, loadMessages, reset } = useChat({
    conversationId: activeConversation?.id,
    onConversationCreated: handleConversationCreated,
    onRecommendations: handleRecommendations,
    onEmergency: handleEmergency,
  });

  const handleSelectConversation = useCallback(
    async (conv: Conversation) => {
      setActiveConversation(conv);
      setSidebarOpen(false);
      setIsEmergency(false);
      setShowRecommendations(false);
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
    setIsEmergency(false);
    setShowRecommendations(false);
    setRecommendations([]);
    reset();
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

      {sidebarOpen && (
        <div className="fixed md:relative z-20 h-full">
          <Sidebar
            conversations={conversations}
            activeId={activeConversation?.id}
            loading={historyLoading}
            onSelect={(conv) => {
              setActiveConversation(conv);
              setIsEmergency(false);
              setShowRecommendations(false);
              setSidebarOpen(window.innerWidth >= 768);
              fetchMessages(conv.id).then(loadMessages).catch(() => loadMessages([]));
            }}
            onNew={handleNewConversation}
            onClose={() => setSidebarOpen(false)}
          />
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100"
              aria-label="Показать/скрыть диалоги"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <img src="/logo_senim.png" alt="Senim" className="h-7 object-contain" />
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

        {isEmergency && (
          <EmergencyBanner onContinue={() => setIsEmergency(false)} />
        )}

        {showRecommendations && recommendations.length > 0 && !isEmergency && (
          <RecommendationPanel
            recommendations={recommendations}
            onClose={() => setShowRecommendations(false)}
          />
        )}

        {showScenarios && !isEmergency && (
          <QuickScenarios onSelect={handleScenario} />
        )}

        <MessageInput onSend={sendMessage} disabled={isLoading || isEmergency} />
      </div>
    </div>
  );
}
