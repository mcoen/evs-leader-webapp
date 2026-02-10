import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Minus } from 'lucide-react';

interface ChatWindowProps {
  recipient: string | null;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: Date;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ recipient, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (recipient) {
      setIsOpen(true);
      setIsMinimized(false);
      // Mock initial message
      setMessages([
        {
          id: '1',
          text: `Direct line to ${recipient}. Please state your request.`,
          sender: 'them',
          timestamp: new Date()
        }
      ]);
    } else {
      setIsOpen(false);
    }
  }, [recipient]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isMinimized]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'me',
      timestamp: new Date()
    };
    
    setMessages([...messages, newMsg]);
    setInputText('');

    // Simulate response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "Understood. Proceeding with the update now.",
        sender: 'them',
        timestamp: new Date()
      }]);
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-6 right-6 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 z-[9999] flex flex-col ${isMinimized ? 'h-14' : 'h-[450px]'}`}>
      {/* Header */}
      <div className="bg-blue-600 dark:bg-blue-700 p-3 flex items-center justify-between text-white shrink-0 cursor-pointer" onClick={() => isMinimized && setIsMinimized(false)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
            {recipient ? recipient.split(' ').map(n => n[0]).join('') : '??'}
          </div>
          <div>
            <p className="text-sm font-black truncate max-w-[140px]">{recipient}</p>
            {!isMinimized && <p className="text-[10px] font-bold opacity-75">Active Now</p>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Minus size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50"
          >
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${
                  msg.sender === 'me' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-100 dark:border-slate-700'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[9px] font-black text-slate-400 mt-1 uppercase">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a command..." 
                className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-slate-900 dark:text-white px-2"
              />
              <button 
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};