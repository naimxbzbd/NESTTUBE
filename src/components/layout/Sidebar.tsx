import React, { useState } from 'react';
import { Home, Compass, PlaySquare, Clock, ThumbsUp, History as HistoryIcon, MonitorPlay, Flame, Radio, Code2, Mail, Sparkles, MessageSquare, Crown, Handshake, X, ListVideo } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useUserStore } from '../../store/useUserStore';
import { ContactDeveloperModal } from './ContactDeveloperModal';
import { SponsorshipModal } from './SponsorshipModal';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const location = useLocation();
  const { subscribedChannels, playlists } = useUserStore();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSponsorshipOpen, setIsSponsorshipOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleLinkClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar py-3 text-neutral-900 dark:text-white">
      {/* Mobile Header in Drawer */}
      {isMobileOpen && (
        <div className="flex items-center justify-between px-4 pb-3 mb-2 border-b border-neutral-200 dark:border-white/10 md:hidden">
          <Link to="/" onClick={handleLinkClick} className="flex items-center gap-2">
            <div className="bg-[#ff0000] w-7 h-5 rounded flex items-center justify-center shrink-0 shadow-sm">
              <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[6px] border-l-white border-b-[3px] border-b-transparent ml-0.5"></div>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-extrabold tracking-tight uppercase leading-none">NESTTUBE</span>
              <span className="text-[10px] text-neutral-500 dark:text-white/60 font-normal leading-none mt-0.5">by Naim Xbz</span>
            </div>
          </Link>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-500 dark:text-white/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-3">
        {/* Main Navigation */}
        <Link
          to="/"
          onClick={handleLinkClick}
          className={cn(
            "rounded-xl px-3 py-2.5 flex items-center gap-5 cursor-pointer transition-colors text-sm font-medium",
            isActive('/')
              ? "bg-neutral-200/80 dark:bg-white/10 font-bold"
              : "hover:bg-neutral-100 dark:hover:bg-white/5"
          )}
        >
          <Home className="w-6 h-6" fill={isActive('/') ? "currentColor" : "none"} />
          <span>Home</span>
        </Link>

        <Link
          to="/shorts"
          onClick={handleLinkClick}
          className={cn(
            "rounded-xl px-3 py-2.5 flex items-center gap-5 cursor-pointer transition-colors text-sm font-medium",
            isActive('/shorts')
              ? "bg-neutral-200/80 dark:bg-white/10 font-bold"
              : "hover:bg-neutral-100 dark:hover:bg-white/5"
          )}
        >
          <MonitorPlay className="w-6 h-6" />
          <span>Shorts</span>
        </Link>

        <Link
          to="/subscriptions"
          onClick={handleLinkClick}
          className={cn(
            "rounded-xl px-3 py-2.5 flex items-center gap-5 cursor-pointer transition-colors text-sm font-medium",
            isActive('/subscriptions')
              ? "bg-neutral-200/80 dark:bg-white/10 font-bold"
              : "hover:bg-neutral-100 dark:hover:bg-white/5"
          )}
        >
          <PlaySquare className="w-6 h-6" />
          <span>Subscriptions</span>
        </Link>

        <Link
          to="/trending"
          onClick={handleLinkClick}
          className={cn(
            "rounded-xl px-3 py-2.5 flex items-center gap-5 cursor-pointer transition-colors text-sm font-medium",
            isActive('/trending')
              ? "bg-neutral-200/80 dark:bg-white/10 font-bold"
              : "hover:bg-neutral-100 dark:hover:bg-white/5"
          )}
        >
          <Flame className="w-6 h-6 text-amber-500" />
          <span>Trending</span>
        </Link>

        <div className="h-[1px] bg-neutral-200 dark:bg-white/10 my-3 mx-2"></div>

        {/* You / Library Section */}
        <Link
          to="/library"
          onClick={handleLinkClick}
          className={cn(
            "rounded-xl px-3 py-2.5 flex items-center gap-5 cursor-pointer transition-colors text-sm font-medium",
            isActive('/library')
              ? "bg-neutral-200/80 dark:bg-white/10 font-bold"
              : "hover:bg-neutral-100 dark:hover:bg-white/5"
          )}
        >
          <HistoryIcon className="w-6 h-6" />
          <span>Library & History</span>
        </Link>

        <Link
          to="/playlist/watch-later"
          onClick={handleLinkClick}
          className={cn(
            "rounded-xl px-3 py-2.5 flex items-center gap-5 cursor-pointer transition-colors text-sm font-medium",
            isActive('/playlist/watch-later')
              ? "bg-neutral-200/80 dark:bg-white/10 font-bold"
              : "hover:bg-neutral-100 dark:hover:bg-white/5"
          )}
        >
          <Clock className="w-6 h-6" />
          <span>Watch later</span>
        </Link>

        <Link
          to="/playlist/liked"
          onClick={handleLinkClick}
          className={cn(
            "rounded-xl px-3 py-2.5 flex items-center gap-5 cursor-pointer transition-colors text-sm font-medium",
            isActive('/playlist/liked')
              ? "bg-neutral-200/80 dark:bg-white/10 font-bold"
              : "hover:bg-neutral-100 dark:hover:bg-white/5"
          )}
        >
          <ThumbsUp className="w-6 h-6" />
          <span>Liked videos</span>
        </Link>

        {/* Custom Playlists */}
        {playlists.map((pl) => (
          <Link
            key={pl.id}
            to={`/playlist/${pl.id}`}
            onClick={handleLinkClick}
            className={cn(
              "rounded-xl px-3 py-2.5 flex items-center gap-5 cursor-pointer transition-colors text-sm font-medium",
              isActive(`/playlist/${pl.id}`)
                ? "bg-neutral-200/80 dark:bg-white/10 font-bold"
                : "hover:bg-neutral-100 dark:hover:bg-white/5"
            )}
          >
            <ListVideo className="w-6 h-6" />
            <span className="truncate">{pl.title}</span>
          </Link>
        ))}

        <div className="h-[1px] bg-neutral-200 dark:bg-white/10 my-3 mx-2"></div>

        {/* Contact Developer & Sponsorship Nav Items */}
        <button
          onClick={() => { setIsContactOpen(true); handleLinkClick(); }}
          className="w-full rounded-xl px-3 py-2.5 flex items-center gap-5 cursor-pointer transition-colors text-sm font-medium hover:bg-blue-500/10 text-neutral-900 dark:text-white group"
        >
          <Code2 className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="font-semibold">Contact Developer</span>
          <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Dev
          </span>
        </button>

        <button
          onClick={() => { setIsSponsorshipOpen(true); handleLinkClick(); }}
          className="w-full rounded-xl px-3 py-2.5 flex items-center gap-5 cursor-pointer transition-colors text-sm font-medium hover:bg-amber-500/10 text-neutral-900 dark:text-white group"
        >
          <Crown className="w-6 h-6 text-amber-500 group-hover:scale-110 transition-transform fill-amber-500/20" />
          <span className="font-semibold">Sponsorships</span>
          <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            Sponsor
          </span>
        </button>

        {/* Subscriptions List */}
        {subscribedChannels.length > 0 && (
          <>
            <div className="h-[1px] bg-neutral-200 dark:bg-white/10 my-3 mx-2"></div>
            <div className="px-3 py-2 text-xs font-bold text-neutral-500 dark:text-white/60 uppercase tracking-wider">
              Subscriptions ({subscribedChannels.length})
            </div>
            {subscribedChannels.map((channel) => (
              <Link
                key={channel.id}
                to={`/channel/${channel.id}`}
                onClick={handleLinkClick}
                className="rounded-xl px-3 py-2 flex items-center gap-4 cursor-pointer hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-sm"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {channel.title.charAt(0)}
                </div>
                <span className="truncate">{channel.title}</span>
              </Link>
            ))}
          </>
        )}
      </nav>
      
      {/* Sponsorship Highlight Box */}
      <div className="p-3 mx-3 mb-2 rounded-2xl bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-purple-600/10 border border-amber-500/20 text-neutral-900 dark:text-white">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
            <Crown className="w-4 h-4 fill-amber-500/20" />
          </div>
          <span className="text-xs font-bold">Become a Sponsor</span>
        </div>
        <p className="text-[11px] text-neutral-500 dark:text-white/60 mb-2.5 leading-snug">
          Promote your brand or support top creators on NestTube.
        </p>
        <button
          onClick={() => { setIsSponsorshipOpen(true); handleLinkClick(); }}
          className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Handshake className="w-3.5 h-3.5" />
          <span>Sponsor Us</span>
        </button>
      </div>

      {/* Contact Developer Highlight Box */}
      <div className="p-3 mx-3 mb-2 rounded-2xl bg-neutral-100 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white mt-auto">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold">Have Feedback?</span>
        </div>
        <p className="text-[11px] text-neutral-500 dark:text-white/60 mb-2.5 leading-snug">
          Reach out directly to the developer to report bugs or share ideas.
        </p>
        <button
          onClick={() => { setIsContactOpen(true); handleLinkClick(); }}
          className="w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Contact Developer</span>
        </button>
      </div>

      <div className="px-6 py-3 text-[10px] text-neutral-500 dark:text-white/40 leading-tight font-medium border-t border-neutral-200 dark:border-white/10">
        About Press Copyright<br/>
        <button onClick={() => { setIsContactOpen(true); handleLinkClick(); }} className="hover:underline text-blue-600 dark:text-blue-400 font-semibold cursor-pointer">
          Contact Developer
        </button> •{' '}
        <button onClick={() => { setIsSponsorshipOpen(true); handleLinkClick(); }} className="hover:underline text-amber-600 dark:text-amber-400 font-semibold cursor-pointer">
          Sponsorships
        </button><br/>
        Creators Advertise Developers<br/><br/>
        © 2026 NESTTUBE Studio LLC
      </div>

      {/* Modals */}
      <ContactDeveloperModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      <SponsorshipModal isOpen={isSponsorshipOpen} onClose={() => setIsSponsorshipOpen(false)} />
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-[240px] h-full bg-white dark:bg-[#0f0f0f] border-r border-neutral-200 dark:border-white/10 hidden md:block transition-colors shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={onCloseMobile}
        >
          <div 
            className="w-[280px] h-full bg-white dark:bg-[#0f0f0f] shadow-2xl animate-in slide-in-from-left duration-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
