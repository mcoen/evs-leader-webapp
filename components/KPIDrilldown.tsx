
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { KPIData, EVSTask } from '../types';
import { FACILITIES } from '../constants';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  MapPin, 
  Clock, 
  ArrowRight,
  Building2,
  BarChart3,
  Zap,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  BrainCircuit,
  Target,
  History,
  Activity,
  UserX,
  Scale,
  Users,
  CalendarDays,
  UserMinus
} from 'lucide-react';
import { 
  AreaChart,
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend
} from 'recharts';

interface KPIDrilldownProps {
  kpi: KPIData;
  tasks: EVSTask[];
  onBack: () => void;
  onViewTask: (id: string) => void;
}

export const KPIDrilldown: React.FC<KPIDrilldownProps> = ({ kpi, tasks, onBack, onViewTask }) => {
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 320 });

  // Robust Resize Observer ensures charts render even when ResponsiveContainer fails in ESM environments
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width } = entries[0].contentRect;
      if (width > 0) {
        setDimensions({ width, height: 320 });
      }
    });

    resizeObserver.observe(containerRef.current);
    
    // Initial measurement
    const initialWidth = containerRef.current.offsetWidth;
    if (initialWidth > 0) {
      setDimensions({ width: initialWidth, height: 320 });
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Calculate a dynamic target benchmark (Lower is better for Speed/Financial/Turnover)
  const benchmark = useMemo(() => {
    const dataPoints = kpi.sparkline || [];
    if (dataPoints.length === 0) return 0;
    const avg = dataPoints.reduce((a, b) => a + b, 0) / dataPoints.length;
    const isLowerBetter = (kpi.category === 'Financial' || kpi.category === 'Speed' || kpi.id === 'k_turnover');
    return isLowerBetter ? avg * 0.85 : avg * 1.15;
  }, [kpi]);

  // Map data for the charting engine
  const chartData = useMemo(() => {
    const dataPoints = kpi.sparkline || [];
    return dataPoints.map((val, i) => {
      let label = '';
      if (i === dataPoints.length - 1) label = 'Now';
      else {
        const monthsAgo = dataPoints.length - 1 - i;
        label = kpi.id === 'k_turnover' ? `${monthsAgo}m` : `${monthsAgo}h`;
      }
      return {
        name: label,
        actual: val,
        target: benchmark
      };
    });
  }, [kpi, benchmark]);

  // Retention and Risk specific correlated items
  const retentionAnomalies = [
    { id: 'R1', label: 'Burnout Risk: ICU North', sub: 'Personnel Avg Workload > 135% for 4 consecutive weeks.', icon: <UserX />, color: 'text-red-600 bg-red-50' },
    { id: 'R2', label: 'Local Market Wage Gap', sub: 'Competitor entry rates are +$1.25/hr above facility EVS baseline.', icon: <Scale />, color: 'text-amber-600 bg-amber-50' },
    { id: 'R3', label: 'Onboarding Lag', sub: 'New hires (30-day cohort) report 42% lower satisfaction in mentorship.', icon: <Users />, color: 'text-blue-600 bg-blue-50' },
    { id: 'R4', label: 'Exit Trend: Night Shift', sub: 'Departure rate is 3x higher in night shift transport dept.', icon: <Clock />, color: 'text-red-600 bg-red-50' }
  ];

  const anomalies = useMemo(() => {
    if (kpi.id === 'k_turnover') return [];
    
    const numericKpiValue = Number(kpi.value.toString().replace(/,/g, ''));
    return tasks.filter(t => {
      if (kpi.id === 'k1') return t.status === 'Complete' && t.startTime && t.endTime && (new Date(t.endTime).getTime() - new Date(t.startTime).getTime()) / 60000 > numericKpiValue;
      if (kpi.id === 'k2') return t.status === 'In Progress' && t.startTime && (new Date().getTime() - new Date(t.startTime).getTime()) / 60000 > 15;
      return t.priority === 'High' && Math.random() > 0.8;
    }).slice(0, 5);
  }, [kpi, tasks]);

  useEffect(() => {
    const generateAiInsight = async () => {
      setIsLoadingAi(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let prompt = `Analyze this Hospital KPI: ${kpi.label}. Current: ${kpi.value}${kpi.unit || ''}. Target: ${benchmark.toFixed(1)}. Provide 3 bullet point strategies for optimization.`;
        
        if (kpi.id === 'k_turnover') {
          prompt = `Analyze Staffing Turnover Rate of ${kpi.value}%. Target is ${benchmark.toFixed(1)}%. Note that 42% of departures occur within the first year of employment. Identify potential causes (mentorship, onboarding fatigue) and suggest 3 high-impact retention strategies for a Hospital EVS/Facilities Leader specifically targeting the first-year cohort.`;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: { systemInstruction: "You are an elite hospital operations officer with expertise in workforce management and retention.", temperature: 0.5 },
        });
        setAiSuggestions(response.text || "Insight engine returned empty response.");
      } catch (e) {
        setAiSuggestions("Live AI advice currently unavailable. Check system connectivity.");
      } finally {
        setIsLoadingAi(false);
      }
    };
    generateAiInsight();
  }, [kpi.id, benchmark]);

  const isPerformingPoorly = useMemo(() => {
    const isLowerBetter = (kpi.category === 'Financial' || kpi.category === 'Speed' || kpi.id === 'k_turnover');
    const val = Number(kpi.value.toString().replace(/,/g, ''));
    return isLowerBetter ? val > benchmark : val < benchmark;
  }, [kpi, benchmark]);

  const yAxisFormatter = (value: any) => {
    if (kpi.unit === '$') return `$${value}`;
    if (kpi.unit === '%') return `${value}%`;
    return value;
  };

  return (
    <div className="pt-4 md:pt-8 space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg transition-all active:scale-95">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tighter leading-none">
              {kpi.label} <span className="text-blue-600">Audit</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-black mt-1 uppercase tracking-widest">Operational Intelligence & Variance Report</p>
          </div>
        </div>
        <div className={`px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-sm ${kpi.trend > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {kpi.trend > 0 ? <TrendingUp size={14} className="inline mr-1" /> : <TrendingDown size={14} className="inline mr-1" />}
          {Math.abs(kpi.trend)}% Drift Detected
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph & Audit Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Turnover Specific High-Impact Stat: First-Year Ratio */}
          {kpi.id === 'k_turnover' && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-8 animate-in slide-in-from-top-4 duration-500">
               <div className="relative shrink-0">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 * (1 - 0.42)} className="text-red-500" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-slate-900 dark:text-white">42%</span>
                  </div>
               </div>
               <div className="flex-1 space-y-2 text-center md:text-left">
                  <h3 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-tighter flex items-center justify-center md:justify-start gap-2">
                    <UserMinus size={20} className="text-red-500" /> Early Tenure Attrition
                  </h3>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                    <strong className="text-red-600">42% of all staff departures</strong> occur within the <strong className="text-slate-900 dark:text-slate-100">first 12 months</strong> of employment. This indicates a critical need to evaluate mentorship and the 90-day "sink or swim" threshold in EVS departments.
                  </p>
               </div>
               <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700 flex flex-col items-center gap-1 min-w-[120px]">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ratio</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">5 : 12</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase">Leavers:Tenure</p>
               </div>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="space-y-1">
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Activity size={12} className="text-blue-600" /> Operational History
                </h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {kpi.unit === '$' ? '$' : ''}{kpi.value}{kpi.unit !== '$' && kpi.unit !== '%' ? ` ${kpi.unit}` : kpi.unit === '%' ? '%' : ''}
                  </p>
                  <span className="text-[9px] font-black text-slate-400 uppercase">Actual Value</span>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <p className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1.5">
                  <Target size={12} className="text-emerald-500" /> Benchmark Target
                </p>
                <p className="text-xl font-black text-slate-600 dark:text-slate-400">
                  {kpi.unit === '$' ? '$' : ''}{benchmark.toFixed(1)}{kpi.unit !== '$' && kpi.unit !== '%' ? ` ${kpi.unit}` : kpi.unit === '%' ? '%' : ''}
                </p>
              </div>
            </div>

            {/* Robust Chart Container - Increased height and width handling */}
            <div ref={containerRef} className="w-full h-[320px] flex items-center justify-center bg-slate-50/50 dark:bg-slate-800/20 rounded-[32px] overflow-visible relative border border-slate-100 dark:border-slate-800 p-4">
              {dimensions.width > 0 && (
                <AreaChart
                  width={dimensions.width - 32} // Account for padding
                  height={dimensions.height - 32}
                  data={chartData}
                  margin={{ top: 20, right: 40, left: 45, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id={`grad-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                    padding={{ left: 20, right: 20 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                    tickFormatter={yAxisFormatter}
                    width={45}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff', fontSize: '11px', fontWeight: 900 }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', paddingBottom: '20px' }} />
                  <Area 
                    name="Actual Performance"
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#2563eb" 
                    strokeWidth={4} 
                    fill={`url(#grad-${kpi.id})`}
                    isAnimationActive={false}
                  />
                  <Area
                    name="Target Benchmark"
                    type="monotone"
                    dataKey="target"
                    stroke="#10b981"
                    strokeWidth={3}
                    strokeDasharray="6 6"
                    fill="transparent"
                    isAnimationActive={false}
                  />
                </AreaChart>
              )}
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800 flex items-start gap-4">
               <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shrink-0">
                  <History size={18} />
               </div>
               <div>
                  <h4 className="font-black text-slate-900 dark:text-white uppercase text-[9px] tracking-widest mb-1">Variance Analysis</h4>
                  <p className="text-xs font-bold text-slate-500 leading-relaxed">
                    Comparison analysis for <strong>{kpi.label}</strong> identifies a current variance of <strong>{Math.abs(Number(kpi.value.toString().replace(/,/g, '')) - benchmark).toFixed(1)}</strong> from target benchmark.
                  </p>
               </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-950 dark:text-white flex items-center gap-3">
                <AlertTriangle size={24} className="text-amber-500" /> {kpi.id === 'k_turnover' ? 'Risk Indicators' : 'Correlated Events'}
              </h3>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{kpi.id === 'k_turnover' ? 'Retention Audit' : 'Root Cause Audit'}</span>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {kpi.id === 'k_turnover' ? (
                retentionAnomalies.map(risk => (
                  <div key={risk.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${risk.color}`}>
                        {risk.icon}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white group-hover:text-blue-600">{risk.label}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">{risk.sub}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                anomalies.map(task => (
                  <div key={task.id} onClick={() => onViewTask(task.id)} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                        <AlertCircle size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white group-hover:text-blue-600">Room {task.roomNumber}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{task.category} • {task.facility}</p>
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Intelligence Panel */}
        <div className="space-y-6">
          {/* AI Roadmap Panel - Consistently Blue for Brand Recognition in all modes */}
          <div className="p-8 rounded-[40px] shadow-xl relative overflow-hidden transition-all duration-700 bg-blue-600 text-white">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[60px]"></div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
               <div className="p-3 rounded-xl bg-white/20">
                  <BrainCircuit size={28} className="text-white" />
               </div>
               <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter leading-none">AI Roadmap</h3>
                  <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-70">Strategic Guidance</p>
               </div>
            </div>
            
            <div className="relative z-10">
              {isLoadingAi ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                   <Loader2 size={32} className="animate-spin text-white/50" />
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] animate-pulse">Computing Strategy...</p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-4 duration-1000">
                  <div className="prose prose-sm prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-sm font-bold leading-relaxed text-white/95">
                      {aiSuggestions}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Snapshot Panel */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-3 text-slate-900 dark:text-white">
              <Zap size={18} className="text-blue-600" /> Stats Snapshot
            </h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Samples</span>
                  <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">{kpi.id === 'k_turnover' ? 'Annualized' : tasks.length}</span>
               </div>
               {kpi.id === 'k_turnover' && (
                 <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20">
                    <span className="text-[9px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">1-Year Attrition</span>
                    <span className="text-xl font-black tracking-tighter text-red-700 dark:text-red-300">42.0%</span>
                 </div>
               )}
               <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Net Variance</span>
                  <span className={`text-xl font-black tracking-tighter ${isPerformingPoorly ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {Math.abs(Number(kpi.value.toString().replace(/,/g, '')) - benchmark).toFixed(1)}{kpi.unit}
                  </span>
               </div>
               <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Performance</span>
                  <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-full ${isPerformingPoorly ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400'}`}>
                    {isPerformingPoorly ? 'Drifting' : 'Optimal'}
                  </span>
               </div>
            </div>
          </div>

          {/* Retention Milestone Tip (Only for Turnover) */}
          {kpi.id === 'k_turnover' && (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                 <CalendarDays size={14} className="text-blue-600" /> Retention Benchmarks
               </h4>
               <div className="space-y-4">
                  {[
                    { label: 'Day 30', value: 92, target: 95 },
                    { label: 'Day 90', value: 78, target: 85 },
                    { label: 'Day 365', value: 58, target: 75 }
                  ].map(milestone => (
                    <div key={milestone.label} className="space-y-1.5">
                       <div className="flex justify-between text-[10px] font-black uppercase">
                          <span className="text-slate-500">{milestone.label} Survival</span>
                          <span className={milestone.value < milestone.target ? 'text-red-600' : 'text-emerald-600'}>{milestone.value}%</span>
                       </div>
                       <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${milestone.value < milestone.target ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${milestone.value}%` }}
                          />
                       </div>
                    </div>
                  ))}
               </div>
               <p className="text-[9px] font-bold text-slate-400 leading-relaxed mt-4 italic">
                 "Critical dropout identified at Day 90. Evaluation of training-to-floor transition is recommended."
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
