
import React, { useState } from 'react';
import { X, Save, Package, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { RoomDetail } from '../types';

interface ReplenishmentModalProps {
  room: RoomDetail;
  isOpen: boolean;
  onClose: () => void;
}

export const ReplenishmentModal: React.FC<ReplenishmentModalProps> = ({ room, isOpen, onClose }) => {
  const [requestQuantities, setRequestQuantities] = useState<Record<string, number>>(
    room.inventory.reduce((acc, item) => ({ ...acc, [item.item]: 0 }), {})
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUpdateQuantity = (item: string, delta: number) => {
    setRequestQuantities(prev => ({
      ...prev,
      [item]: Math.max(0, prev[item] + delta)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 1000);
  };

  // Fix: Explicitly type 'a' and 'b' to avoid 'unknown' type errors during arithmetic operations
  const totalItemsRequested = Object.values(requestQuantities).reduce((a: number, b: number) => a + b, 0);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-950 rounded-[40px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {isSuccess ? (
          <div className="p-12 text-center space-y-6 flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Request Logged</h2>
              <p className="text-sm font-bold text-slate-500 mt-2">Logistics team has been dispatched to Room {room.roomNumber}.</p>
            </div>
          </div>
        ) : (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                  <Package size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Replenish Supplies</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Room {room.roomNumber} • Internal Logistics</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {room.inventory.map((item) => (
                  <div 
                    key={item.item} 
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl group transition-all"
                  >
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.item}</p>
                      <p className="text-[10px] font-bold text-slate-400">Current: {item.quantity} {item.unit}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => handleUpdateQuantity(item.item, -1)}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors shadow-sm"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-black text-sm text-slate-900 dark:text-white">
                        {requestQuantities[item.item]}
                      </span>
                      <button 
                        type="button"
                        onClick={() => handleUpdateQuantity(item.item, 1)}
                        className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors shadow-sm"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={totalItemsRequested === 0 || isSubmitting}
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        )}
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
