
import React from 'react';
import { FacilityZoneCoverage } from '../types';
import { Sparkline } from './Sparkline';
import { ArrowLeft, Building2, ArrowRight, ShieldCheck, AlertTriangle, TrendingUp } from 'lucide-react';

interface ZoneCoverageDrilldownProps {
  coverageData: FacilityZoneCoverage[];
  onBack: () => void;
  onFacilityClick: (facility: FacilityZoneCoverage) => void;
}

export const ZoneCoverageDrilldown: React.FC<ZoneCoverageDrilldownProps> = ({ coverageData, onBack, onFacilityClick }) => {
  const getHealthColor = (health: number) => {
    if (health >= 90) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20';
    if (health >= 80) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (health >= 70) return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  const getSparklineColor = (health: number) => {
    if (health >= 90) return '#10b981';
    if (health >= 80) return '#3b82f6';
    if (health >= 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="pt-4 md:pt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg transition-all active:scale-95">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tighter leading-none">
            Facility Zone Health
          </h1>
          <p className="text-[10px] text-slate-500 font-black mt-2 uppercase tracking-widest">Network-wide Coverage Performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {coverageData.map((data) => (
          <button
            key={data.facility}
            onClick={() => onFacilityClick(data)}
            className="text-left bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl hover:scale-[1.02] transition-all group overflow-hidden relative"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-blue-600 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Building2 size={28} />
              </div>
              <div className="text-right">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getHealthColor(data.overallHealth)} shadow-sm`}>
                  {data.overallHealth}% Health
                </span>
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors uppercase leading-tight mb-4">
              {data.facility}
            </h3>

            {/* 90-Day History Graph */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                   <TrendingUp size={12} className="text-blue-500" /> 90d Coverage Index
                </p>
                <span className="text-[9px] font-black text-slate-400 uppercase">Avg: {Math.round(data.history90d.reduce((a, b) => a + b, 0) / 90)}%</span>
              </div>
              <div className="h-12 w-full bg-slate-50 dark:bg-white/5 rounded-2xl px-2 py-1 overflow-hidden shadow-inner border border-slate-100 dark:border-white/5">
                <Sparkline data={data.history90d} color={getSparklineColor(data.overallHealth)} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-2">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800" />
                   ))}
                </div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{data.zones.length} Managed Zones</p>
              </div>
              <ArrowRight size={20} className="text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
