
import React, { useState } from 'react';
import { X, Ban, AlertCircle, Check } from 'lucide-react';
import { EVSTask } from '../types';

interface CancelTaskModalProps {
  task: EVSTask | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (taskId: string, reason: string) => void;
}

const CANCEL_REASONS = [
  "Patient still in room / Not discharged",
  "Room still occupied by clinical staff",
  "Duplicate request created in error",
  "Incorrect room number provided",
  "Patient condition changed - cleaning deferred",
  "Assigned staff member unavailable",
  "Equipment / Supply shortage",
  "Other (Requires comment in notes)"
];

export const CancelTaskModal: React.FC<CancelTaskModalProps> = ({ task, isOpen, onClose, onConfirm }) => {
  const [selectedReason, setSelectedReason] = useState<string>('');

  if (!isOpen || !task) return null;

  const handleConfirm = () => {
    if (selectedReason) {
      onConfirm(task.id, selectedReason);
      setSelectedReason('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/40 text-red-600 rounded-2xl shadow-sm">
                <Ban size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Cancel Request</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Room {task.roomNumber} • {task.facility}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-2xl flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs font-bold text-amber-800 dark:text-amber-400 leading-relaxed">
              Canceling a task requires a valid operational reason for compliance and throughput audit logs.
            </p>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2">Select Cancellation Reason</p>
            {CANCEL_REASONS.map((reason) => (
              <button
                key={reason}
                onClick={() => setSelectedReason(reason)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl text-left text-xs font-black transition-all border ${
                  selectedReason === reason 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20 scale-[1.02]' 
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                {reason}
                {selectedReason === reason && <Check size={14} />}
              </button>
            ))}
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Back
            </button>
            <button 
              onClick={handleConfirm}
              disabled={!selectedReason}
              className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Cancel
            </button>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
        }
      `}} />
    </div>
  );
};
