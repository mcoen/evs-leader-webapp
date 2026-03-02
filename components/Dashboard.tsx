
import React from 'react';
import { KPIData, DateFilter, EVSTask } from '../types';
import { Sparkline } from './Sparkline';
import { FACILITIES, DEPARTMENTS } from '../constants';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Zap,
  ShieldCheck,
  Stethoscope,
  BarChart3,
  Building2,
  Users,
  DollarSign,
  ArrowRight,
  Crosshair,
  Truck
} from 'lucide-react';

interface DashboardProps {
  outcomes: KPIData[];
  tasks: EVSTask[];
  selectedFacility: string;
  setSelectedFacility: (f: string) => void;
  selectedDepartment: string;
  setSelectedDepartment: (d: string) => void;
  filter: DateFilter;
  setFilter: (f: DateFilter) => void;
  onKpiClick: (kpiId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  outcomes, 
  tasks, 
  selectedFacility,
  setSelectedFacility,
  selectedDepartment,
  setSelectedDepartment,
  filter,
  setFilter,
  onKpiClick
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Financial': return <DollarSign className="text-emerald-600 dark:text-emerald-400" size={20}/>;
      case 'Speed': return <Zap className="text-amber-600 dark:text-yellow-400" size={20}/>;
      case 'Efficiency': return <BarChart3 className="text-blue-700 dark:text-blue-400" size={20}/>;
      case 'Quality': return <ShieldCheck className="text-green-700 dark:text-green-400" size={20}/>;
      case 'Strategic': return <Crosshair className="text-purple-700 dark:text-purple-400" size={20}/>;
      case 'Workforce': return <Users className="text-orange-700 dark:text-orange-400" size={20}/>;
      case 'Transport': return <Truck className="text-indigo-600 dark:text-indigo-400" size={20}/>;
      default: return null;
    }
  };

  const getLoadBalancingColor = (value: number) => {
    if (value < 60) return 'text-red-800 bg-red-100 dark:bg-red-900/40';
    if (value < 80) return 'text-amber-900 bg-amber-100 dark:bg-amber-900/40';
    return 'text-green-900 bg-green-100 dark:bg-green-900/40';
  };

  const dateOptions = [
    { value: '12h', label: 'Last 12 Hours' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last Quarter' },
    { value: 'year', label: 'Current Calendar Year' },
  ];

  const financialOutcomes = outcomes.filter(m => m.category === 'Financial');

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="sticky top-0 z-30 -mx-4 md:-mx-8 bg-slate-50 dark:bg-slate-950 py-6 px-4 md:px-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Executive Dashboard</h1>
            <p className="text-slate-800 dark:text-gray-300 text-xs font-black tracking-widest uppercase">System-wide operational outcomes.</p>
          </div>
          
          <div className="flex flex-nowrap items-center gap-3 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
            <div className="flex-none flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <Building2 size={18} className="text-slate-700 dark:text-gray-400" />
              <select 
                value={selectedFacility}
                onChange={(e) => setSelectedFacility(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-black text-slate-900 dark:text-white pr-6 cursor-pointer uppercase tracking-tight"
              >
                {FACILITIES.map(f => <option key={f} value={f} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{f}</option>)}
              </select>
            </div>

            <div className="flex-none flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <Users size={18} className="text-slate-700 dark:text-gray-400" />
              <select 
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="bg-transparent border-none outline-none text-xs font-black text-slate-900 dark:text-white pr-6 cursor-pointer uppercase tracking-tight"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{d}</option>)}
              </select>
            </div>

            <div className="flex-none flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <Calendar size={18} className="text-slate-700 dark:text-gray-400" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value as DateFilter)}
                className="bg-transparent border-none outline-none text-xs font-black text-slate-900 dark:text-white pr-6 cursor-pointer uppercase tracking-tight"
              >
                {dateOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{opt.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        {/* Financial Outcomes Section */}
        <section className="space-y-4">
          <h2 className="text-base font-black flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-widest">
            <DollarSign size={20} className="text-emerald-600 dark:text-emerald-400"/> Financial Outcomes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {financialOutcomes.map((outcome) => (
              <button 
                key={outcome.id}
                onClick={() => onKpiClick(outcome.id)}
                className="text-left bg-white dark:bg-slate-900 px-4 py-3 flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-0">
                  <div className="space-y-0">
                    <h3 className="text-slate-500 dark:text-gray-400 text-[10px] font-black leading-tight uppercase tracking-widest">{outcome.label}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">${outcome.value}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full ${
                    outcome.trend > 0 ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                  }`}>
                    {outcome.trend > 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                    {Math.abs(outcome.trend)}%
                  </div>
                </div>
                
                <div className="h-5 mb-0">
                  <Sparkline data={outcome.sparkline} color={outcome.id.includes('save') ? '#10b981' : '#3b82f6'} />
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-0.5 mt-0">
                  <p 
                    className="text-[10px] text-slate-600 dark:text-gray-400 uppercase font-bold leading-tight flex-1"
                  >
                    {outcome.description}
                  </p>
                  <ArrowRight size={14} className="text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-1" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Outcome Grid grouped by category - 'Strategic' removed as requested */}
        {['Speed', 'Efficiency', 'Workforce', 'Quality'].map((cat) => (
          <section key={cat} className="space-y-4">
            <h2 className="text-base font-black flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-widest">
              {getCategoryIcon(cat)} {cat === 'Quality' ? 'Quality & Safety' : cat} Outcomes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {outcomes.filter(m => m.category === cat).map((outcome) => (
                <button 
                  key={outcome.id}
                  onClick={() => onKpiClick(outcome.id)}
                  className="text-left bg-white dark:bg-slate-900 px-4 py-3 flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:scale-[1.01] transition-all group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-0">
                    <div className="space-y-0">
                      <h3 className="text-slate-500 dark:text-gray-400 text-[10px] font-black leading-tight uppercase tracking-widest">{outcome.label}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-black text-slate-900 dark:text-white tracking-tighter ${outcome.id === 'k_lb' ? getLoadBalancingColor(Number(outcome.value.toString().replace(/,/g, ''))).split(' ')[0] : ''}`}>
                          {outcome.value}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-gray-500 font-bold">{outcome.unit}</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full ${
                      outcome.trend > 0 ? 'bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-300'
                    }`}>
                      {outcome.trend > 0 ? <TrendingUp size={14}/> : <TrendingDown size={14}/>}
                      {Math.abs(outcome.trend)}%
                    </div>
                  </div>
                  
                  <div className="h-5 mb-0">
                    <Sparkline data={outcome.sparkline} color={outcome.id === 'k_lb' ? (Number(outcome.value.toString().replace(/,/g, '')) < 60 ? '#b91c1c' : Number(outcome.value.toString().replace(/,/g, '')) < 80 ? '#d97706' : '#15803d') : '#1d4ed8'} />
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-0.5 mt-0">
                    <p 
                      className="text-[10px] text-slate-600 dark:text-gray-400 uppercase font-bold leading-tight flex-1"
                    >
                      {outcome.description}
                    </p>
                    <ArrowRight size={14} className="text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-1" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};
