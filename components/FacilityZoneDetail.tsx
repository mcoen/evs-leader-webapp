
import React, { useState } from 'react';
import { FacilityZoneCoverage, ZoneDetail, AssignedStaff } from '../types';
import { Sparkline } from './Sparkline';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Activity, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  MessageSquare,
  User,
  Star,
  CheckCircle2
} from 'lucide-react';

interface FacilityZoneDetailProps {
  data: FacilityZoneCoverage;
  onBack: () => void;
}

export const FacilityZoneDetail: React.FC<FacilityZoneDetailProps> = ({ data, onBack }) => {
  const [selectedZone, setSelectedZone] = useState<ZoneDetail | null>(null);

  const getHealthColor = (health: number) => {
    if (health >= 90) return 'bg-emerald-500';
    if (health >= 80) return 'bg-blue-500';
    if (health >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getHealthTextColor = (health: number) => {
    if (health >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (health >= 80) return 'text-blue-600 dark:text-blue-400';
    if (health >= 70) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getSparklineColor = (health: number) => {
    if (health >= 90) return '#10b981';
    if (health >= 80) return '#3b82f6';
    if (health >= 70) return '#f59e0b';
    return '#ef4444';
  };

  // Internal component for the staff drill-down
  if (selectedZone) {
    return (
      <div className="pt-4 md:pt-8 space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedZone(null)} 
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg transition-all active:scale-95"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tighter leading-none">
                {selectedZone.name} <span className="text-blue-600">Personnel</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-black mt-2 uppercase tracking-widest flex items-center gap-2">
                 <Layers size={12} /> Floor {selectedZone.floor} • {selectedZone.evsCount} Staff Members
              </p>
            </div>
          </div>
          <div className={`p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center gap-4`}>
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Zone Health Score</span>
                <span className={`text-2xl font-black ${getHealthTextColor(selectedZone.health)}`}>{selectedZone.health}%</span>
             </div>
             <div className={`p-3 rounded-2xl ${getHealthColor(selectedZone.health)} bg-opacity-10 text-white`}>
                <ShieldCheck size={24} className={getHealthTextColor(selectedZone.health)} />
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {selectedZone.assignedStaff.map((staff, idx) => (
            <div 
              key={`${staff.name}-${idx}`}
              className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-blue-600/10 transition-colors"></div>
              
              <div className="flex items-center gap-4 relative z-10">
                 <div className="w-16 h-16 rounded-[24px] bg-slate-900 text-white flex items-center justify-center text-xl font-black shadow-2xl">
                    {staff.name.split(' ').map(n => n[0]).join('')}
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-950 dark:text-white leading-tight">{staff.name}</h3>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{staff.role}</p>
                 </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <Clock size={12} className="text-blue-500" /> Current Activity
                   </p>
                   {staff.currentTask ? (
                     <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-100">{staff.currentTask}</span>
                        <span className="flex items-center gap-1 text-[8px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full animate-pulse">
                           Active
                        </span>
                     </div>
                   ) : (
                     <p className="text-xs font-bold text-slate-400 italic">No active task assigned</p>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency</p>
                     <p className="text-lg font-black text-slate-900 dark:text-white">{staff.efficiency}%</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Shift</p>
                     <p className="text-[10px] font-black text-slate-900 dark:text-white leading-tight">Day Shift</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex gap-3 relative z-10">
                 <button className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                    <MessageSquare size={14} /> Message
                 </button>
                 <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 rounded-2xl border border-slate-100 dark:border-slate-700 transition-all">
                    <Star size={16} />
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-4 md:pt-8 space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg transition-all active:scale-95">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tighter leading-none">
            {data.facility} Zones
          </h1>
          <p className="text-[10px] text-slate-500 font-black mt-2 uppercase tracking-widest">Zone Health & EVS Allocation Audit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {data.zones.map((zone) => (
          <button 
            key={zone.id}
            onClick={() => setSelectedZone(zone)}
            className="text-left bg-white dark:bg-slate-900 p-8 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 overflow-hidden relative group hover:scale-[1.02] transition-all"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-10 ${getHealthColor(zone.health)}`}></div>
            
            <div className="flex justify-between items-start">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-slate-400 uppercase text-[9px] font-black tracking-widest">
                  <Layers size={14} /> Floor {zone.floor}
                </div>
                <h3 className="text-2xl font-black text-slate-950 dark:text-white leading-tight uppercase group-hover:text-blue-600 transition-colors">{zone.name}</h3>
              </div>
              <div className={`p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 shadow-inner flex flex-col items-center justify-center min-w-[70px]`}>
                 <span className={`text-2xl font-black ${getHealthTextColor(zone.health)}`}>{zone.health}%</span>
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Health</span>
              </div>
            </div>

            {/* 90-Day Zone Specific History Graph */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                   <TrendingUp size={12} className="text-blue-500" /> 90d Performance Trend
                </p>
                <div className="flex gap-1">
                   <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                   <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                   <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                </div>
              </div>
              <div className="h-16 w-full bg-slate-50 dark:bg-white/5 rounded-2xl px-2 py-1 overflow-hidden shadow-inner border border-slate-100 dark:border-white/5">
                <Sparkline data={zone.history90d} color={getSparklineColor(zone.health)} />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 group-hover:border-blue-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-xl shadow-md group-hover:rotate-12 transition-transform">
                    <Users size={18} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Personnel</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{zone.evsCount}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase">Staff</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Coverage Depth</span>
                  <span className={getHealthTextColor(zone.health)}>{zone.health}%</span>
                </div>
                <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full transition-all duration-1000 ${getHealthColor(zone.health)} shadow-sm`}
                    style={{ width: `${zone.health}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              {zone.health < 80 ? (
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400 animate-pulse">
                   <AlertTriangle size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Alert: Understaffed</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                   <CheckCircle2 size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Coverage Nominal</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-black text-[10px] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                View Staff <ArrowRight size={14} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
