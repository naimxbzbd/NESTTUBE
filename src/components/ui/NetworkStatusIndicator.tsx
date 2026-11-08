import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi, AlertCircle, RefreshCw } from 'lucide-react';

export const NetworkStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredNotice(true);
      const timer = setTimeout(() => {
        setShowRestoredNotice(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredNotice(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showRestoredNotice) {
    return null;
  }

  return (
    <div className="fixed top-16 right-4 z-50 max-w-sm animate-in slide-in-from-top duration-300 pointer-events-auto">
      {!isOnline ? (
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-red-950/90 border border-red-500/40 text-red-200 backdrop-blur-md shadow-2xl shadow-red-950/50">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 shrink-0">
            <WifiOff className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <div className="font-bold text-white flex items-center gap-1.5 mb-0.5">
              <span>ইন্টারনেট সংযোগ বিচ্ছিন্ন (Offline)</span>
            </div>
            <p className="text-red-300/90 leading-relaxed text-[11px]">
              আপনার ইন্টারনেট কানেকশন চেক করুন। ভিডিও ও প্লেলিস্ট লোড না হলে পুনঃসংযোগ হওয়া পর্যন্ত অপেক্ষা করুন।
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 backdrop-blur-md shadow-2xl shadow-emerald-950/50">
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <Wifi className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="font-semibold text-white">ইন্টারনেট পুনঃসংযোগ হয়েছে</span>
            <p className="text-emerald-300/80 text-[10px]">স্ট্রিমগুলো স্বাভাবিক গতিতে চলবে।</p>
          </div>
        </div>
      )}
    </div>
  );
};
