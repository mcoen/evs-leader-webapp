
import React, { useState, useEffect } from 'react';
import { EVSTask, TaskStatus } from '../types';
import { DEPARTMENTS, FACILITIES } from '../constants';
import { CancelTaskModal } from './CancelTaskModal';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  XCircle,
  Timer,
  Building2,
  MessageSquare,
  Activity,
  ArrowUpRight,
  Ban
} from 'lucide-react';

// Sub-component for real-time elapsed time
const ElapsedTimer: React.FC<{ startTime: string }> = ({ startTime }) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const update = () => {
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const diff = now - start;
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setElapsed(`${mins}m ${secs.toString().padStart(2, '0')}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span className="font-mono text-blue-700 dark:text-blue-400 font-black">{elapsed}</span>;
};

const calculateDuration = (start: string, end: string) => {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.floor(diff / 60000);
};

// Logic to determine if a task is overdue (InProgress and past expected duration)
const isTaskOverdue = (task: EVSTask) => {
  if (task.status !== 'In Progress' || !task.startTime) return false;
  const start = new Date(task.startTime).getTime();
  const now = new Date().getTime();
  const elapsedMins = (now - start) / 60000;
  return elapsedMins > task.expectedDuration;
};

// Logic to determine if a task is escalated
const isTaskEscalated = (task: EVSTask) => {
  return !!task.isEscalated;
};

interface TaskListProps {
  tasks: EVSTask[];
  onAddTask: () => void;
  onDeleteTask: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  selectedFacility: string;
  setSelectedFacility: (f: string) => void;
  onMessageEmployee: (name: string) => void;
  onViewTaskDetails: (id: string) => void;
  onViewRoomDetails: (roomNumber: string, facility: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  onAddTask, 
  onDeleteTask, 
  onStatusChange,
  selectedFacility,
  setSelectedFacility,
  onMessageEmployee,
  onViewTaskDetails,
  onViewRoomDetails
}) => {
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'All'>('All');
  const [deptFilter, setDeptFilter] = useState<string>('All Departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSnapshot, setActiveSnapshot] = useState<string>('total');
  
  // State for task cancellation workflow
  const [cancelingTask, setCancelingTask] = useState<EVSTask | null>(null);

  const filteredTasks = tasks.filter(task => {
    const matchesFacility = selectedFacility === 'All Facilities' || task.facility === selectedFacility;
    const matchesDept = deptFilter === 'All Departments' || task.category === deptFilter;
    const matchesSearch = task.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (task.assignedTo && task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Explicit Status Filter (Dropdown)
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;

    // Snapshot Specific Filters (KPI Cards)
    let matchesSnapshot = true;
    if (activeSnapshot === 'completed') matchesSnapshot = task.status === 'Complete';
    else if (activeSnapshot === 'inProgress') matchesSnapshot = task.status === 'In Progress';
    else if (activeSnapshot === 'overdue') matchesSnapshot = isTaskOverdue(task);
    else if (activeSnapshot === 'escalated') matchesSnapshot = isTaskEscalated(task);

    return matchesFacility && matchesDept && matchesSearch && matchesStatus && matchesSnapshot;
  });

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'Complete': return <CheckCircle2 className="text-green-600" size={16}/>;
      case 'In Progress': return <Clock className="text-blue-600" size={16}/>;
      case 'Not Started': return <AlertCircle className="text-slate-700" size={16}/>;
      case 'Canceled': return <XCircle className="text-red-600" size={16}/>;
    }
  };

  const calculateExpectedEnd = (startTime: string, durationMins: number) => {
    const date = new Date(startTime);
    date.setMinutes(date.getMinutes() + durationMins);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const facilityTasks = tasks.filter(t => selectedFacility === 'All Facilities' || t.facility === selectedFacility);
  const total = facilityTasks.length;
  
  const getPercent = (count: number) => total > 0 ? Math.round((count / total) * 100) : 0;

  const completedCount = facilityTasks.filter(t => t.status === 'Complete').length;
  const inProgressCount = facilityTasks.filter(t => t.status === 'In Progress').length;
  const overdueCount = facilityTasks.filter(t => isTaskOverdue(t)).length;
  const escalatedCount = facilityTasks.filter(t => isTaskEscalated(t)).length;

  const snapshots = [
    { id: 'total', label: 'Total Tasks', value: total, sub: null, color: 'text-slate-900', bgColor: 'bg-white' },
    { id: 'completed', label: 'Completed', value: completedCount, sub: `${getPercent(completedCount)}%`, color: 'text-green-800', bgColor: 'bg-white' },
    { id: 'inProgress', label: 'In Progress', value: inProgressCount, sub: `${getPercent(inProgressCount)}%`, color: 'text-blue-800', bgColor: 'bg-white' },
    { id: 'overdue', label: 'Overdue', value: overdueCount, sub: `${getPercent(overdueCount)}%`, color: 'text-red-800', bgColor: 'bg-white' },
    { id: 'escalated', label: 'Escalated', value: escalatedCount, sub: `${getPercent(escalatedCount)}%`, color: 'text-amber-800', bgColor: 'bg-white' },
  ];

  const todayStaffHealth = 92; 

  const handleCancelTask = (taskId: string, reason: string) => {
    // In a real app, we might store the reason in the task metadata.
    // Here we update the status to Canceled.
    onStatusChange(taskId, 'Canceled');
    console.log(`Task ${taskId} canceled. Reason: ${reason}`);
  };

  return (
    <div className="pt-4 md:pt-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Today's Workload</h1>
          <p className="text-slate-800 dark:text-gray-400 font-bold mt-1 uppercase text-[10px] tracking-widest">Real-time oversight for {selectedFacility}.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
              <Activity size={18} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Schedule Health</p>
              <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{todayStaffHealth}%</p>
            </div>
          </div>
          <button 
            onClick={onAddTask}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={20}/> New Task
          </button>
        </div>
      </div>

      {/* Today's Snapshots */}
      <section className="space-y-4">
        <h2 className="text-xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
          <Clock size={20} className="text-blue-700"/> Today's Snapshots
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {snapshots.map((snap) => (
            <button
              key={snap.id}
              onClick={() => setActiveSnapshot(snap.id)}
              className={`text-left p-6 rounded-3xl border transition-all duration-200 group relative ${
                activeSnapshot === snap.id 
                  ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-900/20 shadow-lg scale-[1.02]' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-blue-300 dark:hover:border-blue-700'
              }`}
            >
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 transition-colors ${
                activeSnapshot === snap.id ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-gray-400'
              }`}>
                {snap.label}
              </p>
              <div className="flex items-baseline gap-2">
                <p className={`text-3xl font-black transition-colors ${
                  activeSnapshot === snap.id ? 'text-blue-800 dark:text-blue-300' : 'text-slate-900 dark:text-white'
                }`}>
                  {snap.value}
                </p>
                {snap.sub && (
                  <span className={`text-xs font-black transition-colors ${
                    activeSnapshot === snap.id ? 'text-blue-600 dark:text-blue-500' : 'text-slate-400'
                  }`}>
                    ({snap.sub})
                  </span>
                )}
              </div>
              {activeSnapshot === snap.id && (
                <div className="absolute top-3 right-3 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </section>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[280px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 dark:text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Room, Asset, or Worker..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-black focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white">
            <Building2 size={16} className="text-slate-500" />
            <select 
              className="bg-transparent border-none outline-none cursor-pointer pr-4"
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
            >
              {FACILITIES.map(f => <option key={f} value={f} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{f}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <select 
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-black px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'All')}
            >
              <option value="All">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">Active</option>
              <option value="Complete">Complete</option>
              <option value="Canceled">Canceled</option>
            </select>

            <select 
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-black px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white cursor-pointer"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-900 dark:text-slate-400 tracking-widest">Facility / Room</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-900 dark:text-slate-400 tracking-widest">Department / Task</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-900 dark:text-slate-400 tracking-widest">Timing & Timer</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-900 dark:text-slate-400 tracking-widest">Assignment</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-900 dark:text-slate-400 tracking-widest">Status</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase text-slate-900 dark:text-slate-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTasks.map(task => {
                const isOverdue = isTaskOverdue(task);
                const isEscalated = isTaskEscalated(task);
                return (
                  <tr 
                    key={task.id} 
                    onClick={() => onViewTaskDetails(task.id)}
                    className={`group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer ${isEscalated ? 'bg-amber-50/20 dark:bg-amber-900/5' : ''}`}
                  >
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <div 
                          className="hover:bg-blue-50 dark:hover:bg-blue-900/40 p-1.5 rounded-xl transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800 group/room"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewRoomDetails(task.roomNumber, task.facility);
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            <p className="font-black text-slate-900 dark:text-slate-200 group-hover/room:text-blue-600">Room {task.roomNumber}</p>
                            <ArrowUpRight size={12} className="text-blue-600 opacity-0 group-hover/room:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-[10px] font-black text-slate-700 dark:text-slate-400 uppercase">{task.facility}</p>
                        </div>
                        {isEscalated && (
                          <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase border border-amber-200 dark:border-amber-800">
                            Escalated
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-sm font-black text-slate-900 dark:text-slate-100">{task.description}</p>
                      <p className="text-[10px] font-black text-blue-700 dark:text-blue-500 uppercase mt-0.5">{task.category}</p>
                    </td>
                    <td className="px-4 py-5">
                      {task.status === 'Complete' && task.startTime && task.endTime ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-green-600 font-black text-sm">
                             <CheckCircle2 size={14} />
                             <span>{calculateDuration(task.startTime, task.endTime)} min</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-black uppercase">Final Duration</div>
                        </div>
                      ) : task.startTime && task.status === 'In Progress' ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Timer size={14} className={isOverdue ? "text-red-600 animate-pulse" : "text-blue-700"} />
                            <ElapsedTimer startTime={task.startTime} />
                          </div>
                          <div className="flex flex-col text-[10px] text-slate-800 dark:text-slate-400 font-black">
                            <span>Started: {new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className={isOverdue ? "text-red-600" : ""}>
                              Est. End: {calculateExpectedEnd(task.startTime, task.expectedDuration)} ({task.expectedDuration}m)
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-black text-slate-500">
                          {task.status === 'Canceled' ? 'Canceled' : 'Not Started'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] flex items-center justify-center font-black border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white shadow-sm">
                          {task.assignedTo ? task.assignedTo.split(' ').map(n => n[0]).join('') : (task.status === 'Complete' ? 'S' : '?')}
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-gray-400">
                          {task.assignedTo || (task.status === 'Complete' ? 'Staff' : 'Pending...')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(task.status)}
                        <span className="text-xs font-black uppercase text-slate-900 dark:text-slate-200">{task.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {task.assignedTo && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onMessageEmployee(task.assignedTo!); }}
                            title={`Message ${task.assignedTo}`}
                            className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                          >
                            <MessageSquare size={18}/>
                          </button>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); setCancelingTask(task); }}
                          title="Cancel Task"
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-700 text-slate-700 dark:text-slate-400 transition-colors rounded-xl"
                        >
                          <Ban size={18}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-20 text-center">
                    <p className="text-slate-400 font-black uppercase tracking-widest text-sm">No tasks match this filter</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CancelTaskModal 
        task={cancelingTask}
        isOpen={!!cancelingTask}
        onClose={() => setCancelingTask(null)}
        onConfirm={handleCancelTask}
      />
    </div>
  );
};
