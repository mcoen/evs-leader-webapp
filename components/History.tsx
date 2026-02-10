
import React, { useState, useMemo, useRef } from 'react';
import { EVSTask, TaskStatus } from '../types';
import { DEPARTMENTS, FACILITIES } from '../constants';
import { 
  Search, 
  FileText,
  Calendar as CalendarIcon,
  Building2,
  Filter,
  ArrowRight,
  RotateCcw,
  Clock,
  MapPin,
  Check,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

const calculateDuration = (start: string, end: string) => {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.floor(diff / 60000);
};

interface HistoryProps {
  tasks: EVSTask[];
  selectedFacility: string;
  setSelectedFacility: (f: string) => void;
  onViewTaskDetails: (id: string) => void;
}

interface FilterState {
  searchQuery: string;
  deptFilter: string;
  statusFilter: 'Complete' | 'Canceled' | 'All';
  fromDate: string;
  toDate: string;
  facility: string;
}

type SortField = 'date' | 'duration' | null;
type SortDirection = 'asc' | 'desc';

export const History: React.FC<HistoryProps> = ({ 
  tasks, 
  selectedFacility: globalFacility, 
  setSelectedFacility: setGlobalFacility,
  onViewTaskDetails 
}) => {
  // Staged filter state (what user sees in inputs)
  const [staged, setStaged] = useState<FilterState>({
    searchQuery: '',
    deptFilter: 'All Departments',
    statusFilter: 'All',
    fromDate: '',
    toDate: '',
    facility: globalFacility
  });

  // Applied filter state (what actually filters the list)
  const [applied, setApplied] = useState<FilterState>({
    searchQuery: '',
    deptFilter: 'All Departments',
    statusFilter: 'All',
    fromDate: '',
    toDate: '',
    facility: globalFacility
  });

  // Sorting state
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  const handleApply = () => {
    setApplied({ ...staged });
    // Keep global facility in sync if it changed in the local staged state
    if (staged.facility !== globalFacility) {
      setGlobalFacility(staged.facility);
    }
  };

  const resetFilters = () => {
    const fresh: FilterState = {
      searchQuery: '',
      deptFilter: 'All Departments',
      statusFilter: 'All',
      fromDate: '',
      toDate: '',
      facility: 'All Facilities'
    };
    setStaged(fresh);
    setApplied(fresh);
    setSortField(null);
    setGlobalFacility('All Facilities');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleOpenFrom = () => {
    if (fromRef.current && 'showPicker' in fromRef.current) {
      (fromRef.current as any).showPicker();
    } else {
      fromRef.current?.focus();
    }
  };

  const handleOpenTo = () => {
    if (toRef.current && 'showPicker' in toRef.current) {
      (toRef.current as any).showPicker();
    } else {
      toRef.current?.focus();
    }
  };

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(task => {
      // Only show completed or canceled tasks in history
      if (task.status !== 'Complete' && task.status !== 'Canceled') return false;

      const matchesFacility = applied.facility === 'All Facilities' || task.facility === applied.facility;
      const matchesDept = applied.deptFilter === 'All Departments' || task.category === applied.deptFilter;
      const matchesStatus = applied.statusFilter === 'All' || task.status === applied.statusFilter;
      const matchesSearch = 
        task.roomNumber.toLowerCase().includes(applied.searchQuery.toLowerCase()) || 
        task.description.toLowerCase().includes(applied.searchQuery.toLowerCase()) ||
        (task.assignedTo && task.assignedTo.toLowerCase().includes(applied.searchQuery.toLowerCase()));

      // Date filtering strictly on Completion Date (endTime)
      let matchesDate = true;
      const taskCompletionDate = task.endTime ? new Date(task.endTime) : new Date(task.createdAt);
      
      if (applied.fromDate) {
        const start = new Date(applied.fromDate);
        start.setHours(0, 0, 0, 0);
        if (taskCompletionDate < start) matchesDate = false;
      }
      if (applied.toDate) {
        const end = new Date(applied.toDate);
        end.setHours(23, 59, 59, 999);
        if (taskCompletionDate > end) matchesDate = false;
      }

      return matchesFacility && matchesDept && matchesStatus && matchesSearch && matchesDate;
    });

    // Apply Sorting
    if (sortField) {
      result.sort((a, b) => {
        let valA: number;
        let valB: number;

        if (sortField === 'date') {
          valA = new Date(a.endTime || a.createdAt).getTime();
          valB = new Date(b.endTime || b.createdAt).getTime();
        } else {
          // duration
          valA = a.startTime && a.endTime ? calculateDuration(a.startTime, a.endTime) : 0;
          valB = b.startTime && b.endTime ? calculateDuration(b.startTime, b.endTime) : 0;
        }

        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
    }

    return result;
  }, [tasks, applied, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />;
  };

  return (
    <div className="pt-4 md:pt-8 space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">History</h1>
          <p className="text-slate-800 dark:text-gray-400 font-bold mt-1">Search past tasks.</p>
        </div>
        <button 
          onClick={resetFilters}
          className="flex items-center gap-2 px-4 py-2 text-sm font-black text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
        >
          <RotateCcw size={16} /> Reset All Filters
        </button>
      </div>

      {/* Two-Row Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Row 1: Full-Width Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search history by room, worker, or task description..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all placeholder:text-slate-400"
            value={staged.searchQuery}
            onChange={(e) => setStaged(prev => ({ ...prev, searchQuery: e.target.value }))}
          />
        </div>

        {/* Row 2: Secondary Filters + Apply Button */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Date Selector: From */}
          <div className="relative group cursor-pointer" onClick={handleOpenFrom}>
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none group-focus-within:text-blue-700" size={14} />
            <input 
              ref={fromRef}
              type="date" 
              value={staged.fromDate}
              onChange={(e) => setStaged(prev => ({ ...prev, fromDate: e.target.value }))}
              onClick={(e) => e.stopPropagation()}
              className="pl-9 pr-3 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-[10px] font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer w-[140px] block"
            />
            <span className="absolute -top-2 left-3 px-1 bg-white dark:bg-slate-900 text-[8px] font-black text-slate-400 uppercase tracking-tighter">From</span>
          </div>

          <ArrowRight size={14} className="text-slate-300 hidden sm:block" />

          {/* Date Selector: To */}
          <div className="relative group cursor-pointer" onClick={handleOpenTo}>
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none group-focus-within:text-blue-700" size={14} />
            <input 
              ref={toRef}
              type="date" 
              value={staged.toDate}
              onChange={(e) => setStaged(prev => ({ ...prev, toDate: e.target.value }))}
              onClick={(e) => e.stopPropagation()}
              className="pl-9 pr-3 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl text-[10px] font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer w-[140px] block"
            />
            <span className="absolute -top-2 left-3 px-1 bg-white dark:bg-slate-900 text-[8px] font-black text-slate-400 uppercase tracking-tighter">To</span>
          </div>

          {/* Facility Filter */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-transparent focus-within:ring-2 focus-within:ring-blue-600">
            <Building2 size={14} className="text-slate-400" />
            <select 
              value={staged.facility}
              onChange={(e) => setStaged(prev => ({ ...prev, facility: e.target.value }))}
              className="bg-transparent border-none outline-none text-[10px] font-black text-slate-900 dark:text-white cursor-pointer pr-2"
            >
              {FACILITIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-transparent focus-within:ring-2 focus-within:ring-blue-600">
            <Filter size={14} className="text-slate-400" />
            <select 
              value={staged.deptFilter}
              onChange={(e) => setStaged(prev => ({ ...prev, deptFilter: e.target.value }))}
              className="bg-transparent border-none outline-none text-[10px] font-black text-slate-900 dark:text-white cursor-pointer pr-2"
            >
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-transparent focus-within:ring-2 focus-within:ring-blue-600">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
            <select 
              value={staged.statusFilter}
              onChange={(e) => setStaged(prev => ({ ...prev, statusFilter: e.target.value as any }))}
              className="bg-transparent border-none outline-none text-[10px] font-black text-slate-900 dark:text-white cursor-pointer pr-2"
            >
              <option value="All">All Outcomes</option>
              <option value="Complete">Complete</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Apply Button */}
          <button 
            onClick={handleApply}
            className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black transition-all shadow-md active:scale-95 whitespace-nowrap"
          >
            <Check size={16} /> Apply Filters
          </button>

        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th 
                  className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Completed Date
                    <SortIcon field="date" />
                  </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Facility / Room</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Task Details</th>
                <th 
                  className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest cursor-pointer hover:text-blue-600 transition-colors"
                  onClick={() => handleSort('duration')}
                >
                  <div className="flex items-center">
                    Duration
                    <SortIcon field="duration" />
                  </div>
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Staff Member</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTasks.map(task => (
                <tr 
                  key={task.id} 
                  onClick={() => onViewTaskDetails(task.id)}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all cursor-pointer group"
                >
                  <td className="px-6 py-5 whitespace-nowrap">
                    <p className="text-sm font-black text-slate-900 dark:text-slate-100">
                      {new Date(task.endTime || task.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                      {new Date(task.endTime || task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <MapPin size={14} className="text-blue-600" />
                       <div>
                          <p className="font-black text-slate-900 dark:text-slate-200">Room {task.roomNumber}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase">{task.facility}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">{task.description}</p>
                    <p className="text-[10px] font-black text-blue-600 uppercase mt-0.5">{task.category}</p>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    {task.startTime && task.endTime ? (
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                          {calculateDuration(task.startTime, task.endTime)} min
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                        {task.assignedTo ? task.assignedTo.split(' ').map(n => n[0]).join('') : 'S'}
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-400">{task.assignedTo || 'Staff'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right whitespace-nowrap">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      task.status === 'Complete' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' 
                        : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                    }`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full">
                        <FileText size={48} className="text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-sm">No historical records found</p>
                      <button onClick={resetFilters} className="text-xs font-black text-blue-600 hover:underline">Clear all filters</button>
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
