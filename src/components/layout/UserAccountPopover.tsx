import React from 'react';
import {
  User,
  Sun,
  Moon,
  Clock,
  PlaySquare,
  Bookmark,
  ThumbsUp,
  LogOut,
  Settings,
  ChevronRight,
  ShieldCheck,
  Code2,
  Sparkles,
  Shield,
  Crown,
  Video,
  Sliders,
  Tv,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';
import { usePaymentStore } from '../../store/usePaymentStore';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface UserAccountPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWatchTime: () => void;
  onOpenContactDeveloper?: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export function UserAccountPopover({
  isOpen,
  onClose,
  onOpenWatchTime,
  onOpenContactDeveloper,
  isDarkMode,
  toggleDarkMode,
}: UserAccountPopoverProps) {
  const { subscribedChannels, watchLaterVideos, likedVideos, isPremium, currentUser } = useUserStore();
  const { openBkashModal, openAdminModal, paymentRequests } = usePaymentStore();
  const { userProfile, isAdmin, isCreator, role, logout } = useAuth();

  if (!isOpen || !currentUser) return null;

  const pendingAdminCount = paymentRequests.filter((r) => r.status === 'pending').length;

  const handleDeveloperProfileClick = () => {
    onClose();
    if (onOpenContactDeveloper) {
      onOpenContactDeveloper();
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="absolute right-4 top-14 z-50 w-80 bg-[#0d1117]/95 backdrop-blur-2xl text-white rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 transition-colors">
        {/* User Card */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-gradient-to-r from-white/5 to-transparent">
          <div className="relative">
            <div
              className={cn(
                "w-12 h-12 rounded-full text-white font-bold flex items-center justify-center shrink-0 shadow-md uppercase text-sm",
                isAdmin
                  ? "bg-gradient-to-tr from-purple-600 via-pink-600 to-rose-600 ring-2 ring-purple-400 shadow-purple-500/30"
                  : isPremium
                  ? "bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 ring-2 ring-amber-400 shadow-amber-500/20"
                  : "bg-gradient-to-tr from-[#ff2d6f] to-[#c026d3]"
              )}
            >
              {currentUser.name.charAt(0)}
            </div>
            {isAdmin ? (
              <span className="absolute -bottom-1 -right-1 px-1.5 py-[1px] bg-black text-purple-400 text-[8px] font-black uppercase rounded-full shadow-md border border-purple-400 flex items-center gap-0.5 leading-none">
                <Shield className="w-2 h-2 fill-purple-400 shrink-0" />
                <span>ADMIN</span>
              </span>
            ) : isPremium ? (
              <span className="absolute -bottom-1 -right-1 px-1 py-[0.5px] bg-black text-amber-400 text-[8px] font-black uppercase rounded-full shadow-md border border-amber-400 flex items-center gap-0.5 leading-none">
                <Crown className="w-2 h-2 fill-amber-400 shrink-0" />
                <span>PRO</span>
              </span>
            ) : null}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm truncate">{currentUser.name}</span>
              {isAdmin ? (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 border border-purple-500/50 text-purple-300 text-[9px] font-black uppercase tracking-wider">
                  Admin
                </span>
              ) : isCreator ? (
                <span className="px-1.5 py-0.2 rounded-full bg-pink-500/30 border border-pink-500/50 text-pink-300 text-[9px] font-black uppercase tracking-wider">
                  Creator
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-full bg-white/10 text-neutral-400 text-[9px] font-bold uppercase tracking-wider">
                  Viewer
                </span>
              )}
            </div>
            <span className="text-xs text-white/60 truncate font-mono">{currentUser.email}</span>
            <span className="text-[11px] text-pink-400 font-medium truncate">
              {userProfile?.channelHandle || `@${currentUser.name.toLowerCase().replace(/\s+/g, '')}`}
            </span>
          </div>
        </div>

        {/* Primary Studio & Admin Quick Navigation */}
        <div className="p-2 border-b border-white/10 space-y-1">
          <Link
            to="/studio"
            onClick={onClose}
            className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-white transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs block text-pink-300">NestTube Studio</span>
                <span className="text-[10px] text-neutral-400 block">ভিডিও আপলোড ও চ্যানেল ড্যাশবোর্ড</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-pink-400" />
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs block text-purple-300">Admin Control Panel</span>
                  <span className="text-[10px] text-neutral-400 block">ইউজার রোল ও মডারেশন সেন্টার</span>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
            </Link>
          )}
        </div>

        {/* Quick Links */}
        <div className="py-2 border-b border-white/10 space-y-0.5 text-xs font-medium">
          <button
            onClick={handleDeveloperProfileClick}
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-cyan-300">Developer Profile & Contact</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
          </button>

          <Link
            to="/history"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-white/70" />
              <span>Watch History</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
          </Link>

          <Link
            to="/playlist/watch-later"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-white/70" />
              <span>Watch Later ({watchLaterVideos.length})</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
          </Link>

          <Link
            to="/playlist/liked"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ThumbsUp className="w-4 h-4 text-white/70" />
              <span>Liked Videos ({likedVideos.length})</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
          </Link>

          <Link
            to="/subscriptions"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <PlaySquare className="w-4 h-4 text-white/70" />
              <span>Subscriptions ({subscribedChannels.length})</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
          </Link>
        </div>

        {/* Payment & Settings Controls */}
        <div className="py-2 border-b border-white/10 space-y-0.5 text-xs font-medium">
          <button
            onClick={() => {
              onClose();
              openBkashModal();
            }}
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-pink-500/15 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded bg-gradient-to-tr from-pink-500 via-orange-500 to-purple-600 text-white flex items-center justify-center font-bold text-[9px]">
                ৳
              </div>
              <div>
                <span className="font-bold text-xs text-white group-hover:text-pink-400">
                  bKash / Nagad / Rocket VIP
                </span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
          </button>

          <button
            onClick={() => {
              onOpenWatchTime();
              onClose();
            }}
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Time Watched</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/40" />
          </button>

          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-4 py-2 hover:bg-white/5 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              <span>Appearance: {isDarkMode ? 'Dark' : 'Light'}</span>
            </div>
            <div className={cn("w-8 h-4 rounded-full p-0.5 transition-colors", isDarkMode ? 'bg-pink-600' : 'bg-neutral-600')}>
              <div className={cn("w-3 h-3 rounded-full bg-white transition-transform", isDarkMode ? 'translate-x-4' : '')} />
            </div>
          </button>
        </div>

        {/* Footer with Sign Out */}
        <div className="p-2">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট (Sign out)</span>
          </button>
        </div>
      </div>
    </>
  );
}
