
import React from 'react';
import { IntegrationDetail, IntegrationPoint } from '../types';
import { 
  ArrowLeft, 
  Activity, 
  ShieldAlert, 
  Database, 
  Cpu, 
  Wifi, 
  Thermometer, 
  Wind, 
  Droplets,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ClipboardList,
  FileWarning,
  Server
} from 'lucide-react';

interface IntegrationDetailsProps {
  detail: IntegrationDetail;
  onBack: () => void;
}

export const IntegrationDetails: React.FC<IntegrationDetailsProps> = ({ detail, onBack }) => {
  const isServiceNow = detail.name.toLowerCase().includes('service');

  const getPointIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'temperature': return <Thermometer size={16} />;
      case 'pressure': return <Wind size={16} />;
      case 'humidity': return <Droplets size={16} />;
      case 'incident': return <FileWarning size={16} />;
      case 'request': return <ClipboardList size={16} />;
      case 'system': return <Server size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getStatusColor = (status: IntegrationPoint['status']) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'alarm': return 'text-red-600 bg-red-50 dark:bg-red-900/20 animate-pulse';
      case 'offline': return 'text-slate-500 bg-slate-50 dark:bg-slate-900/40';
    }
  };

  return (
    <div className="pt-4 md:pt-8 space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-700 dark:text-slate-400"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">{detail.name} Integration</h1>
          <p className="text-slate-800 dark:text-gray-400 font-bold mt-1">
            {isServiceNow ? 'ServiceNow® Hospital Service Management API' : 'Metasys® Building Automation System API (v4)'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API Health Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl">
              <Wifi size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connection Status</p>
              <p className="text-lg font-black text-green-600">Active - {detail.latency}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl">
              <Database size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth Method</p>
              <p className="text-lg font-black text-slate-800 dark:text-slate-200">{detail.authStatus}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl">
              <ShieldAlert size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {isServiceNow ? 'Active P1/P2 Tickets' : 'Active BAS Alarms'}
              </p>
              <p className="text-lg font-black text-red-600">{detail.activeAlarms} Pending</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl">
              <Cpu size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {isServiceNow ? 'Synced Modules' : 'Monitored Objects'}
              </p>
              <p className="text-lg font-black text-slate-800 dark:text-slate-200">{detail.points.length} Objects</p>
            </div>
          </div>
        </div>

        {/* Connection Info */}
        <div className="bg-slate-900 p-6 rounded-3xl text-white space-y-4">
          <h3 className="font-black flex items-center gap-2">
            <ExternalLink size={18} className="text-blue-400" />
            Endpoint Details
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">API URL</p>
              <p className="text-xs font-mono text-blue-300 break-all">{detail.apiEndpoint}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Version</p>
              <p className="text-xs font-bold">{detail.version}</p>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase leading-relaxed">
                {isServiceNow 
                  ? 'Hospital operations rely on ServiceNow for Incident management and Request fulfillment. This bridge syncs TeleTracking tasks with Enterprise Service Management.'
                  : 'Hospital compliance requires positive/negative pressure monitoring in surgical suites. Integration monitors these values in real-time.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Points Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-950 dark:text-white">
            {isServiceNow ? 'Active Service Records' : 'Hospital Environmental Points'}
          </h2>
          <div className="flex gap-2">
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <CheckCircle2 size={10} /> Normal
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-red-600 bg-red-50 px-2 py-1 rounded-full animate-pulse">
              <AlertTriangle size={10} /> {isServiceNow ? 'P1/P2 Alert' : 'Alarm'}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  {isServiceNow ? 'Record ID / Short Desc' : 'Point Name / ID'}
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Location</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Value / State</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {detail.points.map((point) => (
                <tr key={point.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-black text-slate-900 dark:text-white text-sm">{point.name}</p>
                    <p className="text-[10px] font-mono text-slate-400">{point.id}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400">
                    {point.location}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      {getPointIcon(point.type)}
                      <span className="text-xs font-black uppercase">{point.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`text-lg font-black ${point.status === 'alarm' ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                      {point.value} <span className="text-xs text-slate-400">{point.unit === 'binary' || point.unit === 'Priority' || point.unit === 'Status' ? '' : point.unit}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(point.status)}`}>
                      {point.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
