import React from 'react';
import { X, Clock, BarChart3, Moon, Sparkles } from 'lucide-react';
import { useUserStore } from '../../store/useUserStore';

interface WatchTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WatchTimeModal({ isOpen, onClose }: WatchTimeModalProps) {
  const { watchTimeMinutesToday } = useUserStore();

  if (!isOpen) return null;

  const hours = Math.floor(watchTimeMinutesToday / 60);
  const mins = watchTimeMinutesToday % 60;

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const mockWeeklyData = [25, 40, 15, 60, 30, 90, watchTimeMinutesToday];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#212121] text-neutral-900 dark:text-white rounded-3xl w-full max-w-md shadow-2xl p-6 border border-neutral-200 dark:border-white/10 transition-colors">
        
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-bold">Time Watched</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-neutral-600 dark:text-white/70" />
          </button>
        </div>

        <div className="py-5 flex flex-col gap-6">
          {/* Today summary */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-5 flex items-center justify-between shadow-lg">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-blue-100">Today's Watch Time</span>
              <div className="text-3xl font-extrabold mt-1">
                {hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`}
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <Sparkles className="w-8 h-8 text-yellow-300" />
            </div>
          </div>

          {/* Weekly Bar Chart */}
          <div>
            <h4 className="text-xs font-bold text-neutral-500 dark:text-white/60 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Daily Breakdown (Minutes)
            </h4>
            <div className="flex items-end justify-between gap-2 h-28 pt-4 px-2 border-b border-neutral-200 dark:border-white/10">
              {days.map((day, idx) => {
                const val = mockWeeklyData[idx];
                const heightPercent = Math.min(100, Math.max(15, (val / 100) * 100));
                const isToday = idx === 6;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-bold text-neutral-500 dark:text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                      {val}m
                    </span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-lg transition-all ${
                        isToday ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-white/20 hover:bg-blue-400'
                      }`}
                    />
                    <span className={`text-[11px] font-semibold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-neutral-500 dark:text-white/60'}`}>
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reminders controls */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-100 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-indigo-500" />
                <div>
                  <div className="text-xs font-bold">Bedtime Reminder</div>
                  <div className="text-[11px] text-neutral-500 dark:text-white/60">Remind me when it's time to sleep</div>
                </div>
              </div>
              <input type="checkbox" className="w-4 h-4 accent-blue-600 rounded cursor-pointer" defaultChecked />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
