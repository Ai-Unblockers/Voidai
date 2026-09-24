import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

async function callAI(prompt: string): Promise<string> {
  const response = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are Void AI. Be helpful, accurate, and concise.' },
        { role: 'user', content: prompt }
      ],
      seed: Math.floor(Math.random() * 999999)
    })
  });
  
  if (!response.ok) throw new Error(`Error: ${response.status}`);
  
  const text = await response.text();
  if (!text || text.trim().length < 2) throw new Error('Empty response');
  
  return text.trim();
}

function Sidebar({ 
  conversations, 
  activeConversation, 
  onSelectConversation, 
  onNewChat,
  isOpen,
  onClose 
}: { 
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed lg:relative z-50 h-full
        w-72 bg-[#0a0a0a] border-r border-white/5
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl overflow-hidden neo-glow ring-1 ring-purple-500/30">
              <img 
                src="https://image.qwenlm.ai/generated-images/6470d6ef-9c70-4efb-9a7c-a1f65c3e8f66/_result.png" 
                alt="Void AI" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Void AI</h1>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">Intelligence Platform</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <button
            onClick={onNewChat}
            className="w-full py-3 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 
                       text-white/80 hover:text-white text-sm font-medium
                       transition-all duration-200 flex items-center gap-3 group"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-200">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <p className="text-[10px] text-white/30 uppercase tracking-widest px-2 mb-2">Recent</p>
          {conversations.length === 0 ? (
            <p className="text-xs text-white/20 px-2 py-4 text-center">No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`w-full text-left py-2.5 px-3 rounded-lg mb-1 text-sm transition-all duration-200 truncate
                  ${activeConversation === conv.id 
                    ? 'bg-white/10 text-white' 
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
              >
                {conv.title}
              </button>
            ))
          )}
        </div>
      </aside>
    </>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 message-appear">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 neo-glow ring-1 ring-purple-500/30 overflow-hidden">
        <img 
          src="https://image.qwenlm.ai/generated-images/6470d6ef-9c70-4efb-9a7c-a1f65c3e8f66/_result.png" 
          alt="Void AI" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-purple-400 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full typing-dot"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full typing-dot"></div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 message-appear ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden ${
        isUser 
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
          : 'neo-glow ring-1 ring-purple-500/30'
      }`}>
        {isUser ? (
          <span className="text-xs font-bold text-white">U</span>
        ) : (
          <img 
            src="https://image.qwenlm.ai/generated-images/6470d6ef-9c70-4efb-9a7c-a1f65c3e8f66/_result.png" 
            alt="Void AI" 
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className={`max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block text-left rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser 
            ? 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white rounded-tr-sm' 
            : 'bg-white/5 border border-white/5 text-white/90 rounded-tl-sm'
        }`}>
          {message.content}
        </div>
        <p className={`text-[10px] text-white/30 mt-1.5 px-1 ${isUser ? 'text-right' : ''}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

function WelcomeScreen({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  const suggestions = [
    { icon: "💡", text: "What is 2+2?" },
    { icon: "💻", text: "Write hello world in Python" },
    { icon: "🎨", text: "Tell me a joke" },
    { icon: "🧠", text: "What is AI?" },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 fade-in">
      <div className="w-20 h-20 rounded-2xl overflow-hidden neo-glow pulse-ring mb-6 ring-2 ring-purple-500/40">
        <img 
          src="https://image.qwenlm.ai/generated-images/6470d6ef-9c70-4efb-9a7c-a1f65c3e8f66/_result.png" 
          alt="Void AI" 
          className="w-full h-full object-cover"
        />
      </div>
      <h2 className="text-3xl font-bold text-white mb-2 neo-text-glow">Hello, I'm Void AI</h2>
      <p className="text-white/40 text-center max-w-md mb-8">
        Ask me anything.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(s.text)}
            className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 
                       hover:border-purple-500/20 transition-all duration-200 cursor-pointer group slide-up text-left"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">{s.icon}</span>
              <p className="text-sm text-white/50 group-hover:text-white/80 transition-colors">{s.text}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  useEffect(() => {
    localStorage.clear();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const createNewChat = () => {
    const newConv: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
    };
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setSidebarOpen(false);
    setError(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async (overrideText?: string) => {
    const text = overrideText || inputValue;
    if (!text.trim() || isLoading) return;

    let currentConvId = activeConversationId;

    if (!currentConvId) {
      const newConv: Conversation = {
        id: generateId(),
        title: text.slice(0, 40) + (text.length > 40 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
      };
      setConversations(prev => [newConv, ...prev]);
      currentConvId = newConv.id;
      setActiveConversationId(newConv.id);
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConvId) {
        const isFirstMessage = conv.messages.length === 0;
        return {
          ...conv,
          title: isFirstMessage ? text.slice(0, 40) + (text.length > 40 ? '...' : '') : conv.title,
          messages: [...conv.messages, userMessage],
        };
      }
      return conv;
    }));

    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await callAI(text.trim());

      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConvId) {
          return { ...conv, messages: [...conv.messages, aiMessage] };
        }
        return conv;
      }));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex bg-black">
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversationId}
        onSelectConversation={(id) => {
          setActiveConversationId(id);
          setSidebarOpen(false);
          setError(null);
        }}
        onNewChat={createNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col h-full min-w-0">
        <header className="h-14 border-b border-white/5 flex items-center px-4 gap-3 flex-shrink-0 bg-black/50 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-sm text-white/60">Void AI</span>
          </div>
        </header>

        {error && (
          <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300/80 text-xs flex items-center gap-2 fade-in">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-300/50 hover:text-red-300">✕</button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={(text) => sendMessage(text)} />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {activeConversation.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-white/5 p-4 bg-black/50 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-[#111] border border-white/10 rounded-2xl p-2 focus-within:border-purple-500/50 transition-colors">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Void AI..."
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 
                           resize-none outline-none px-3 py-2 max-h-32 min-h-[40px] disabled:opacity-50"
                style={{ height: 'auto', minHeight: '40px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 ${
                  inputValue.trim() && !isLoading
                    ? 'neo-gradient neo-glow text-white hover:opacity-90'
                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
