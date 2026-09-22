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

const AI_RESPONSES = [
  "That's an interesting question! Let me think about this carefully. Based on my analysis, I'd suggest approaching this from multiple angles. First, consider the core problem you're trying to solve. Then, break it down into smaller, manageable components. This systematic approach often leads to better solutions.",
  "I'd be happy to help with that! Here's what I think:\n\n1. Start by defining your goals clearly\n2. Research existing solutions and best practices\n3. Create a prototype or proof of concept\n4. Iterate based on feedback\n\nWould you like me to elaborate on any of these points?",
  "Great question! The key insight here is that complexity often hides simple solutions. When we strip away the noise and focus on fundamentals, patterns emerge that guide us toward elegant answers. Let me walk you through my reasoning step by step.",
  "Absolutely! Here's a comprehensive breakdown:\n\n**Analysis:**\nThe situation you're describing is quite common in modern development. The best approach combines proven methodologies with creative problem-solving.\n\n**Recommendation:**\nI'd suggest starting with a minimal viable approach and scaling from there. This reduces risk while allowing for rapid iteration.\n\n**Next Steps:**\n- Define success metrics\n- Set up monitoring\n- Plan for edge cases\n\nShall I dive deeper into any specific area?",
  "That's a fascinating topic! Let me share some insights:\n\nThe evolution of this field has been remarkable. What started as simple concepts has grown into a sophisticated ecosystem. The key trends I'm seeing are:\n\n• Increased automation and AI integration\n• Focus on user experience and accessibility\n• Emphasis on security and privacy\n• Growing importance of scalability\n\nEach of these areas presents both opportunities and challenges. What aspect interests you most?",
  "I understand what you're looking for. Here's my take:\n\nThe most effective solution combines technical excellence with practical considerations. While it's tempting to pursue the most advanced approach, sometimes the simpler path delivers better results.\n\nConsider this framework:\n1. **Assess** - Understand the current state\n2. **Design** - Plan the ideal outcome\n3. **Build** - Implement incrementally\n4. **Validate** - Test thoroughly\n5. **Optimize** - Refine based on data\n\nThis iterative approach ensures you're always moving in the right direction.",
  "Excellent point! Let me address this comprehensively.\n\nThe relationship between these concepts is more nuanced than it might appear at first glance. There are several layers to consider:\n\n**Surface Level:** The obvious interpretation works for simple cases.\n\n**Deeper Level:** When you account for edge cases and real-world constraints, the picture becomes more complex but also more interesting.\n\n**Practical Application:** In practice, I'd recommend a balanced approach that accounts for both theoretical ideals and practical limitations.\n\nWould you like me to provide specific examples or code snippets?",
];

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getAIResponse(): string {
  return AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)];
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Sidebar Component
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
      {/* Mobile overlay */}
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
            <div className="w-9 h-9 rounded-xl neo-gradient flex items-center justify-center neo-glow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
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
          {conversations.map((conv) => (
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
          ))}
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <span className="text-xs font-bold text-white">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 truncate">User</p>
              <p className="text-[10px] text-white/30">Free Plan</p>
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
      <div className="w-8 h-8 rounded-lg neo-gradient flex items-center justify-center flex-shrink-0 neo-glow">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
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

  return (
    <div className={`flex items-start gap-3 message-appear ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
          : 'neo-gradient neo-glow'
      }`}>
        {isUser ? (
          <span className="text-xs font-bold text-white">U</span>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        )}
      </div>

      {/* Message Content */}
      <div className={`max-w-[75%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block text-left rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser 
            ? 'bg-gradient-to-r from-purple-600/80 to-indigo-600/80 text-white rounded-tr-sm' 
            : 'bg-white/5 border border-white/5 text-white/90 rounded-tl-sm'
        }`}>
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line.split('**').map((part, j) => 
                j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part
              )}
              {i < message.content.split('\n').length - 1 && <br />}
            </span>
          ))}
        </div>
        <p className={`text-[10px] text-white/30 mt-1.5 px-1 ${isUser ? 'text-right' : ''}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
}

// Welcome Screen
function WelcomeScreen() {
  const suggestions = [
    { icon: "💡", text: "Explain quantum computing in simple terms" },
    { icon: "🎨", text: "Help me design a modern web application" },
    { icon: "📊", text: "Analyze the pros and cons of remote work" },
    { icon: "🚀", text: "Write a creative short story about AI" },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 fade-in">
      <div className="w-16 h-16 rounded-2xl neo-gradient flex items-center justify-center neo-glow pulse-ring mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-white mb-2 neo-text-glow">Hello, I'm Neo AI</h2>
      <p className="text-white/40 text-center max-w-md mb-10">
        Your intelligent assistant ready to help with anything. Ask me questions, get creative, or explore ideas together.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {suggestions.map((s, i) => (
          <div
            key={i}
            className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/5 
                       hover:border-white/10 transition-all duration-200 cursor-pointer group slide-up"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl">{s.icon}</span>
              <p className="text-sm text-white/50 group-hover:text-white/80 transition-colors">{s.text}</p>
            </div>
          </div>
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
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isTyping]);

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
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    let currentConvId = activeConversationId;

    // Create new conversation if none exists
    if (!currentConvId) {
      const newConv: Conversation = {
        id: generateId(),
        title: inputValue.slice(0, 40) + (inputValue.length > 40 ? '...' : ''),
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
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Update conversation title if it's the first message
    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConvId) {
        const isFirstMessage = conv.messages.length === 0;
        return {
          ...conv,
          title: isFirstMessage ? inputValue.slice(0, 40) + (inputValue.length > 40 ? '...' : '') : conv.title,
          messages: [...conv.messages, userMessage],
        };
      }
      return conv;
    }));

    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    const delay = 1000 + Math.random() * 2000;
    setTimeout(() => {
      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: getAIResponse(),
        timestamp: new Date(),
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConvId) {
          return { ...conv, messages: [...conv.messages, aiMessage] };
        }
        return conv;
      }));
      setIsTyping(false);
    }, delay);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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
        }}
        onNewChat={createNewChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-sm text-white/60">Neo AI</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] text-white/30 uppercase tracking-wider hidden sm:block">
              {activeConversation ? `${activeConversation.messages.length} messages` : 'Ready'}
            </span>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <WelcomeScreen />
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
                placeholder="Message Neo AI..."
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
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isTyping}
                className={`p-2.5 rounded-xl transition-all duration-200 flex-shrink-0 ${
                  inputValue.trim() && !isTyping
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
              Neo AI can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
