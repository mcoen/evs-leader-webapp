
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { EVSTask, KPIData } from '../types';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle,
  Zap,
  Clock,
  HelpCircle,
  Lightbulb,
  Info,
  // Added missing Shield icon import
  Shield
} from 'lucide-react';

interface AIHelpProps {
  tasks: EVSTask[];
  outcomes: KPIData[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIHelp: React.FC<AIHelpProps> = ({ tasks, outcomes }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() || isTyping) return;

    const userMsg = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Prepare context summary for the LLM
      const contextSummary = {
        totalTasks: tasks.length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        completed: tasks.filter(t => t.status === 'Complete').length,
        overdue: tasks.filter(t => t.status === 'In Progress' && t.startTime && (new Date().getTime() - new Date(t.startTime).getTime()) / 60000 > t.expectedDuration).length,
        topKpis: outcomes.slice(0, 5).map(o => `${o.label}: ${o.value}${o.unit || ''}`),
        currentDate: new Date().toLocaleDateString(),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
      };

      const systemInstruction = `You are the Service IQ Operational Assistant for a hospital system. 
      You are here to help leaders understand the platform and their facility's performance.
      Context: ${JSON.stringify(contextSummary)}.
      Be concise, helpful, and professional. 
      If a user asks about future dates like "next Tuesday", look at current task volume of ${contextSummary.totalTasks} and note that usually, a similar facility handles 130-150 tasks on a standard Tuesday. 
      Provide specific estimates when possible based on the provided data.
      Use bullet points for readability.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const aiText = response.text || "I'm sorry, I couldn't process that query right now. Please try rephrasing.";
      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
    } catch (error) {
      console.error("AI Help Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error connecting to the Service IQ intelligence core. Please ensure your project is properly configured." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestedQuestions = [
    "What does our workload look like for next Tuesday?",
    "How can I improve room turnover efficiency?",
    "Summarize current P1 alerts from ServiceNow.",
    "Show me the trend for supply savings this quarter."
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <HelpCircle className="text-blue-600" size={36} /> AI Help
          </h1>
          <p className="text-slate-800 dark:text-gray-400 font-bold mt-1">Operational support and forecasts at your fingertips.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Stats & Suggestions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Lightbulb size={16} className="text-amber-500" /> Suggested Queries
            </h3>
            <div className="space-y-3">
              {suggestedQuestions.map((q, i) => (
                <button 
                  key={i}
                  onClick={() => { setQuery(q); }}
                  className="w-full text-left p-4 text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-600 hover:text-white rounded-2xl transition-all border border-transparent shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-blue-600/40 transition-colors"></div>
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <Info size={16} className="text-blue-400" /> Platform Knowledge
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Contextual Awareness</p>
                <p className="text-xs font-bold leading-relaxed">I am aware of your {tasks.length} active/recent tasks and system KPIs. Ask me for summaries or predictions.</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Model Version</p>
                <p className="text-xs font-bold leading-relaxed">Gemini 3 Flash Operational Preview v1.4</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Chat Interface */}
        <div className="lg:col-span-8 flex flex-col h-[750px] bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
          {/* Chat Theater */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-10 space-y-8 bg-slate-50/30 dark:bg-slate-900/50 custom-scrollbar"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 px-16">
                <div className="p-8 bg-blue-600 text-white rounded-[32px] shadow-2xl shadow-blue-500/30">
                  <Bot size={64} />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white">What can I help you find?</h2>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 max-w-md">I have access to your facility's operational data. Ask me for status updates, predictions, or help navigating Service IQ.</p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-in slide-in-from-bottom-2`}>
                <div className={`shrink-0 w-12 h-12 rounded-[20px] flex items-center justify-center shadow-md ${
                  msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {msg.role === 'user' ? <User size={24} /> : <Bot size={24} />}
                </div>
                <div className={`max-w-[85%] p-6 rounded-[32px] text-sm font-bold leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-6 animate-pulse">
                <div className="shrink-0 w-12 h-12 rounded-[20px] bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <Loader2 size={24} className="animate-spin text-blue-600" />
                </div>
                <div className="p-6 rounded-[32px] bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 font-black text-sm italic rounded-tl-none">
                  Consulting operations core...
                </div>
              </div>
            )}
          </div>

          {/* Input Console */}
          <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <form onSubmit={handleQuery} className="flex gap-4 bg-slate-100 dark:bg-slate-800 p-3 rounded-[24px] border-2 border-transparent focus-within:border-blue-600 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all shadow-inner">
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask a question about your facility workload..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-black px-4 py-2 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <button 
                type="submit"
                disabled={!query.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-xs flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} /> Send
              </button>
            </form>
            <div className="flex justify-center gap-6 mt-4">
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
                 <Shield size={10} /> Data Secure
               </p>
               <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1">
                 <Clock size={10} /> Real-time Sync
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
