import React from 'react';
import { Home, Tv, MonitorPlay, Layers, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function MobileNav() {
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0b0f15]/95 backdrop-blur-lg border-t border-white/10 grid grid-cols-5 items-center z-40 text-white px-1">
      {/* Home */}
      <Link 
        to="/" 
        className="flex flex-col items-center justify-center gap-1 py-1 text-center"
      >
        <Home 
          className={cn("w-5 h-5", location.pathname === '/' ? "text-[#ff2d6f]" : "text-gray-400")} 
          fill={location.pathname === '/' ? "currentColor" : "none"} 
        />
        <span className={cn("text-[10px]", location.pathname === '/' ? "font-bold text-[#ff2d6f]" : "text-gray-400")}>
          হোম
        </span>
      </Link>

      {/* Live TV */}
      <Link 
        to="/live-tv" 
        className="flex flex-col items-center justify-center gap-1 py-1 text-center relative"
      >
        <div className="relative">
          <Tv 
            className={cn("w-5 h-5", location.pathname === '/live-tv' ? "text-red-500" : "text-gray-400")} 
          />
          <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-red-600 text-[8px] font-black rounded-full text-white leading-tight">
            LIVE
          </span>
        </div>
        <span className={cn("text-[10px]", location.pathname === '/live-tv' ? "font-bold text-red-500" : "text-gray-400")}>
          লাইভ টিভি
        </span>
      </Link>

      {/* Shorts */}
      <Link 
        to="/shorts" 
        className="flex flex-col items-center justify-center gap-1 py-1 text-center"
      >
        <MonitorPlay 
          className={cn("w-5 h-5", location.pathname === '/shorts' ? "text-[#ff2d6f]" : "text-gray-400")} 
        />
        <span className={cn("text-[10px]", location.pathname === '/shorts' ? "font-bold text-[#ff2d6f]" : "text-gray-400")}>
          শর্টস
        </span>
      </Link>

      {/* Subscriptions */}
      <Link 
        to="/subscriptions" 
        className="flex flex-col items-center justify-center gap-1 py-1 text-center"
      >
        <Layers 
          className={cn("w-5 h-5", location.pathname === '/subscriptions' ? "text-[#ff2d6f]" : "text-gray-400")} 
        />
        <span className={cn("text-[10px]", location.pathname === '/subscriptions' ? "font-bold text-[#ff2d6f]" : "text-gray-400")}>
          সাবস্ক্রিপশন
        </span>
      </Link>

      {/* You / Library */}
      <Link 
        to="/library" 
        className="flex flex-col items-center justify-center gap-1 py-1 text-center"
      >
        <User 
          className={cn("w-5 h-5", location.pathname === '/library' ? "text-[#ff2d6f]" : "text-gray-400")} 
        />
        <span className={cn("text-[10px]", location.pathname === '/library' ? "font-bold text-[#ff2d6f]" : "text-gray-400")}>
          আপনি
        </span>
      </Link>
    </div>
  );
}
