
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { EVSTask, KPIData } from '../types';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Zap,
  Info,
  HelpCircle,
  Lightbulb,
  Shield,
  Clock,
  History
} from 'lucide-react';

interface AIHelperProps {
  tasks: EVSTask[];
  outcomes: KPIData[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIHelper: React.FC<AIHelperProps> = ({ tasks, outcomes }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastQueries, setLastQueries] = useState<string[]>(() => {
    const saved = localStorage.getItem('siq_last_queries');
    return saved ? JSON.parse(saved) : [];
  });
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    localStorage.setItem('siq_last_queries', JSON.stringify(lastQueries));
  }, [lastQueries]);

  const handleQuery = async (e?: React.FormEvent, directQuery?: string) => {
    if (e) e.preventDefault();
    const activeQuery = directQuery || query;
    if (!activeQuery.trim() || isTyping) return;

    const userMsg = activeQuery;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    // Update last 5 queries (unique)
    setLastQueries(prev => {
      const filtered = prev.filter(q => q !== userMsg);
      return [userMsg, ...filtered].slice(0, 5);
    });
    
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const contextSummary = {
        totalTasks: tasks.length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        completed: tasks.filter(t => t.status === 'Complete').length,
        overdue: tasks.filter(t => t.status === 'In Progress' && t.startTime && (new Date().getTime() - new Date(t.startTime).getTime()) / 60000 > t.expectedDuration).length,
        topKpis: outcomes.slice(0, 5).map(o => `${o.label}: ${o.value}${o.unit || ''}`),
        currentDate: new Date().toLocaleDateString(),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
      };

      const systemInstruction = `You are the AI Helper for Service IQ. 
      You help hospital EVS leaders understand their workload and platform data.
      Context: ${JSON.stringify(contextSummary)}.
      Be concise, helpful, and professional. 
      If asked about future workload (e.g., "next Tuesday"), use the current volume of ${contextSummary.totalTasks} to estimate that a standard Tuesday typically sees about 130-150 tasks at HCA Florida Mercy Hospital.
      Always answer based on the real data provided in context when possible.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const aiText = response.text || "I'm sorry, I couldn't process that query right now.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
    } catch (error) {
      console.error("AI Helper Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error. Please ensure your API key is properly configured." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestedQuestions = [
    "What does our workload look like for next Tuesday?",
    "Which department has the most overdue tasks?",
    "Summarize the performance of the Houston facilities.",
    "How can I reduce dead bed costs today?"
  ];

  return (
    <div className="pt-4 md:pt-6 w-full flex flex-col h-[calc(100vh-7rem)] space-y-4 animate-in fade-in duration-700 overflow-hidden">
      <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <HelpCircle className="text-blue-600" size={32} /> AI Helper
          </h1>
          <p className="text-slate-800 dark:text-gray-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Powered by Service IQ Intelligence Engine</p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
        {/* Left Sidebar: Controls & History */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
          
          {/* Suggested Queries */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 shrink-0">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Lightbulb size={14} className="text-amber-500" /> Suggested Queries
            </h3>
            <div className="space-y-2">
              {suggestedQuestions.map((q, i) => (
                <button 
                  key={i}
                  onClick={() => handleQuery(undefined, q)}
                  className="w-full text-left p-3 text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-600 hover:text-white rounded-2xl transition-all border border-transparent shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Persistent History (My Last 5 Queries) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 shrink-0">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <History size={14} className="text-blue-600" /> My Last 5 Queries
            </h3>
            <div className="space-y-2">
              {lastQueries.length > 0 ? (
                lastQueries.map((q, i) => (
                  <button 
                    key={i}
                    onClick={() => handleQuery(undefined, q)}
                    className="w-full text-left p-2.5 text-[10px] font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all border border-transparent line-clamp-1"
                    title={q}
                  >
                    {q}
                  </button>
                ))
              ) : (
                <p className="text-[10px] text-slate-400 font-bold italic py-1">No recent queries found.</p>
              )}
            </div>
          </div>

          {/* Context Banner */}
          <div className="bg-slate-900 p-6 rounded-[32px] text-white space-y-4 shadow-xl relative overflow-hidden group shrink-0">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-blue-600/40 transition-colors"></div>
            <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Info size={14} className="text-blue-400" /> Active Grounding
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[9px] font-black text-blue-400 uppercase mb-0.5">Operational State</p>
                <p className="text-xs font-bold">{tasks.length} Hospital Data Points</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="text-[9px] font-black text-blue-400 uppercase mb-0.5">Last Sync</p>
                <p className="text-xs font-bold leading-relaxed">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Theater: Chat Interface */}
        <div className="lg:col-span-8 flex flex-col h-full bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden min-h-0">
          {/* Scrollable Chat Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 bg-slate-50/30 dark:bg-slate-900/50 custom-scrollbar"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 px-4 md:px-16">
                <div className="p-8 bg-blue-600 text-white rounded-[40px] shadow-2xl shadow-blue-500/30">
                  <Bot size={48} />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">How can I help you today?</h2>
                  <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">I am your Service IQ operational assistant. I can analyze staff efficiency, predict workload, and answer platform questions.</p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 md:gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2`}>
                <div className={`shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-[20px] flex items-center justify-center shadow-md ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`max-w-[85%] p-4 md:p-6 rounded-[28px] text-xs md:text-sm font-bold leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4 md:gap-6 animate-pulse">
                <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-[20px] bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <Loader2 size={20} className="animate-spin text-blue-600" />
                </div>
                <div className="p-4 md:p-6 rounded-[28px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-400 font-black text-xs md:text-sm italic rounded-tl-none">
                  Consulting operations core...
                </div>
              </div>
            )}
          </div>

          {/* Fixed Bottom Input Bar */}
          <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
            <form onSubmit={handleQuery} className="flex gap-3 bg-slate-100 dark:bg-slate-800 p-2 rounded-[24px] border-2 border-transparent focus-within:border-blue-600 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all shadow-inner">
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your question here..."
                className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm font-black px-4 py-2 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <button 
                type="submit"
                disabled={!query.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 md:px-8 py-3 md:py-4 rounded-[18px] font-black text-[10px] md:text-xs flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} /> SEND
              </button>
            </form>
            <div className="flex justify-center gap-4 md:gap-8 mt-4">
               <div className="flex items-center gap-1 text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-widest">
                 <Shield size={10} className="text-green-500" /> Secure Data Access
               </div>
               <div className="flex items-center gap-1 text-[8px] md:text-[9px] text-slate-400 font-black uppercase tracking-widest">
                 <Clock size={10} className="text-blue-500" /> Real-time Ops Context
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
