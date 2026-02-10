
import React, { useState } from 'react';
import { X, Save, ClipboardList, Repeat, Calendar } from 'lucide-react';
import { EVSTask, TaskCategory } from '../types';
import { FACILITIES, DEPARTMENTS } from '../constants';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<EVSTask, 'id' | 'createdAt' | 'status' | 'location'>) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave }) => {
  const [isRecurring, setIsRecurring] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: '',
    category: 'EVS' as TaskCategory,
    facility: FACILITIES[1],
    description: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    expectedDuration: 45,
    recurrence: {
      frequency: 'Daily' as 'Daily' | 'Weekly' | 'Monthly',
      endDate: ''
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { recurrence, ...rest } = formData;
    const taskToSave = {
      ...rest,
      recurrence: isRecurring ? recurrence : undefined
    };
    onSave(taskToSave);
    onClose();
    // Reset form
    setFormData({
      roomNumber: '',
      category: 'EVS',
      facility: FACILITIES[1],
      description: '',
      priority: 'Medium',
      expectedDuration: 45,
      recurrence: {
        frequency: 'Daily',
        endDate: ''
      }
    });
    setIsRecurring(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                <ClipboardList size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Create New Task</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual Dispatch Portal</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Room Number</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. 302-B"
                  value={formData.roomNumber}
                  onChange={e => setFormData({...formData, roomNumber: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border-none font-black text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as TaskCategory})}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border-none font-black text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all cursor-pointer"
                >
                  {DEPARTMENTS.filter(d => d !== 'All Departments').map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Facility</label>
              <select 
                value={formData.facility}
                onChange={e => setFormData({...formData, facility: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border-none font-black text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all cursor-pointer"
              >
                {FACILITIES.filter(f => f !== 'All Facilities').map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Description</label>
              <textarea 
                required
                rows={3}
                placeholder="Describe the maintenance or cleaning requirements..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border-none font-black text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                <select 
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value as any})}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border-none font-black text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all cursor-pointer"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Est. Duration (Min)</label>
                <input 
                  type="number" 
                  min="5"
                  max="480"
                  value={formData.expectedDuration}
                  onChange={e => setFormData({...formData, expectedDuration: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border-none font-black text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none transition-all"
                />
              </div>
            </div>

            {/* Recurrence Section */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors ${isRecurring ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                    <Repeat size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Make Recurring</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">Repeat this task automatically</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsRecurring(!isRecurring)}
                  className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 ${isRecurring ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isRecurring ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              {isRecurring && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Frequency</label>
                    <select 
                      value={formData.recurrence.frequency}
                      onChange={e => setFormData({
                        ...formData, 
                        recurrence: { ...formData.recurrence, frequency: e.target.value as any }
                      })}
                      className="w-full bg-white dark:bg-slate-800 p-2.5 rounded-xl border-none font-black text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                    <div className="relative">
                      <Calendar size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input 
                        type="date"
                        value={formData.recurrence.endDate}
                        onChange={e => setFormData({
                          ...formData, 
                          recurrence: { ...formData.recurrence, endDate: e.target.value }
                        })}
                        className="w-full bg-white dark:bg-slate-800 pl-8 pr-2.5 py-2.5 rounded-xl border-none font-black text-xs text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Save size={18} /> Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
