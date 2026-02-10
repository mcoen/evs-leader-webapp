
import React from 'react';
import { EVSTask, Asset } from '../types';
import { User, Activity, Users, Clock, MessageSquare, MapPin, Timer, Box, Component } from 'lucide-react';

interface FloorPlanProps {
  tasks: EVSTask[];
  assets: Asset[];
  loadBalancing: number;
  onMessageEmployee: (name: string) => void;
}

export const FloorPlan: React.FC<FloorPlanProps> = ({ tasks, assets, loadBalancing, onMessageEmployee }) => {
  const getLoadBalancingColor = (value: number) => {
    if (value < 60) return 'text-red-500';
    if (value < 80) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Exactly 12 icons matching active tasks as requested
  const activeTasks = tasks.filter(t => t.status === 'In Progress').slice(0, 12);
  const activeEmployeeCount = activeTasks.length;

  // Calculate Average Task Time from completed tasks or use a realistic mock if history is thin
  const completedTasks = tasks.filter(t => t.status === 'Complete');
  const avgTaskTime = completedTasks.length > 0 
    ? Math.round(completedTasks.reduce((acc, t) => acc + t.expectedDuration, 0) / completedTasks.length)
    : 32; // Default mock

  const getAvgTimeColor = (time: number) => {
    return time < 28 ? 'text-green-500' : 'text-red-500';
  };

  const getDeptColor = (category: string) => {
    switch (category) {
      case 'EVS': return 'bg-blue-600';
      case 'Engineering': return 'bg-amber-600';
      case 'BioMed': return 'bg-emerald-600';
      default: return 'bg-slate-500';
    }
  };

  const getAssetStatusColor = (status: string) => {
    switch (status) {
      case 'In Use': return 'text-blue-500';
      case 'Available': return 'text-green-500';
      case 'Maintenance': return 'text-red-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center">
      {/* Map Container - Removed overflow-hidden to allow popups to escape frame */}
      <div className="relative w-full max-w-5xl aspect-[16/10] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] shadow-2xl overflow-visible">
        
        {/* Decorative background layer for clipping the SVG only */}
        <div className="absolute inset-0 rounded-[40px] overflow-hidden pointer-events-none">
          {/* Stylized Hospital Floorplan Background */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.05] dark:opacity-[0.1]" viewBox="0 0 100 60">
            <rect x="5" y="5" width="90" height="50" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <rect x="10" y="25" width="80" height="10" fill="currentColor" />
            <rect x="45" y="10" width="10" height="40" fill="currentColor" />
            {[0, 1, 2, 3, 4].map(i => (
              <rect key={`r1-${i}`} x={10 + i * 16} y="8" width="12" height="15" fill="currentColor" rx="2" />
            ))}
            {[0, 1, 2, 3, 4].map(i => (
              <rect key={`r2-${i}`} x={10 + i * 16} y="37" width="12" height="15" fill="currentColor" rx="2" />
            ))}
          </svg>
        </div>

        {/* Load Balancing Overlay - z-10 */}
        <div className="absolute top-6 left-6 z-10 flex flex-col gap-1">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-900 ${getLoadBalancingColor(loadBalancing)}`}>
              <Activity size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Load Balancing</p>
              <p className={`text-2xl font-black ${getLoadBalancingColor(loadBalancing)}`}>{loadBalancing}%</p>
            </div>
          </div>
        </div>

        {/* Personnel Icons (Active Tasks) - z-30 for markers */}
        {activeTasks.map((task) => (
          <div
            key={`marker-${task.id}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 z-30"
            style={{ left: `${task.location.x}%`, top: `${task.location.y}%` }}
          >
            <div className="group relative">
              <div className={`p-2 rounded-full shadow-lg border-2 border-white dark:border-slate-800 transition-transform duration-300 hover:scale-125 ${getDeptColor(task.category)} cursor-pointer`}>
                <User size={14} className="text-white" />
              </div>
              
              {/* Personnel Detail Popover - z-50 to overlap frame boundaries */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
                <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl min-w-[280px]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5">Personnel</p>
                      <p className="font-black text-lg leading-tight">{task.assignedTo || 'Unassigned'}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${getDeptColor(task.category)} text-white`}>
                      {task.category}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 py-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <MapPin size={12} className="text-blue-500" />
                      <span className="text-xs font-bold">Room {task.roomNumber}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Clock size={12} className="text-blue-500" />
                      <span className="text-xs font-bold">In Transit</span>
                    </div>
                  </div>
                  
                  {task.assignedTo && (
                    <button 
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all active:scale-95 shadow-lg shadow-blue-500/20 mt-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMessageEmployee(task.assignedTo!);
                      }}
                    >
                      <MessageSquare size={14} />
                      Send Message
                    </button>
                  )}
                </div>
                <div className="w-3 h-3 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-700 absolute left-1/2 -translate-x-1/2 -bottom-1.5 rotate-45"></div>
              </div>

              {/* Pulsing ring for high priority tasks */}
              {task.priority === 'High' && (
                <div className={`absolute inset-0 rounded-full animate-ping opacity-20 ${getDeptColor(task.category)}`}></div>
              )}
            </div>
          </div>
        ))}

        {/* Asset Icons (10 Medical Devices) - z-30 for markers */}
        {assets.map((asset) => (
          <div
            key={`asset-${asset.id}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 z-30"
            style={{ left: `${asset.location.x}%`, top: `${asset.location.y}%` }}
          >
            <div className="group relative">
              <div className="p-2 bg-purple-600 rounded-lg shadow-lg border-2 border-white dark:border-slate-800 transition-transform duration-300 hover:scale-125 cursor-pointer">
                <Box size={14} className="text-white" />
              </div>
              
              {/* Asset Detail Popover - z-50 to overlap frame boundaries */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
                <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl min-w-[240px]">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-0.5">Asset</p>
                      <p className="font-black text-base leading-tight">{asset.name}</p>
                    </div>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                      {asset.type}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${asset.status === 'Available' ? 'bg-green-500' : asset.status === 'Maintenance' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                      <span className={`text-xs font-black ${getAssetStatusColor(asset.status)}`}>{asset.status}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-bold mt-2">ID: {asset.id}</p>
                  </div>
                </div>
                <div className="w-3 h-3 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-700 absolute left-1/2 -translate-x-1/2 -bottom-1.5 rotate-45"></div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Legend - z-40 to stay above markers but below popovers */}
        <div className="absolute bottom-6 right-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 rounded-2xl text-[10px] font-black space-y-2 shadow-2xl border border-slate-200 dark:border-slate-700 z-40">
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-100"><div className="w-3 h-3 rounded-full bg-blue-600 shadow-sm shadow-blue-500"></div> EVS OPERATIONS</div>
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-100"><div className="w-3 h-3 rounded-full bg-amber-600 shadow-sm shadow-amber-500"></div> ENGINEERING</div>
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-100"><div className="w-3 h-3 rounded-full bg-emerald-600 shadow-sm shadow-emerald-500"></div> BIOMEDICAL</div>
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-100"><div className="w-3 h-3 rounded-lg bg-purple-600 shadow-sm shadow-purple-500"></div> MEDICAL ASSETS</div>
        </div>
      </div>

      {/* Map Bottom Outcomes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Employees</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{activeEmployeeCount}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2.5 rounded-xl text-blue-600">
            <Users size={20} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Tasks</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{activeTasks.length}</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-xl text-amber-600">
            <Clock size={20} />
          </div>
        </div>

        {/* Replaced Balanced Outcome with Average Task Time */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Task Time</p>
            <p className={`text-2xl font-black ${getAvgTimeColor(avgTaskTime)}`}>{avgTaskTime} min</p>
          </div>
          <div className={`p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 ${getAvgTimeColor(avgTaskTime)}`}>
            <Timer size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};
