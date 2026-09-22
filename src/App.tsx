import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const SYSTEM_PROMPT = `You are Neo AI, a highly intelligent, helpful, and friendly AI assistant. You have a sleek, modern personality. You provide clear, accurate, and well-structured responses. You use markdown formatting when helpful (bold, lists, code blocks). You're knowledgeable about virtually any topic and can help with coding, writing, analysis, math, creative tasks, and general questions. Keep responses concise but thorough. When appropriate, use emojis sparingly to add personality.`;

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Settings Modal
function SettingsModal({ 
  isOpen, 
  onClose, 
  apiKey, 
  onSaveApiKey,
  model,
  onSaveModel
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  model: string;
  onSaveModel: (model: string) => void;
}) {
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempModel, setTempModel] = useState(model);

  useEffect(() => {
    setTempKey(apiKey);
    setTempModel(model);
  }, [apiKey, model, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 fade-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Settings</h2>
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

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              OpenAI API Key
            </label>
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white 
                         placeholder:text-white/20 outline-none focus:border-purple-500/50 transition-colors"
            />
            <p className="text-[11px] text-white/30 mt-2">
              Your API key is stored locally in your browser and never sent to any server except OpenAI.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Model
            </label>
            <select
              value={tempModel}
              onChange={(e) => setTempModel(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white 
                         outline-none focus:border-purple-500/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="gpt-4o-mini" className="bg-[#0a0a0a]">GPT-4o Mini (Fast)</option>
              <option value="gpt-4o" className="bg-[#0a0a0a]">GPT-4o (Smart)</option>
              <option value="gpt-4-turbo" className="bg-[#0a0a0a]">GPT-4 Turbo</option>
              <option value="gpt-3.5-turbo" className="bg-[#0a0a0a]">GPT-3.5 Turbo</option>
            </select>
          </div>

          <button
            onClick={() => {
              onSaveApiKey(tempKey);
              onSaveModel(tempModel);
              onClose();
            }}
            className="w-full py-3 rounded-xl neo-gradient text-white font-medium text-sm
                       hover:opacity-90 transition-opacity neo-glow"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

// Sidebar Component
function Sidebar({ 
  conversations, 
  activeConversation, 
  onSelectConversation, 
  onNewChat,
  onOpenSettings,
  isOpen,
  onClose 
}: { 
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed lg:relative z-50 h-full
        w-72 bg-[#0a0a0a] border-r border-white/5
        flex flex-col transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
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

        {/* New Chat Button */}
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

        {/* Conversations List */}
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

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/5 text-white/50 hover:text-white/80 transition-colors text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
            Settings
          </button>
          <div className="flex items-center gap-3 py-2 px-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 truncate">User</p>
              <p className="text-[10px] text-white/30">Connected to OpenAI</p>
            </div>
          </div>
        </div>
      </aside>
    </>
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

// Message Component with Markdown-like rendering
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Code blocks
      if (line.startsWith('```')) {
        return null; // handled below
      }
      
      // Headers
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-base font-bold text-white mt-3 mb-1">{renderInline(line.slice(4))}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-lg font-bold text-white mt-3 mb-1">{renderInline(line.slice(3))}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={i} className="text-xl font-bold text-white mt-3 mb-1">{renderInline(line.slice(2))}</h1>;
      }

      // Bullet points
      if (line.match(/^[\s]*[-•*]\s/)) {
        const indent = line.match(/^(\s*)/)?.[1].length || 0;
        const text = line.replace(/^[\s]*[-•*]\s/, '');
        return (
          <div key={i} className="flex items-start gap-2 ml-2" style={{ paddingLeft: `${indent * 8}px` }}>
            <span className="text-purple-400 mt-0.5">•</span>
            <span>{renderInline(text)}</span>
          </div>
        );
      }

      // Numbered lists
      if (line.match(/^[\s]*\d+\.\s/)) {
        const num = line.match(/^[\s]*(\d+)\./)?.[1];
        const text = line.replace(/^[\s]*\d+\.\s/, '');
        return (
          <div key={i} className="flex items-start gap-2 ml-2">
            <span className="text-purple-400 font-medium min-w-[16px]">{num}.</span>
            <span>{renderInline(text)}</span>
          </div>
        );
      }

      // Empty line
      if (line.trim() === '') {
        return <br key={i} />;
      }

      // Regular text
      return <span key={i}>{renderInline(line)}{i < lines.length - 1 && <br />}</span>;
    });
  };

  const renderInline = (text: string) => {
    // Simple approach: replace patterns with markers and render
    const result: React.ReactNode[] = [];
    let keyCounter = 0;
    
    // Use a single regex to find all inline patterns
    const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    
    while ((match = pattern.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        result.push(<span key={keyCounter++}>{text.slice(lastIndex, match.index)}</span>);
      }
      
      const fullMatch = match[0];
      if (fullMatch.startsWith('`')) {
        // Inline code
        result.push(<code key={keyCounter++} className="bg-white/10 px-1.5 py-0.5 rounded text-purple-300 text-[13px] font-mono">{fullMatch.slice(1, -1)}</code>);
      } else if (fullMatch.startsWith('**')) {
        // Bold
        result.push(<strong key={keyCounter++} className="text-white font-semibold">{fullMatch.slice(2, -2)}</strong>);
      } else if (fullMatch.startsWith('*')) {
        // Italic
        result.push(<em key={keyCounter++} className="text-white/80 italic">{fullMatch.slice(1, -1)}</em>);
      }
      
      lastIndex = match.index + fullMatch.length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      result.push(<span key={keyCounter++}>{text.slice(lastIndex)}</span>);
    }
    
    return result.length > 0 ? result : <span>{text}</span>;
  };

  return (
    <div className={`flex items-start gap-3 message-appear ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
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

      {/* Message Content */}
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
function WelcomeScreen({ onSuggestionClick, hasApiKey }: { onSuggestionClick: (text: string) => void; hasApiKey: boolean }) {
  const suggestions = [
    { icon: "💡", text: "Explain quantum computing in simple terms" },
    { icon: "🎨", text: "Help me write a creative story" },
    { icon: "💻", text: "Write a Python function to sort a list" },
    { icon: "🧠", text: "What are the latest advances in AI?" },
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
      <p className="text-white/40 text-center max-w-md mb-3">
        Your intelligent assistant powered by OpenAI. Ask me anything — I'm here to help.
      </p>
      {!hasApiKey && (
        <div className="mb-8 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300/80 text-xs text-center max-w-md">
          ⚠️ Please add your OpenAI API key in Settings to start chatting
        </div>
      )}

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
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('neo-conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((c: Conversation) => ({
          ...c,
          createdAt: new Date(c.createdAt),
          messages: c.messages.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) }))
        }));
      } catch { return []; }
    }
    return [];
  });
  
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('neo-api-key') || '');
  const [model, setModel] = useState<string>(() => localStorage.getItem('neo-model') || 'gpt-4o-mini');
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Save conversations to localStorage
  useEffect(() => {
    localStorage.setItem('neo-conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isTyping]);

  const saveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('neo-api-key', key);
  };

  const saveModel = (m: string) => {
    setModel(m);
    localStorage.setItem('neo-model', m);
  };

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
    if (!text.trim() || isTyping) return;

    if (!apiKey) {
      setSettingsOpen(true);
      setError('Please add your OpenAI API key to start chatting.');
      return;
    }

    let currentConvId = activeConversationId;

    // Create new conversation if none exists
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

    // Update conversation
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
    setIsTyping(true);
    setError(null);

    // Build messages array for API
    const currentConv = conversations.find(c => c.id === currentConvId);
    const previousMessages = currentConv?.messages || [];
    
    const apiMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...previousMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: text.trim() },
    ];

    // Create abort controller for streaming
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model,
          messages: apiMessages,
          stream: true,
          temperature: 0.7,
          max_tokens: 2048,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error?.message || `API Error: ${response.status} ${response.statusText}`;
        
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your key in Settings.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (response.status === 402) {
          throw new Error('Insufficient credits. Please add credits to your OpenAI account.');
        }
        throw new Error(errorMessage);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };

      // Add empty AI message
      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConvId) {
          return { ...conv, messages: [...conv.messages, aiMessage] };
        }
        return conv;
      }));

      setIsTyping(false);
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

          for (const line of lines) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                setConversations(prev => prev.map(conv => {
                  if (conv.id === currentConvId) {
                    const messages = [...conv.messages];
                    const lastMsg = messages[messages.length - 1];
                    if (lastMsg && lastMsg.role === 'assistant') {
                      messages[messages.length - 1] = { ...lastMsg, content: fullContent };
                    }
                    return { ...conv, messages };
                  }
                  return conv;
                }));
              }
            } catch {
              // Skip malformed JSON chunks
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User cancelled
      } else {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
        
        // Add error message to conversation
        const errorMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: `⚠️ Error: ${errorMessage}`,
          timestamp: new Date(),
        };
        setConversations(prev => prev.map(conv => {
          if (conv.id === currentConvId) {
            return { ...conv, messages: [...conv.messages, errorMsg] };
          }
          return conv;
        }));
      }
    } finally {
      setIsTyping(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const stopGenerating = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  return (
    <div className="h-full flex bg-black">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversationId}
        onSelectConversation={(id) => {
          setActiveConversationId(id);
          setSidebarOpen(false);
          setError(null);
        }}
        onNewChat={createNewChat}
        onOpenSettings={() => setSettingsOpen(true)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={saveApiKey}
        model={model}
        onSaveModel={saveModel}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        {/* Header */}
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
            <div className={`w-2 h-2 rounded-full ${apiKey ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></div>
            <span className="text-sm text-white/60">
              {apiKey ? `Neo AI • ${model}` : 'Neo AI • Not Connected'}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
              title="Settings"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
          </div>
        </header>

        {/* Error Banner */}
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

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <WelcomeScreen 
              onSuggestionClick={(text) => sendMessage(text)} 
              hasApiKey={!!apiKey}
            />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {activeConversation.messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-white/5 p-4 bg-black/50 backdrop-blur-xl">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-[#111] border border-white/10 rounded-2xl p-2 focus-within:border-purple-500/50 transition-colors">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={apiKey ? "Message Neo AI..." : "Add your API key in Settings to start..."}
                rows={1}
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 
                           resize-none outline-none px-3 py-2 max-h-32 min-h-[40px]"
                style={{ height: 'auto', minHeight: '40px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
              />
              {isTyping ? (
                <button
                  onClick={stopGenerating}
                  className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all flex-shrink-0"
                  title="Stop generating"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => sendMessage()}
                  disabled={!inputValue.trim()}
                  className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 ${
                    inputValue.trim()
                      ? 'neo-gradient neo-glow text-white hover:opacity-90'
                      : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              )}
            </div>
            <p className="text-[10px] text-white/20 text-center mt-2">
              Neo AI powered by OpenAI • Responses are streamed in real-time
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
