
import React from 'react';
import { Notification } from '../types';
import { ArrowLeft, Bell, Clock, Info, AlertTriangle, ShieldAlert } from 'lucide-react';

interface NotificationDetailsProps {
  notification: Notification;
  onBack: () => void;
}

export const NotificationDetails: React.FC<NotificationDetailsProps> = ({ notification, onBack }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'urgent': return <ShieldAlert className="text-red-600" size={32} />;
      case 'warning': return <AlertTriangle className="text-amber-600" size={32} />;
      default: return <Info className="text-blue-600" size={32} />;
    }
  };

  const getBadgeStyle = () => {
    switch (notification.type) {
      case 'urgent': return 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400';
      case 'warning': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400';
      default: return 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400';
    }
  };

  return (
    <div className="pt-4 md:pt-8 w-full space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Notification Details</h1>
          <p className="text-slate-800 dark:text-gray-400 font-bold mt-1">Reviewing internal system alert</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className={`p-5 rounded-3xl ${getBadgeStyle()} bg-opacity-10`}>
              {getIcon()}
            </div>
            <div className="text-right">
              <span className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl ${getBadgeStyle()}`}>
                {notification.type} Severity
              </span>
              <div className="flex items-center gap-2 text-slate-500 font-bold text-sm mt-3 justify-end">
                <Clock size={16} />
                {notification.timestamp}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-950 dark:text-white leading-tight">
              {notification.title}
            </h2>
            <div className="w-20 h-1.5 bg-blue-600 rounded-full"></div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
            <p className="text-xl text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              {notification.message}
            </p>
          </div>

          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
             <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black">
                    U{i}
                  </div>
                ))}
             </div>
             <p className="text-xs font-bold text-slate-500">Shared with Command Center and On-call Engineering</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={onBack}
          className="px-8 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-black transition-all"
        >
          Dismiss View
        </button>
      </div>
    </div>
  );
};
