
import React, { useState } from 'react';
import { RoomDetail } from '../types';
import { ReplenishmentModal } from './ReplenishmentModal';
import { 
  ArrowLeft, 
  User, 
  Thermometer, 
  Droplets, 
  Wind, 
  Box, 
  Package, 
  History, 
  Sparkles,
  Stethoscope,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  ClipboardCheck
} from 'lucide-react';

interface RoomDetailsProps {
  room: RoomDetail;
  onBack: () => void;
  onViewTask: (id: string) => void;
}

export const RoomDetails: React.FC<RoomDetailsProps> = ({ room, onBack, onViewTask }) => {
  const [isReplenishOpen, setIsReplenishOpen] = useState(false);

  const getPressureColor = (p: string) => {
    switch (p) {
      case 'Negative': return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
      case 'Positive': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      default: return 'text-slate-600 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  const getInventoryStatus = (q: number, min: number) => {
    if (q <= 0) return 'text-red-600 bg-red-50';
    if (q < min) return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  return (
    <div className="pt-4 md:pt-8 space-y-10 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={28} />
          </button>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white uppercase">Room Audit: {room.roomNumber}</h1>
            <p className="text-slate-800 dark:text-gray-400 font-bold mt-1 uppercase text-xs tracking-widest flex items-center gap-2">
              <Building2 size={14} /> {room.facility} • {room.type} Room
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest ${getPressureColor(room.pressure)} border border-transparent shadow-sm`}>
            {room.pressure} Pressure
          </span>
          <div className="px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Thermometer size={18} className="text-red-500" />
              <span className="text-sm font-black text-slate-900 dark:text-white">{room.temperature.toFixed(1)}°F</span>
            </div>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <Droplets size={18} className="text-blue-500" />
              <span className="text-sm font-black text-slate-900 dark:text-white">{room.humidity.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Patient & Core Info */}
        <div className="lg:col-span-8 space-y-10">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
              {/* Patient Info */}
              <div className="space-y-8">
                <h3 className="text-base font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <User size={20} className="text-blue-600" /> Patient Status
                </h3>
                {room.patientName ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/40 rounded-[32px] flex items-center justify-center shadow-inner">
                        <Stethoscope size={36} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{room.patientName}</p>
                        <p className="text-sm font-black text-blue-600 uppercase tracking-widest mt-2">Admitted • Care Group A</p>
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Precautionary Status</p>
                      <span className="text-base font-black text-slate-900 dark:text-slate-200">Standard Precautions</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <Sparkles size={32} className="text-slate-300 mb-3" />
                    <p className="text-base font-black text-slate-400 uppercase tracking-widest">Room Empty / Ready</p>
                  </div>
                )}
              </div>

              {/* Equipment Assets */}
              <div className="space-y-8">
                <h3 className="text-base font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Box size={20} className="text-purple-600" /> In-Room Assets
                </h3>
                <div className="space-y-4">
                  {room.assets.map(asset => (
                    <div key={asset.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[24px] shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-xl flex items-center justify-center shadow-inner">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{asset.name}</p>
                          <p className="text-xs font-bold text-slate-400 mt-1.5">{asset.type}</p>
                        </div>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${asset.status === 'Available' ? 'bg-green-500' : 'bg-blue-500'} shadow-sm`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* History Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-lg space-y-8">
              <h3 className="text-base font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <History size={20} className="text-amber-500" /> Recent Maintenance
              </h3>
              <div className="space-y-5">
                {room.recentMaintenance.length > 0 ? room.recentMaintenance.map(task => (
                  <div key={task.id} onClick={() => onViewTask(task.id)} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-3xl transition-all cursor-pointer border border-slate-50 dark:border-slate-800 group">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600">{task.description}</p>
                      <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        {new Date(task.endTime || task.createdAt).toLocaleDateString()}
                      </span>
                      <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                      <span className="text-xs font-black text-amber-600 uppercase tracking-widest">{task.category}</span>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm font-black text-slate-400 italic text-center py-6">No recent maintenance recorded</p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-lg space-y-8">
              <h3 className="text-base font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <ClipboardCheck size={20} className="text-green-500" /> Recent Cleaning
              </h3>
              <div className="space-y-5">
                {room.recentCleaning.length > 0 ? room.recentCleaning.map(task => (
                  <div key={task.id} onClick={() => onViewTask(task.id)} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-3xl transition-all cursor-pointer border border-slate-50 dark:border-slate-800 group">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600">{task.description}</p>
                      <ArrowRight size={18} className="text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1" />
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        {new Date(task.endTime || task.createdAt).toLocaleDateString()}
                      </span>
                      <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                      <span className="text-xs font-black text-green-600 uppercase tracking-widest">Complete</span>
                    </div>
                  </div>
                )) : (
                   <p className="text-sm font-black text-slate-400 italic text-center py-6">No recent cleaning recorded</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-10">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-slate-900 dark:text-white leading-none">
                <Package size={24} className="text-blue-600" /> 
                <span className="mt-1">Consumables</span>
              </h3>
              <button className="text-xs font-black text-blue-600 uppercase hover:underline">Manage Stock</button>
            </div>
            
            <div className="space-y-6">
              {room.inventory.map(inv => (
                <div key={inv.item} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{inv.item}</p>
                    <p className={`text-base font-black ${inv.quantity < inv.minThreshold ? 'text-red-600' : 'text-slate-600 dark:text-slate-400'}`}>
                      {inv.quantity} <span className="text-xs text-slate-400 uppercase">{inv.unit}</span>
                    </p>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full transition-all duration-1000 ${inv.quantity < inv.minThreshold ? 'bg-red-500' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min(100, (inv.quantity / (inv.minThreshold * 1.5)) * 100)}%` }}
                    ></div>
                  </div>
                  {inv.quantity < inv.minThreshold && (
                    <p className="text-xs font-black text-red-600 uppercase flex items-center gap-2 animate-pulse">
                      <AlertTriangle size={12} /> Restock Required
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-10 border-t border-slate-100 dark:border-white/10 space-y-6">
               <div className="p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 flex items-start gap-4">
                  <MapPin size={22} className="text-slate-400 mt-1" />
                  <div>
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Location Logic</p>
                     <p className="text-sm font-bold leading-relaxed text-slate-500 dark:text-slate-300 mt-1">Nearest supply hub: South Wing Terminal A. Restock cycle is 2x daily.</p>
                  </div>
               </div>
               <button 
                onClick={() => setIsReplenishOpen(true)}
                className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-500/20"
               >
                  Request Replenishment
               </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-200 dark:border-slate-800 shadow-lg space-y-8">
             <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 size={20} className="text-blue-600" /> Compliance Note
             </h3>
             <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
               "Room {room.roomNumber} environmental and asset compliance last verified at {new Date().toLocaleTimeString()} by Central Monitoring."
             </p>
          </div>
        </div>
      </div>

      <ReplenishmentModal 
        room={room}
        isOpen={isReplenishOpen}
        onClose={() => setIsReplenishOpen(false)}
      />
    </div>
  );
};
