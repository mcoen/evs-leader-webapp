
import React from 'react';
import { EVSTask, TaskStatus } from '../types';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Timer, 
  Calendar,
  MessageSquare,
  Building2,
  Flag,
  ChevronRight
} from 'lucide-react';

interface TaskDetailsProps {
  task: EVSTask;
  onBack: () => void;
  onMessageEmployee: (name: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({ task, onBack, onMessageEmployee, onStatusChange }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'Medium': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
      case 'Low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      default: return 'text-slate-600 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Complete': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'In Progress': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'Not Started': return 'text-slate-600 bg-slate-50 dark:bg-slate-900/20';
      case 'Canceled': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    }
  };

  const calculateDuration = (start?: string, end?: string) => {
    if (!start) return null;
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : new Date().getTime();
    const diff = Math.floor((endTime - startTime) / 60000);
    return diff;
  };

  const duration = calculateDuration(task.startTime, task.endTime);
  const isOverdue = task.status === 'In Progress' && duration !== null && duration > task.expectedDuration;

  return (
    <div className="pt-4 md:pt-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      {/* Header with Back Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">Room {task.roomNumber} Details</h1>
            <p className="text-slate-800 dark:text-gray-400 font-bold mt-1">ID: {task.id} • {task.facility}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${getPriorityColor(task.priority)}`}>
            {task.priority} Priority
          </span>
          {task.isEscalated && (
            <span className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-red-600 text-white animate-pulse">
              Escalated
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details Card */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 font-black uppercase text-xs tracking-widest">
                  <Flag size={14} />
                  <span>Task Overview</span>
                </div>
                <h2 className="text-4xl font-black text-slate-950 dark:text-white leading-tight">
                  {task.description}
                </h2>
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                    <Building2 size={16} className="text-slate-500" />
                    <span className="text-sm font-black text-slate-900 dark:text-slate-200">{task.category}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl">
                    <MapPin size={16} className="text-slate-500" />
                    <span className="text-sm font-black text-slate-900 dark:text-slate-200">Room {task.roomNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timing & Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expected Duration</p>
                <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                  <Timer size={20} className="text-blue-500" />
                  <span className="text-2xl font-black">{task.expectedDuration} min</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current/Final Elapsed</p>
                <div className="flex items-center gap-2">
                  <Clock size={20} className={isOverdue ? "text-red-600" : "text-slate-500"} />
                  <span className={`text-2xl font-black ${isOverdue ? "text-red-600" : "text-slate-900 dark:text-white"}`}>
                    {duration !== null ? `${duration} min` : '--'}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Request Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${task.status === 'Complete' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{task.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Timeline */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
            <h3 className="text-xl font-black flex items-center gap-3 text-slate-950 dark:text-white">
              <Calendar size={20} className="text-blue-600" /> Task Lifecycle
            </h3>
            
            <div className="relative space-y-12 pl-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
              {/* Created */}
              <div className="relative">
                <div className="absolute -left-8 top-1.5 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 border-4 border-white dark:border-slate-900"></div>
                <div>
                  <p className="text-sm font-black text-slate-950 dark:text-white">Task Created</p>
                  <p className="text-xs font-bold text-slate-500">{new Date(task.createdAt).toLocaleString()}</p>
                </div>
              </div>
              
              {/* Started */}
              {task.startTime && (
                <div className="relative">
                  <div className="absolute -left-8 top-1.5 w-6 h-6 rounded-full bg-blue-600 border-4 border-white dark:border-slate-900"></div>
                  <div>
                    <p className="text-sm font-black text-slate-950 dark:text-white">Work Commenced</p>
                    <p className="text-xs font-bold text-slate-500">{new Date(task.startTime).toLocaleString()}</p>
                    {task.assignedTo && <p className="text-[10px] font-black text-blue-600 uppercase mt-1">Personnel: {task.assignedTo}</p>}
                  </div>
                </div>
              )}

              {/* Completed */}
              {task.endTime && (
                <div className="relative">
                  <div className="absolute -left-8 top-1.5 w-6 h-6 rounded-full bg-green-600 border-4 border-white dark:border-slate-900"></div>
                  <div>
                    <p className="text-sm font-black text-slate-950 dark:text-white">Task Finalized</p>
                    <p className="text-xs font-bold text-slate-500">{new Date(task.endTime).toLocaleString()}</p>
                    <p className="text-[10px] font-black text-green-600 uppercase mt-1">Outcome: SUCCESS</p>
                  </div>
                </div>
              )}

              {!task.endTime && task.status !== 'Canceled' && (
                <div className="relative">
                  <div className="absolute -left-8 top-1.5 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-900 animate-pulse"></div>
                  <div>
                    <p className="text-sm font-black text-slate-400">Awaiting Completion</p>
                    <p className="text-xs font-bold text-slate-400">Work currently active or pending...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Personnel Card */}
          <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
            <h3 className="text-xl font-black flex items-center gap-3">
              <User size={20} className="text-blue-400" /> Assigned Personnel
            </h3>
            {task.assignedTo ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-2xl font-black shadow-lg shadow-blue-500/20">
                    {task.assignedTo.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-2xl font-black leading-tight">{task.assignedTo}</p>
                    <p className="text-xs font-black text-blue-400 uppercase tracking-widest">{task.category} Specialist</p>
                  </div>
                </div>
                <button 
                  onClick={() => onMessageEmployee(task.assignedTo!)}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-sm transition-all active:scale-95"
                >
                  <MessageSquare size={18} /> Send Message
                </button>
              </div>
            ) : (
              <div className="py-4 space-y-4">
                <p className="text-sm font-bold text-slate-400">Currently unassigned. Awaiting resource allocation.</p>
                <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-sm transition-all">
                  Assign Resources
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
            <h3 className="text-lg font-black text-slate-950 dark:text-white">Admin Actions</h3>
            <div className="space-y-3">
              {task.status !== 'Complete' && (
                <button 
                  onClick={() => onStatusChange(task.id, 'Complete')}
                  className="w-full flex items-center justify-between px-5 py-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-2xl font-black text-sm hover:bg-green-100 dark:hover:bg-green-900/40 transition-all group"
                >
                  Mark as Complete
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              {task.status !== 'In Progress' && task.status !== 'Complete' && (
                <button 
                  onClick={() => onStatusChange(task.id, 'In Progress')}
                  className="w-full flex items-center justify-between px-5 py-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-2xl font-black text-sm hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all group"
                >
                  Activate Task
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              {task.status !== 'Canceled' && task.status !== 'Complete' && (
                <button 
                  onClick={() => onStatusChange(task.id, 'Canceled')}
                  className="w-full flex items-center justify-between px-5 py-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-2xl font-black text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-all group"
                >
                  Cancel Request
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
