import React, { useState } from 'react';
import { User, Sun, Moon, Clock, PlaySquare, Bookmark, ThumbsUp, LogOut, Settings, ChevronRight, ShieldCheck, Code2, Sparkles, Shield, Crown, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';
import { usePaymentStore } from '../../store/usePaymentStore';
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
  const { subscribedChannels, watchLaterVideos, likedVideos, playlists, isPremium, togglePremium, currentUser, logout, premiumExpiresAt } = useUserStore();
  const { openBkashModal, openAdminModal, paymentRequests } = usePaymentStore();

  if (!isOpen || !currentUser) return null;

  const pendingAdminCount = paymentRequests.filter(r => r.status === 'pending').length;
  const myPending = paymentRequests.find(r => r.userEmail === currentUser.email && r.status === 'pending');

  const handleDeveloperProfileClick = () => {
    onClose();
    if (onOpenContactDeveloper) {
      onOpenContactDeveloper();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div className="absolute right-4 top-14 z-50 w-76 bg-white dark:bg-[#212121] text-neutral-900 dark:text-white rounded-2xl shadow-2xl border border-neutral-200 dark:border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 transition-colors">
        
        {/* User Card */}
        <div className="p-4 border-b border-neutral-200 dark:border-white/10 flex items-center gap-3">
          <div className="relative">
            <div className={cn(
              "w-11 h-11 rounded-full text-white font-bold flex items-center justify-center shrink-0 shadow-md uppercase text-sm",
              isPremium
                ? "bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 ring-2 ring-amber-400 shadow-amber-500/20"
                : "bg-blue-600"
            )}>
              {currentUser.name.charAt(0)}
            </div>
            {isPremium && (
              <span className="absolute -bottom-1 -right-1 px-1 py-[0.5px] bg-black text-amber-400 text-[8px] font-black uppercase rounded-full shadow-md border border-amber-400 flex items-center gap-0.5 leading-none">
                <Crown className="w-2 h-2 fill-amber-400 shrink-0" />
                <span>PRO</span>
              </span>
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm truncate">{currentUser.name}</span>
              {isPremium && (
                <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[9px] font-black uppercase tracking-wider">
                  PRO
                </span>
              )}
            </div>
            <span className="text-xs text-neutral-500 dark:text-white/60 truncate">{currentUser.email}</span>
            <button
              onClick={handleDeveloperProfileClick}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold mt-0.5 text-left cursor-pointer"
            >
              View Developer profile
            </button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="py-2 border-b border-neutral-200 dark:border-white/10 space-y-0.5 text-xs font-medium">
          <button
            onClick={handleDeveloperProfileClick}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Code2 className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-blue-600 dark:text-blue-400">Developer Profile & Contact</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
          </button>

          <Link
            to="/history"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-neutral-500 dark:text-white/70" />
              <span>Watch History</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
          </Link>

          <Link
            to="/playlist/watch-later"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-neutral-500 dark:text-white/70" />
              <span>Watch Later ({watchLaterVideos.length})</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
          </Link>

          <Link
            to="/playlist/liked"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ThumbsUp className="w-4 h-4 text-neutral-500 dark:text-white/70" />
              <span>Liked Videos ({likedVideos.length})</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
          </Link>

          <Link
            to="/subscriptions"
            onClick={onClose}
            className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <PlaySquare className="w-4 h-4 text-neutral-500 dark:text-white/70" />
              <span>Subscriptions ({subscribedChannels.length})</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
          </Link>
        </div>

        {/* Controls */}
        <div className="py-2 border-b border-neutral-200 dark:border-white/10 space-y-0.5 text-xs font-medium">
          {/* PRO Membership Status Banner */}
          {isPremium ? (
            <div className="w-full px-4 py-3 bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-amber-500/15 border-y border-amber-500/25 flex items-start gap-3 text-left">
              <Crown className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-amber-600 dark:text-amber-400">
                    NESTTube PRO Active
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                    Ad-Free VIP
                  </span>
                </div>
                <span className="text-[10px] text-neutral-600 dark:text-neutral-300 mt-0.5">
                  Expires: <strong className="font-semibold">{currentUser.premiumExpiresAt || premiumExpiresAt || 'Active'}</strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-800/40 border-y border-neutral-200 dark:border-white/10 flex items-center justify-between text-left">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-neutral-400" />
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-neutral-700 dark:text-neutral-300">Free Tier</span>
                  <span className="text-[10px] text-neutral-500">Standard ads active</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openBkashModal();
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-[10px] shadow-xs cursor-pointer"
              >
                Go PRO
              </button>
            </div>
          )}

          {/* Pending Payment Notification if any */}
          {myPending && (
            <button
              onClick={() => {
                onClose();
                openBkashModal();
              }}
              className="w-full px-4 py-2 bg-amber-500/15 border-b border-amber-500/30 flex items-center justify-between text-left cursor-pointer hover:bg-amber-500/20 transition-colors"
            >
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span className="text-[11px] font-bold">bKash/Nagad TrxID Under Review</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
            </button>
          )}

          {/* bKash / Nagad / Rocket PRO Pay Link */}
          <button
            onClick={() => {
              onClose();
              openBkashModal();
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-pink-500/10 dark:hover:bg-pink-500/15 transition-colors text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-pink-500 via-orange-500 to-purple-600 text-white flex items-center justify-center font-bold text-[10px]">
                ৳
              </div>
              <div>
                <span className="font-bold text-xs text-neutral-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400">
                  bKash / Nagad / Rocket Pay
                </span>
                <span className="text-[10px] text-neutral-500 block">Send Money to 01703223141</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
          </button>

          {/* Admin Approval Panel Button */}
          <button
            onClick={() => {
              onClose();
              openAdminModal();
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <div>
                <span className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1.5">
                  <span>Admin Payment Approvals</span>
                  {pendingAdminCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black">
                      {pendingAdminCount}
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-neutral-500 block">Review & approve TrxID</span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
          </button>

          <button
            onClick={() => {
              onOpenWatchTime();
              onClose();
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Time Watched</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 dark:text-white/40" />
          </button>

          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
              <span>Appearance: {isDarkMode ? 'Dark' : 'Light'}</span>
            </div>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-neutral-300'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-4' : ''}`} />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="p-2">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>

      </div>
    </>
  );
}
