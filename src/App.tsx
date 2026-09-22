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

const MODELS = [
  { id: 'openai', name: 'GPT-4o', desc: 'OpenAI' },
  { id: 'openai-large', name: 'GPT-4o Large', desc: 'Better Quality' },
  { id: 'claude', name: 'Claude', desc: 'Anthropic' },
  { id: 'mistral', name: 'Mistral', desc: 'Fast' },
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Simple AI API call - uses Pollinations POST endpoint (OpenAI-compatible)
async function getAIResponse(prompt: string, model: string = 'openai'): Promise<string> {
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  
  const response = await fetch('https://text.pollinations.ai/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
    cache: 'no-store',
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: `You are Neo AI, a helpful assistant. Current time: ${new Date().toISOString()}. Request ID: ${uniqueId}. Answer questions directly and accurately.`
        },
        {
          role: 'user',
          content: `${prompt} [Request: ${uniqueId}]`
        }
      ],
      model: model,
      seed: Math.floor(Math.random() * 999999)
    })
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const text = await response.text();
  
  if (!text || text.length < 2) {
    throw new Error('Empty response received');
  }
  
  return text.trim();
}

// Sidebar Component
function Sidebar({ 
  conversations, 
  activeConversation, 
  onSelectConversation, 
  onNewChat,
  onOpenModelSelect,
  currentModel,
  isOpen,
  onClose 
}: { 
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onOpenModelSelect: () => void;
  currentModel: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const currentModelInfo = MODELS.find(m => m.id === currentModel) || MODELS[0];
  
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
                src="https://cdn.discordapp.com/avatars/1530037654278766653/f6f834053d1f3b86f503519f74b840bd.webp?size=1024" 
                alt="Neo AI" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Neo AI</h1>
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

        <div className="p-4 border-t border-white/5">
          <button
            onClick={onOpenModelSelect}
            className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/5 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/20 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 truncate">{currentModelInfo.name}</p>
              <p className="text-[10px] text-white/30">{currentModelInfo.desc}</p>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
}

// Model Selector Modal
function ModelSelector({ 
  isOpen, 
  onClose, 
  currentModel, 
  onSelectModel 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  currentModel: string;
  onSelectModel: (model: string) => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Select Model</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="space-y-2">
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => { onSelectModel(model.id); onClose(); }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left
                ${currentModel === model.id 
                  ? 'border-purple-500/40 bg-purple-500/10' 
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10'
                }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                currentModel === model.id 
                  ? 'bg-purple-500/20 border border-purple-500/30' 
                  : 'bg-white/5 border border-white/10'
              }`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={currentModel === model.id ? 'text-purple-400' : 'text-white/40'}>
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{model.name}</p>
                <p className="text-xs text-white/40">{model.desc}</p>
              </div>
              {currentModel === model.id && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>

        <div className="mt-4 px-2">
          <p className="text-[11px] text-white/30 text-center">
            Free & unlimited — no API keys needed ✨
          </p>
        </div>
      </div>
    </div>
  );
}

// Typing Indicator
function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 message-appear">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 neo-glow ring-1 ring-purple-500/30 overflow-hidden">
        <img 
          src="https://cdn.discordapp.com/avatars/1530037654278766653/f6f834053d1f3b86f503519f74b840bd.webp?size=1024" 
          alt="Neo AI" 
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

// Message Component
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <span key={i}>
            {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
            {i < content.split('\n').length - 1 && <br />}
          </span>
        );
      }
      return (
        <span key={i}>
          {line}
          {i < content.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

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
            src="https://cdn.discordapp.com/avatars/1530037654278766653/f6f834053d1f3b86f503519f74b840bd.webp?size=1024" 
            alt="Neo AI" 
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className={`max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block text-left rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser 
            ? 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white rounded-tr-sm' 
            : 'bg-white/5 border border-white/5 text-white/90 rounded-tl-sm'
        }`}>
          {renderContent(message.content)}
        </div>
        <p className={`text-[10px] text-white/30 mt-1.5 px-1 ${isUser ? 'text-right' : ''}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

// Welcome Screen
function WelcomeScreen({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  const suggestions = [
    { icon: "💡", text: "Explain quantum computing" },
    { icon: "💻", text: "Write a Python function" },
    { icon: "🎨", text: "Help me write a story" },
    { icon: "🧠", text: "What is AI?" },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 fade-in">
      <div className="w-20 h-20 rounded-2xl overflow-hidden neo-glow pulse-ring mb-6 ring-2 ring-purple-500/40">
        <img 
          src="https://cdn.discordapp.com/avatars/1530037654278766653/f6f834053d1f3b86f503519f74b840bd.webp?size=1024" 
          alt="Neo AI" 
          className="w-full h-full object-cover"
        />
      </div>
      <h2 className="text-3xl font-bold text-white mb-2 neo-text-glow">Hello, I'm Neo AI</h2>
      <p className="text-white/40 text-center max-w-md mb-8">
        Your intelligent assistant — free, unlimited, no API keys. Ask me anything.
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

// Main App
export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('openai');
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Clear old localStorage data on load
  useEffect(() => {
    localStorage.removeItem('neo-conversations');
    localStorage.removeItem('neo-api-key');
    localStorage.removeItem('neo-model');
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
      // Call AI API
      const response = await getAIResponse(text.trim(), selectedModel);

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
      const errorMessage = err instanceof Error ? err.message : 'Failed to get response. Please try again.';
      setError(errorMessage);
      
      const errorMsg: Message = {
        id: generateId(),
        role: 'assistant',
        content: `⚠️ ${errorMessage}`,
        timestamp: new Date(),
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConvId) {
          return { ...conv, messages: [...conv.messages, errorMsg] };
        }
        return conv;
      }));
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
        onOpenModelSelect={() => setModelSelectorOpen(true)}
        currentModel={selectedModel}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <ModelSelector
        isOpen={modelSelectorOpen}
        onClose={() => setModelSelectorOpen(false)}
        currentModel={selectedModel}
        onSelectModel={setSelectedModel}
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
            <span className="text-sm text-white/60">Neo AI v3 • Live</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setModelSelectorOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/80 transition-colors text-xs"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              Change Model
            </button>
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
                placeholder="Message Neo AI..."
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
            <p className="text-[10px] text-white/20 text-center mt-2">
              Neo AI v3.0 — Free & unlimited • No API keys required • Build: {Date.now()}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
