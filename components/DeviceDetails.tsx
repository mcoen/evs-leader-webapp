
import React from 'react';
import { MaintenanceDevice } from '../types';
import { 
  ArrowLeft, 
  Wrench, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  Info, 
  Settings,
  ShieldAlert,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Cpu,
  Factory,
  Check
} from 'lucide-react';

interface DeviceDetailsProps {
  device: MaintenanceDevice;
  onBack: () => void;
}

export const DeviceDetails: React.FC<DeviceDetailsProps> = ({ device, onBack }) => {
  const calculateAge = (date: string) => {
    const years = (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return years.toFixed(1);
  };

  const isWarrantyActive = (date: string) => {
    return new Date(date).getTime() > new Date().getTime();
  };

  const getLogStatusIcon = (status: string) => {
    switch (status) {
      case 'Pass': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'Fail': return <XCircle size={16} className="text-red-500" />;
      default: return <Clock size={16} className="text-amber-500" />;
    }
  };

  return (
    <div className="pt-4 md:pt-8 space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg transition-all active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tighter leading-none">
              Device Audit: {device.name}
            </h1>
            <p className="text-[10px] font-black text-slate-500 mt-2 uppercase tracking-widest flex items-center gap-2">
              <Cpu size={12} className="text-blue-600" /> {device.id} • {device.facility}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${device.status === 'Operational' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'} shadow-sm border border-transparent`}>
            {device.status}
          </span>
          <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${device.category === 'BioMed' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
            {device.category}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Core Info & History */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Metadata Card */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            
            <div className="flex items-center gap-4 relative z-10">
               <div className="p-4 bg-slate-900 text-white rounded-3xl shadow-xl">
                  <Factory size={32} />
               </div>
               <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Manufacturer Details</h3>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{device.manufacturer}</p>
               </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Model No.</p>
                <p className="text-sm font-black text-slate-900 dark:text-white truncate">{device.model}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Serial No.</p>
                <p className="text-sm font-black text-slate-900 dark:text-white truncate">{device.serialNumber}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Asset Age</p>
                <p className="text-sm font-black text-slate-900 dark:text-white">{calculateAge(device.installDate)} Years</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Warranty Status</p>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${isWarrantyActive(device.warrantyExpiration) ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{isWarrantyActive(device.warrantyExpiration) ? 'Active' : 'Expired'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Logs Timeline */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
            <h3 className="text-xl font-black text-slate-950 dark:text-white flex items-center gap-3">
              <Clock size={24} className="text-blue-600" /> Maintenance Logs
            </h3>
            
            <div className="relative space-y-8 pl-8 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
              {device.history.map((log) => (
                <div key={log.id} className="relative group">
                  <div className={`absolute -left-9 top-1.5 w-8 h-8 rounded-xl border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-md ${log.status === 'Pass' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    <Check size={16} className="text-white" />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{new Date(log.date).toLocaleDateString()}</span>
                         <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                         <h4 className="text-base font-black text-slate-950 dark:text-white">{log.action}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {getLogStatusIcon(log.status)}
                        <span className={`text-[10px] font-black uppercase ${log.status === 'Pass' ? 'text-emerald-600' : 'text-red-600'}`}>{log.status}</span>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{log.notes}</p>
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                       <User size={12} className="text-slate-400" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Technician: {log.technician}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Status */}
        <div className="lg:col-span-4 space-y-8">
          {/* Reliability Audit Card - Updated to match background of Ops Controls */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 dark:bg-blue-600/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-blue-600/10 dark:group-hover:bg-blue-600/40 transition-colors"></div>
            
            <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3 relative z-10 text-slate-950 dark:text-white">
              <ShieldAlert size={20} className="text-blue-600 dark:text-blue-400" /> Reliability Audit
            </h3>

            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-end border-b border-slate-100 dark:border-white/10 pb-4">
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Install Date</p>
                    <p className="text-sm font-bold mt-1 text-slate-900 dark:text-white">{new Date(device.installDate).toLocaleDateString()}</p>
                 </div>
                 <Calendar size={18} className="text-slate-400" />
              </div>
              <div className="flex justify-between items-end border-b border-slate-100 dark:border-white/10 pb-4">
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Warranty Expiry</p>
                    <p className={`text-sm font-bold mt-1 ${isWarrantyActive(device.warrantyExpiration) ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                      {new Date(device.warrantyExpiration).toLocaleDateString()}
                    </p>
                 </div>
                 <ShieldCheck size={18} className={isWarrantyActive(device.warrantyExpiration) ? 'text-emerald-500' : 'text-red-500'} />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 flex items-start gap-3">
                 <Info size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                 <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
                   Next PM Cycle scheduled for {new Date(new Date(device.lastMaintenanceDate).setMonth(new Date(device.lastMaintenanceDate).getMonth() + 4)).toLocaleDateString()}. Ensure technicians verify calibration seals.
                 </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
             <h3 className="text-lg font-black text-slate-950 dark:text-white uppercase tracking-widest flex items-center gap-3">
                <Wrench size={20} className="text-blue-600" /> Ops Controls
             </h3>
             <div className="space-y-3">
                <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-500/20">
                  Log New Service
                </button>
                <button className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 border border-slate-100 dark:border-slate-700">
                  Print Asset Label
                </button>
                <button className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 border border-red-100">
                  Flag Out of Service
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
