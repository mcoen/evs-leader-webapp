
import React, { useMemo } from 'react';
import { EVSTask, Asset, FacilityZoneCoverage, ZoneDetail } from '../types';
import { User, Activity, Users, Clock, MessageSquare, MapPin, Timer, Box, Truck, Building2, Layers, Map as MapIcon, MousePointerClick } from 'lucide-react';
import { FACILITIES } from '../constants';

interface FloorPlanProps {
  tasks: EVSTask[];
  assets: Asset[];
  loadBalancing: number;
  onMessageEmployee: (name: string) => void;
  facilityCoverage: FacilityZoneCoverage[];
  selectedFacility: string;
  onFacilityChange: (facility: string) => void;
  selectedZoneId: string;
  onZoneChange: (zoneId: string) => void;
}

export const FloorPlan: React.FC<FloorPlanProps> = ({ 
  tasks, 
  assets, 
  loadBalancing, 
  onMessageEmployee,
  facilityCoverage,
  selectedFacility,
  onFacilityChange,
  selectedZoneId,
  onZoneChange
}) => {
  // Enforce explicit selection of both facility and a specific zone
  const isSelectionComplete = selectedFacility !== 'All Facilities' && selectedZoneId !== '';

  const getLoadBalancingColor = (value: number) => {
    if (value < 60) return 'text-red-500';
    if (value < 80) return 'text-yellow-500';
    return 'text-green-500';
  };

  const currentFacilityData = useMemo(() => 
    facilityCoverage.find(f => f.facility === selectedFacility),
    [facilityCoverage, selectedFacility]
  );

  const currentZone = useMemo(() => 
    currentFacilityData?.zones.find(z => z.id === selectedZoneId),
    [currentFacilityData, selectedZoneId]
  );

  const getDeptColor = (category: string) => {
    switch (category) {
      case 'EVS': return 'bg-blue-600';
      case 'Engineering': return 'bg-amber-600';
      case 'BioMed': return 'bg-emerald-600';
      case 'Transport': return 'bg-indigo-600';
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

  const filteredTasks = useMemo(() => {
    if (!isSelectionComplete) return [];
    // Reduced count for better legibility as requested
    const totalToShow = 12;
    return tasks.filter(t => t.status === 'In Progress' && (t.facility === selectedFacility)).slice(0, totalToShow);
  }, [tasks, selectedFacility, currentZone, isSelectionComplete]);

  const filteredAssets = useMemo(() => {
    if (!isSelectionComplete) return [];
    // Reduced count of assets as requested
    return assets.slice(0, 6);
  }, [assets, isSelectionComplete]);

  const renderFloorplanBackground = () => {
    if (!isSelectionComplete) return null;
    const zoneName = currentZone?.name || '';
    // SVG is 100 units wide, 60 units high. Gray outline rect is at 5,5 width 90, height 50.
    if (zoneName.includes('OR') || zoneName.includes('Operating')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] dark:opacity-[0.15]" viewBox="0 0 100 60">
          <rect x="5" y="5" width="90" height="50" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="30" cy="20" r="10" fill="currentColor" />
          <circle cx="70" cy="20" r="10" fill="currentColor" />
          <circle cx="30" cy="45" r="10" fill="currentColor" />
          <circle cx="70" cy="45" r="10" fill="currentColor" />
          <path d="M50,5 L50,55" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      );
    }
    if (zoneName.includes('ICU') || zoneName.includes('Emergency')) {
      return (
        <svg className="absolute inset-0 w-full h-full opacity-[0.08] dark:opacity-[0.15]" viewBox="0 0 100 60">
          <rect x="5" y="5" width="90" height="50" fill="none" stroke="currentColor" strokeWidth="1" />
          {[0, 1, 2, 3, 4, 5].map(i => (
            <rect key={i} x={10 + i * 14} y="10" width="10" height="15" fill="currentColor" rx="1" />
          ))}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <rect key={i + 10} x={10 + i * 14} y="35" width="10" height="15" fill="currentColor" rx="1" />
          ))}
          <rect x="10" y="27" width="80" height="6" fill="currentColor" opacity="0.5" />
        </svg>
      );
    }
    return (
      <svg className="absolute inset-0 w-full h-full opacity-[0.08] dark:opacity-[0.15]" viewBox="0 0 100 60">
        <rect x="5" y="5" width="90" height="50" fill="none" stroke="currentColor" strokeWidth="1" />
        <rect x="10" y="25" width="80" height="10" fill="currentColor" />
        <rect x="45" y="10" width="10" height="40" fill="currentColor" />
        {[0, 1, 2, 3].map(i => (
          <rect key={i} x={12 + i * 20} y="8" width="15" height="15" fill="currentColor" rx="2" />
        ))}
        {[0, 1, 2, 3].map(i => (
          <rect key={i + 4} x={12 + i * 20} y="37" width="15" height="15" fill="currentColor" rx="2" />
        ))}
      </svg>
    );
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      {/* Full-Width Selector Bar */}
      <div className="w-full flex flex-wrap items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-700 flex-1 min-w-[200px]">
          <Building2 size={18} className="text-blue-600" />
          <div className="flex-1">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Select Facility</p>
            <select 
              value={selectedFacility}
              onChange={(e) => onFacilityChange(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-black text-slate-900 dark:text-white w-full cursor-pointer uppercase"
            >
              {FACILITIES.map(f => <option key={f} value={f} className="bg-white dark:bg-slate-900">{f}</option>)}
            </select>
          </div>
        </div>

        <div className={`flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-100 dark:border-slate-700 flex-1 min-w-[200px] transition-opacity ${selectedFacility === 'All Facilities' ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Layers size={18} className="text-indigo-600" />
          <div className="flex-1">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Select Unit / Zone</p>
            <select 
              value={selectedZoneId}
              disabled={selectedFacility === 'All Facilities'}
              onChange={(e) => onZoneChange(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-black text-slate-900 dark:text-white w-full cursor-pointer uppercase"
            >
              <option value="" className="bg-white dark:bg-slate-900">Choose a Zone...</option>
              {currentFacilityData?.zones.map(z => <option key={z.id} value={z.id} className="bg-white dark:bg-slate-900">{z.name}</option>)}
            </select>
          </div>
        </div>

        {isSelectionComplete && (
          <div className="hidden lg:flex items-center gap-4 px-6 py-2 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-right">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Zone Health</p>
               <p className={`text-lg font-black ${getLoadBalancingColor(currentZone?.health || 0)}`}>{currentZone?.health}%</p>
            </div>
            <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 ${getLoadBalancingColor(currentZone?.health || 0)} bg-opacity-10`}>
               <Activity size={20} />
            </div>
          </div>
        )}
      </div>

      {/* Full-Width Map Container */}
      <div className="relative w-full aspect-[16/10] md:aspect-[21/9] lg:aspect-[3/1.2] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[40px] shadow-2xl overflow-visible flex items-center justify-center">
        
        {!isSelectionComplete ? (
          <div className="flex flex-col items-center justify-center text-center p-12 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/20 blur-3xl rounded-full scale-150"></div>
              <div className="relative w-32 h-32 bg-white dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-2xl flex items-center justify-center text-blue-600">
                <MapIcon size={64} className="opacity-20" />
                <MousePointerClick size={32} className="absolute bottom-6 right-6 animate-bounce text-blue-600" />
              </div>
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Location Selection Required</h2>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                Please select a specific facility and clinical zone above to initialize the live floorplan and track active personnel.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Floorplan background */}
            <div className="absolute inset-0 rounded-[40px] overflow-hidden pointer-events-none transition-all duration-700">
              {renderFloorplanBackground()}
            </div>

            {/* Load Balancing Overlay */}
            <div className="absolute top-6 left-6 z-10 flex flex-col gap-1 animate-in slide-in-from-left-4 duration-500">
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-900 ${getLoadBalancingColor(loadBalancing)}`}>
                  <Activity size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Load Balancing</p>
                  <p className={`text-2xl font-black ${getLoadBalancingColor(loadBalancing)}`}>{loadBalancing}%</p>
                </div>
              </div>
            </div>

            {/* Personnel Icons */}
            {filteredTasks.map((task, idx) => {
              const seed = (currentZone?.id || '').length + idx;
              // Safe positioning within the 5,5 to 95,55 outline.
              // X: Left 10% to 90%. Y: Top 15% to 85% (as height is only 60 units in SVG).
              const x = 10 + (seed * 17) % 80;
              const y = 15 + (seed * 23) % 70;

              return (
                <div
                  key={`marker-${task.id}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 z-30 animate-in fade-in zoom-in duration-500"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className="group relative">
                    <div className={`p-2.5 rounded-full shadow-lg border-2 border-white dark:border-slate-800 transition-all duration-300 hover:scale-125 ${getDeptColor(task.category)} cursor-pointer`}>
                      {task.category === 'Transport' ? <Truck size={16} className="text-white" /> : <User size={16} className="text-white" />}
                    </div>
                    
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
                      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl min-w-[300px]">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-0.5">Personnel</p>
                            <p className="font-black text-xl leading-tight">{task.assignedTo || 'Unassigned'}</p>
                          </div>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg ${getDeptColor(task.category)} text-white shadow-sm`}>
                            {task.category}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg"><MapPin size={14} className="text-blue-600" /></div>
                            <span className="text-xs font-black">Room {task.roomNumber}</span>
                          </div>
                          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                            <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg"><Clock size={14} className="text-blue-600" /></div>
                            <span className="text-xs font-black">{task.category === 'Transport' ? 'In Transit' : 'On Task'}</span>
                          </div>
                        </div>
                        
                        {task.assignedTo && (
                          <button 
                            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black transition-all active:scale-95 shadow-xl shadow-blue-500/20 mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMessageEmployee(task.assignedTo!);
                            }}
                          >
                            <MessageSquare size={16} />
                            Direct Message
                          </button>
                        )}
                      </div>
                      <div className="w-4 h-4 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-700 absolute left-1/2 -translate-x-1/2 -bottom-2 rotate-45"></div>
                    </div>

                    {task.priority === 'High' && (
                      <div className={`absolute inset-0 rounded-full animate-ping opacity-25 ${getDeptColor(task.category)}`}></div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Asset Icons */}
            {filteredAssets.map((asset, idx) => {
              const seed = (currentZone?.id || '').length + idx + 100; // Large offset to differentiate from personnel
              // Consistent mapping to the outline rect coordinates
              const x = 10 + (seed * 31) % 80;
              const y = 15 + (seed * 19) % 70;

              return (
                <div
                  key={`asset-${asset.id}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 z-30 animate-in fade-in zoom-in duration-500"
                  style={{ left: `${x}%`, top: `${y}%` }}
                >
                  <div className="group relative">
                    <div className="p-2.5 bg-purple-600 rounded-xl shadow-lg border-2 border-white dark:border-slate-800 transition-all duration-300 hover:scale-125 cursor-pointer">
                      <Box size={16} className="text-white" />
                    </div>
                    
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
                      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl min-w-[260px]">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-0.5">Asset</p>
                            <p className="font-black text-lg leading-tight">{asset.name}</p>
                          </div>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 shadow-sm">
                            {asset.type}
                          </span>
                        </div>
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] font-bold text-slate-500 uppercase mb-1.5">Live Status</p>
                          <div className="flex items-center gap-2.5">
                            <div className={`w-2.5 h-2.5 rounded-full ${asset.status === 'Available' ? 'bg-green-500' : asset.status === 'Maintenance' ? 'bg-red-500' : 'bg-blue-500'} shadow-sm`}></div>
                            <span className={`text-sm font-black ${getAssetStatusColor(asset.status)}`}>{asset.status}</span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 font-bold mt-3">SN: {asset.id}</p>
                        </div>
                      </div>
                      <div className="w-4 h-4 bg-white dark:bg-slate-900 border-r border-b border-slate-200 dark:border-slate-700 absolute left-1/2 -translate-x-1/2 -bottom-2 rotate-45"></div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Legend */}
            <div className="absolute bottom-6 right-6 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-5 rounded-3xl text-[9px] font-black space-y-2.5 shadow-2xl border border-slate-200 dark:border-slate-700 z-40 animate-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-100"><div className="w-3.5 h-3.5 rounded-full bg-blue-600 shadow-sm shadow-blue-500"></div> EVS OPS</div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-100"><div className="w-3.5 h-3.5 rounded-full bg-indigo-600 shadow-sm shadow-indigo-500"></div> PATIENT TRANSPORT</div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-100"><div className="w-3.5 h-3.5 rounded-full bg-amber-600 shadow-sm shadow-amber-500"></div> ENGINEERING</div>
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-100"><div className="w-3.5 h-3.5 rounded-full bg-emerald-600 shadow-sm shadow-emerald-500"></div> BIOMEDICAL</div>
            </div>
          </>
        )}
      </div>

      {/* Full-Width Map Bottom Outcomes */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 w-full transition-all duration-700 ${!isSelectionComplete ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Personnel</p>
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{isSelectionComplete ? filteredTasks.length : '--'}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-2xl text-blue-600 shadow-inner">
            <Users size={24} />
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Monitored Assets</p>
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{isSelectionComplete ? filteredAssets.length : '--'}</p>
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-2xl text-indigo-600 shadow-inner">
            <Box size={24} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Unit Response</p>
            <p className={`text-3xl font-black text-slate-800 dark:text-slate-100`}>{isSelectionComplete ? '7.2 min' : '--'}</p>
          </div>
          <div className={`p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-blue-600 shadow-inner`}>
            <Timer size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};
