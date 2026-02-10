
import React, { useState, useMemo } from 'react';
import { MaintenanceDevice } from '../types';
import { FACILITIES, DEPARTMENTS } from '../constants';
import { 
  Search, 
  Building2, 
  Filter, 
  ArrowRight, 
  Wrench, 
  ShieldCheck, 
  AlertTriangle, 
  Settings,
  Cpu,
  Zap,
  Clock
} from 'lucide-react';

interface MaintenanceHistoryProps {
  devices: MaintenanceDevice[];
  onViewDevice: (device: MaintenanceDevice) => void;
  selectedFacility: string;
  setSelectedFacility: (f: string) => void;
}

export const MaintenanceHistory: React.FC<MaintenanceHistoryProps> = ({ 
  devices, 
  onViewDevice, 
  selectedFacility, 
  setSelectedFacility 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All Departments');

  const filteredDevices = useMemo(() => {
    return devices.filter(device => {
      const matchesFacility = selectedFacility === 'All Facilities' || device.facility === selectedFacility;
      const matchesCategory = categoryFilter === 'All Departments' || device.category === categoryFilter;
      const matchesSearch = 
        device.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        device.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        device.id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFacility && matchesCategory && matchesSearch;
    });
  }, [devices, selectedFacility, categoryFilter, searchQuery]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Operational': return <ShieldCheck className="text-emerald-500" size={16}/>;
      case 'Repair Needed': return <AlertTriangle className="text-amber-500" size={16}/>;
      default: return <Settings className="text-red-500" size={16}/>;
    }
  };

  const getCategoryColor = (cat: string) => {
    return cat === 'BioMed' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-purple-600 bg-purple-50 dark:bg-purple-900/20';
  };

  return (
    <div className="pt-4 md:pt-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Maintenance History</h1>
          <p className="text-slate-800 dark:text-gray-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Asset compliance & preventative maintenance auditing.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-3 flex items-center gap-4 shadow-sm">
            <div className="flex flex-col items-center border-r border-slate-100 dark:border-slate-800 pr-4">
              <p className="text-[9px] font-black text-slate-400 uppercase">Audit Health</p>
              <p className="text-xl font-black text-emerald-600">98%</p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-[9px] font-black text-slate-400 uppercase">PM Compliance</p>
              <p className="text-xl font-black text-blue-600">100%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search assets by name, ID, or manufacturer..." 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 px-4 py-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border-none focus-within:ring-2 focus-within:ring-blue-600">
            <Building2 size={16} className="text-slate-400" />
            <select 
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-black text-slate-900 dark:text-white cursor-pointer pr-4 uppercase"
            >
              {FACILITIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 px-4 py-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border-none focus-within:ring-2 focus-within:ring-blue-600">
            <Filter size={16} className="text-slate-400" />
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-xs font-black text-slate-900 dark:text-white cursor-pointer pr-4 uppercase"
            >
              {DEPARTMENTS.filter(d => d === 'All Departments' || d === 'BioMed' || d === 'Engineering').map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Device / Asset ID</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Category / Type</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Facility Location</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Latest Action</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">View Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredDevices.map(device => (
                <tr 
                  key={device.id} 
                  onClick={() => onViewDevice(device)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform">
                        <Cpu size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{device.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{device.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${getCategoryColor(device.category)}`}>
                      {device.category}
                    </span>
                    <p className="text-xs font-bold text-slate-500 mt-1.5">{device.type}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase leading-tight">{device.facility}</p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                       <Wrench size={14} className="text-blue-600" />
                       <p className="text-sm font-black text-slate-800 dark:text-slate-100">{device.lastMaintenanceAction}</p>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase mt-1">
                      {new Date(device.lastMaintenanceDate).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(device.status)}
                      <span className="text-[10px] font-black uppercase text-slate-900 dark:text-slate-200 tracking-tight">{device.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-all">
                      <ArrowRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDevices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-full">
                         <Wrench size={48} className="text-slate-200 dark:text-slate-700" />
                      </div>
                      <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-sm">No devices found in this scope</p>
                      <button onClick={() => { setSearchQuery(''); setCategoryFilter('All Departments'); setSelectedFacility('All Facilities'); }} className="text-xs font-black text-blue-600 hover:underline uppercase tracking-widest">Clear all audit filters</button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
