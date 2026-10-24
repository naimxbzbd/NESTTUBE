import React, { useState } from 'react';
import { Home, Tv, Film, Clock, ThumbsUp, History as HistoryIcon, MonitorPlay, Flame, Coins, Code2, Mail, Sparkles, Handshake, X, ListVideo, Layers } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useUserStore } from '../../store/useUserStore';
import { useCoinStore } from '../../store/useCoinStore';
import { ContactDeveloperModal } from './ContactDeveloperModal';
import { SponsorshipModal } from './SponsorshipModal';
import { AnimatedNestLogo } from './AnimatedNestLogo';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const location = useLocation();
  const { subscribedChannels, playlists } = useUserStore();
  const { coins, openRechargeModal } = useCoinStore();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSponsorshipOpen, setIsSponsorshipOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar py-3 text-white bg-[#0b0f15]">
      {/* Mobile Header in Drawer */}
      {isMobileOpen && (
        <div className="flex items-center justify-between px-4 pb-3 mb-2 border-b border-white/10 md:hidden">
          <AnimatedNestLogo compact onClick={handleLinkClick} />
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-3">
        {/* Main PipraTube Navigation */}
        <Link
          to="/"
          onClick={handleLinkClick}
          className={cn(
            "rounded-xl px-3 py-2.5 flex items-center gap-4 cursor-pointer transition-colors text-sm font-semibold",
            isActive('/')
              ? "bg-white/10 text-[#ff2d6f] font-bold"
              : "text-gray-300 hover:bg-white/5 hover:text-white"
          )}
        >
          <Home className="w-5 h-5" fill={isActive('/') ? "currentColor" : "none"} />
          <span>হোম (Home)</span>
        </Link>

        {/* 24/7 Bangla Live TV with pulsating badge */}
        <Link
          to="/live-tv"
          onClick={handleLinkClick}
          className={cn(
            "rounded-xl px-3 py-2.5 flex items-center justify-between cursor-pointer transition-colors text-sm font-semibold group",
            isActive('/live-tv')
              ? "bg-red-500/15 border border-red-500/30 text-red-400 font-bold"
              : "text-gray-300 hover:bg-white/5 hover:text-white"
          )}
        >
          <div className="flex items-center gap-4">
            <Tv className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
            <span>লাইভ টিভি (Live TV)</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-red-600 text-white uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            LIVE
          </span>
        </Link>

        {/* Shorts */}
        <Link
          to="/shorts"
          onClick={handleLinkClick}
          className={cn(
            "rounded-xl px-3 py-2.5 flex items-center gap-4 cursor-pointer transition-colors text-sm font-semibold",
            isActive('/shorts')
              ? "bg-white/10 text-[#ff2d6f] font-bold"
              : "text-gray-300 hover:bg-white/5 hover:text-white"
          )}
        >
          <MonitorPlay className="w-5 h-5 text-[#ff2d6f]" />
          <span>শর্টস (Shorts)</span>
        </Link>

        {/* Natok & Cinema */}
        <Link
          to="/trending"
          onClick={handleLinkClick}
          className={cn(
            "rounded-xl px-3 py-2.5 flex items-center gap-4 cursor-pointer transition-colors text-sm font-semibold",
            isActive('/trending')
              ? "bg-white/10 text-[#ff2d6f] font-bold"
              : "text-gray-300 hover:bg-white/5 hover:text-white"
          )}
        >
          <Film className="w-5 h-5 text-purple-400" />
          <span>নাটক ও সিনেমা</span>
        </Link>

        {/* Subscriptions */}
        <Link
          to="/subscriptions"
          onClick={handleLinkClick}
          className={cn(
            "rounded-xl px-3 py-2.5 flex items-center gap-4 cursor-pointer transition-colors text-sm font-semibold",
            isActive('/subscriptions')
              ? "bg-white/10 text-[#ff2d6f] font-bold"
              : "text-gray-300 hover:bg-white/5 hover:text-white"
          )}
        >
          <Layers className="w-5 h-5 text-blue-400" />
          <span>সাবস্ক্রিপশন</span>
        </Link>

        <div className="h-[1px] bg-white/10 my-3 mx-2" />

        {/* PipraCoins Wallet Action */}
        <button
          onClick={() => {
            openRechargeModal();
            handleLinkClick();
          }}
          className="w-full rounded-xl px-3 py-2.5 flex items-center justify-between cursor-pointer transition-all text-sm font-semibold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 group"
        >
          <div className="flex items-center gap-4">
            <Coins className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>কয়েন ওয়ালেট</span>
          </div>
          <span className="font-mono text-xs font-bold text-amber-400">
            {coins} 🪙
          </span>
        </button>

        <div className="h-[1px] bg-white/10 my-3 mx-2" />

        {/* Library & Playlists */}
        <Link
          to="/library"
          onClick={handleLinkClick}
          className={cn(
            "rounded-xl px-3 py-2.5 flex items-center gap-4 cursor-pointer transition-colors text-sm font-semibold",
            isActive('/library')
              ? "bg-white/10 text-[#ff2d6f] font-bold"
              : "text-gray-300 hover:bg-white/5 hover:text-white"
          )}
        >
          <HistoryIcon className="w-5 h-5" />
          <span>লাইব্রেরি ও ইতিহাস</span>
        </Link>

        <Link
          to="/playlist/watch-later"
          onClick={handleLinkClick}
          className={cn(
            "rounded-xl px-3 py-2.5 flex items-center gap-4 cursor-pointer transition-colors text-sm font-semibold",
            isActive('/playlist/watch-later')
              ? "bg-white/10 text-[#ff2d6f] font-bold"
              : "text-gray-300 hover:bg-white/5 hover:text-white"
          )}
        >
          <Clock className="w-5 h-5" />
          <span>পরে দেখুন (Watch Later)</span>
        </Link>

        <Link
          to="/playlist/liked"
          onClick={handleLinkClick}
          className={cn(
            "rounded-xl px-3 py-2.5 flex items-center gap-4 cursor-pointer transition-colors text-sm font-semibold",
            isActive('/playlist/liked')
              ? "bg-white/10 text-[#ff2d6f] font-bold"
              : "text-gray-300 hover:bg-white/5 hover:text-white"
          )}
        >
          <ThumbsUp className="w-5 h-5" />
          <span>পছন্দের ভিডিও</span>
        </Link>

        {/* Custom Playlists */}
        {playlists.map((pl) => (
          <Link
            key={pl.id}
            to={`/playlist/${pl.id}`}
            onClick={handleLinkClick}
            className={cn(
              "rounded-xl px-3 py-2.5 flex items-center gap-4 cursor-pointer transition-colors text-sm font-semibold",
              isActive(`/playlist/${pl.id}`)
                ? "bg-white/10 text-[#ff2d6f] font-bold"
                : "text-gray-300 hover:bg-white/5 hover:text-white"
            )}
          >
            <ListVideo className="w-5 h-5" />
            <span className="truncate">{pl.title}</span>
          </Link>
        ))}

        <div className="h-[1px] bg-white/10 my-3 mx-2" />

        {/* Contact Developer & Sponsorships */}
        <button
          onClick={() => { setIsContactOpen(true); handleLinkClick(); }}
          className="w-full rounded-xl px-3 py-2.5 flex items-center gap-4 cursor-pointer transition-colors text-sm font-medium hover:bg-white/5 text-gray-300 hover:text-white group"
        >
          <Code2 className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
          <span>যোগাযোগ (Contact)</span>
        </button>

        <button
          onClick={() => { setIsSponsorshipOpen(true); handleLinkClick(); }}
          className="w-full rounded-xl px-3 py-2.5 flex items-center gap-4 cursor-pointer transition-colors text-sm font-medium hover:bg-white/5 text-gray-300 hover:text-white group"
        >
          <Handshake className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>স্পন্সরশিপ (Sponsor)</span>
        </button>

        {/* Subscriptions List */}
        {subscribedChannels.length > 0 && (
          <>
            <div className="h-[1px] bg-white/10 my-3 mx-2" />
            <div className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              সাবস্ক্রিপশন ({subscribedChannels.length})
            </div>
            {subscribedChannels.map((channel) => (
              <Link
                key={channel.id}
                to={`/channel/${channel.id}`}
                onClick={handleLinkClick}
                className="rounded-xl px-3 py-2 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors text-xs text-gray-300 hover:text-white"
              >
                <div className="w-5 h-5 rounded-full bg-pink-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  {channel.title.charAt(0)}
                </div>
                <span className="truncate">{channel.title}</span>
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* NestTube Branding Footer Note */}
      <div className="px-6 py-4 text-[11px] text-gray-500 leading-tight border-t border-white/10 mt-auto flex items-center gap-2.5">
        <div className="w-8 h-8 flex items-center justify-center shrink-0">
          <img
            src="/assets/aistudio/Gemini_Generated_Image_wmzkkfwmzkkfwmzk__1_-removebg-preview_2f76d2c5.png"
            alt="NestTube"
            className="w-full h-auto object-contain"
          />
        </div>
        <div>
          <p className="font-semibold text-gray-300">NestTube</p>
          <p className="text-[10px] text-gray-500">3D Metallic Entertainment</p>
        </div>
      </div>

      {/* Modals */}
      <ContactDeveloperModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <SponsorshipModal isOpen={isSponsorshipOpen} onClose={() => setIsSponsorshipOpen(false)} />
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-[240px] h-full bg-[#0b0f15] border-r border-white/10 hidden md:block transition-colors shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        >
          <div 
            className="w-[280px] h-full bg-[#0b0f15] shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
