import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
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
  Clock
} from 'lucide-react';

interface AIInsightsProps {
  tasks: EVSTask[];
  outcomes: KPIData[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ tasks, outcomes }) => {
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
        overdue: tasks.filter(t => t.status === 'In Progress' && (new Date().getTime() - new Date(t.startTime!).getTime()) / 60000 > t.expectedDuration).length,
        topKpis: outcomes.slice(0, 5).map(o => `${o.label}: ${o.value}${o.unit || ''}`),
        currentDate: new Date().toLocaleDateString(),
        dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
      };

      const systemInstruction = `You are the Service IQ Operational Assistant for a hospital system. 
      You have access to real-time operations data. 
      Context: ${JSON.stringify(contextSummary)}.
      Be concise, professional, and data-driven. 
      If a user asks about future dates like "next Tuesday", use operational trends (e.g., normally 130-150 tasks) or simulate a realistic estimate based on the current volume of ${contextSummary.totalTasks} total tasks across the history.
      Answer the following user query based on this data.`;

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
      console.error("AI Insights Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I encountered an error while connecting to the intelligence engine. Please ensure your API key is valid." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestedQuestions = [
    "What does our workload look like for next Tuesday?",
    "Which department has the highest turnaround delay?",
    "Summarize the current operational efficiency.",
    "Predict staffing needs for the upcoming weekend."
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <Sparkles className="text-blue-600 fill-blue-600" size={32} /> AI Insights
          </h1>
          <p className="text-slate-800 dark:text-gray-400 font-bold mt-1">Operational intelligence powered by Gemini.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Suggested & Context */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-amber-500" /> Suggested
            </h3>
            <div className="space-y-2">
              {suggestedQuestions.map((q, i) => (
                <button 
                  key={i}
                  onClick={() => { setQuery(q); }}
                  className="w-full text-left p-3 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all border border-transparent hover:border-blue-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 p-6 rounded-[32px] text-white space-y-4 shadow-xl shadow-blue-500/20">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={14} /> Intelligence Context
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="opacity-70">Total Records</span>
                <span>{tasks.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="opacity-70">KPI Vectors</span>
                <span>{outcomes.length}</span>
              </div>
              <div className="pt-2 border-t border-white/20">
                <p className="text-[10px] leading-relaxed opacity-80 font-medium">
                  Model: Gemini 3 Flash<br/>
                  Latency: Real-time Sync<br/>
                  Grounding: Internal Ops Data
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="lg:col-span-3 flex flex-col h-[700px] bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 dark:bg-slate-900/50 custom-scrollbar"
          >
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-12">
                <div className="p-6 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Bot size={48} className="text-blue-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">How can I help you lead?</h2>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Ask about throughput, staff efficiency, or operational forecasts.</p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`max-w-[80%] p-5 rounded-3xl text-sm font-bold leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-4">
                <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <Loader2 size={20} className="animate-spin text-blue-600" />
                </div>
                <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 font-bold text-sm italic rounded-tl-none">
                  Analyzing operations data...
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <form onSubmit={handleQuery} className="flex gap-3 bg-slate-100 dark:bg-slate-800 p-2 rounded-2xl border-2 border-transparent focus-within:border-blue-600 transition-all">
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask Service IQ anything..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-black px-4 py-2 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <button 
                type="submit"
                disabled={!query.trim() || isTyping}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} /> Send
              </button>
            </form>
            <p className="text-[10px] text-slate-400 font-black text-center mt-3 uppercase tracking-tighter">
              AI-generated responses may contain inaccuracies. Verify critical data in the dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
