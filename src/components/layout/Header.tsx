import React, { useState } from 'react';
import { Menu, Search, Mic, Plus, Bell, Sun, Moon, ArrowLeft, Coins, Tv } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useUserStore } from '../../store/useUserStore';
import { useCoinStore } from '../../store/useCoinStore';
import { useAdsterra } from '../../context/AdsterraContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { CreateVideoModal } from './CreateVideoModal';
import { VoiceSearchModal } from './VoiceSearchModal';
import { NotificationsPopover } from './NotificationsPopover';
import { UserAccountPopover } from './UserAccountPopover';
import { WatchTimeModal } from './WatchTimeModal';
import { ContactDeveloperModal } from './ContactDeveloperModal';
import { SearchInput } from './SearchInput';
import { Tooltip } from '../ui/Tooltip';
import { AuthModal } from '../auth/AuthModal';
import { AnimatedNestLogo } from './AnimatedNestLogo';
import { Video, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  onToggleMenu?: () => void;
}

export function Header({ onToggleMenu }: HeaderProps) {
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isWatchTimeOpen, setIsWatchTimeOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'coupon'>('login');

  const { theme, toggleTheme } = useTheme();
  const { unreadNotificationCount, currentUser } = useUserStore();
  const { coins, openRechargeModal } = useCoinStore();
  const { isPremium } = useAdsterra();
  const { isAdmin, isCreator } = useAuth();
  const location = useLocation();

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.dispatchEvent(new CustomEvent('refresh-home'));
    }
  };

  const unreadCount = unreadNotificationCount();

  return (
    <header className="h-14 flex items-center justify-between px-3 md:px-4 shrink-0 glass-header text-white transition-colors z-30 relative">
      {/* Full-width Mobile Search Bar overlay when active */}
      {isMobileSearchActive ? (
        <div className="flex items-center gap-2 w-full animate-in fade-in duration-150">
          <button
            onClick={() => setIsMobileSearchActive(false)}
            className="p-2 hover:bg-white/10 rounded-full text-white cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <SearchInput
            isMobile
            onOpenVoiceModal={() => setIsVoiceOpen(true)}
            onCloseMobileSearch={() => setIsMobileSearchActive(false)}
          />

          <button
            onClick={() => setIsVoiceOpen(true)}
            className="p-2 bg-white/5 rounded-full shrink-0"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Logo & Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Tooltip content="মেইন মেনু" position="bottom">
              <button 
                onClick={onToggleMenu}
                className="p-2 hover:bg-white/10 rounded-full text-white transition-colors cursor-pointer"
                aria-label="Open Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </Tooltip>
            
            <AnimatedNestLogo onClick={handleLogoClick} />
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden sm:flex items-center gap-3 max-w-xl w-full px-4">
            <SearchInput
              onOpenVoiceModal={() => setIsVoiceOpen(true)}
            />
            <Tooltip content="ভয়েস সার্চ করুন" position="bottom">
              <button
                onClick={() => setIsVoiceOpen(true)}
                className="p-2.5 bg-white/5 hover:bg-white/10 text-white rounded-full shrink-0 transition-colors cursor-pointer"
              >
                <Mic className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 relative">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsMobileSearchActive(true)}
              className="p-2 sm:hidden hover:bg-white/10 text-white rounded-full cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Quick Live TV Link */}
            <Link
              to="/live-tv"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all"
            >
              <Tv className="w-3.5 h-3.5 animate-pulse" />
              <span>লাইভ টিভি</span>
            </Link>

            {/* PipraCoins Wallet Pill */}
            <Tooltip content="পিপড়াটিউব কয়েন ওয়ালেট — রিচার্জ করুন ও উপহার পাঠান" position="bottom">
              <button
                onClick={openRechargeModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition-all cursor-pointer group"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
                <span className="font-mono font-bold">{coins}</span>
                <span className="hidden sm:inline text-[11px] text-amber-200/80">কয়েন</span>
              </button>
            </Tooltip>

            {/* YouTube Studio / Creator Dashboard */}
            <Tooltip content="ক্রিয়েটর স্টুডিও — ভিডিও ম্যানেজার ও অ্যানালিটিক্স" position="bottom">
              <Link
                to="/studio"
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs bg-pink-500/15 border border-pink-500/30 text-pink-300 hover:bg-pink-500/25 transition-all cursor-pointer"
              >
                <Video className="w-3.5 h-3.5 text-pink-400" />
                <span>স্টুডিও</span>
              </Link>
            </Tooltip>

            {/* Admin Panel Link if admin */}
            {isAdmin && (
              <Tooltip content="এডমিন কন্ট্রোল সেন্টার — ইউজার রোল ও কনটেন্ট মডারেশন" position="bottom">
                <Link
                  to="/admin"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition-all cursor-pointer shadow-sm shadow-purple-500/20"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  <span>এডমিন</span>
                </Link>
              </Tooltip>
            )}

            {/* PipraTube Upload Video Button */}
            <Tooltip content="ভিডিও আপলোড করুন" position="bottom">
              <Link
                to="/studio"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full font-bold text-xs bg-upload-gradient text-white shadow-md shadow-pink-500/20 hover:opacity-95 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>আপলোড</span>
              </Link>
            </Tooltip>

            {/* Theme Toggle Button */}
            <Tooltip content={theme === 'dark' ? 'লাইট মোড করুন' : 'ডার্ক মোড করুন'} position="bottom">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-white/10 text-white rounded-full transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-300" />
                )}
              </button>
            </Tooltip>

            {/* Notifications */}
            <Tooltip content="নোটিফিকেশন" position="bottom">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 hover:bg-white/10 text-white rounded-full relative transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 rounded-full border-2 border-[#0b0f15] text-white text-[9px] flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </Tooltip>

            {/* User Avatar & Account Menu */}
            {currentUser ? (
              <Tooltip content={currentUser.name} position="bottom">
                <button
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="ml-0.5 sm:ml-1 relative cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#ff2d6f] to-[#c026d3] text-white flex items-center justify-center text-xs font-bold shadow-sm uppercase ring-2 ring-pink-500/40">
                    {currentUser.name.charAt(0)}
                  </div>
                </button>
              </Tooltip>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="ml-1 sm:ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors cursor-pointer"
              >
                <span>লগইন</span>
              </button>
            )}

            {/* Popovers & Modals */}
            <NotificationsPopover
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
            />

            <UserAccountPopover
              isOpen={isAccountOpen}
              onClose={() => setIsAccountOpen(false)}
              onOpenWatchTime={() => setIsWatchTimeOpen(true)}
              onOpenContactDeveloper={() => setIsContactOpen(true)}
              isDarkMode={theme === 'dark'}
              toggleDarkMode={toggleTheme}
            />
          </div>
        </>
      )}

      {/* Dialog Modals */}
      <CreateVideoModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <VoiceSearchModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
      />

      <WatchTimeModal
        isOpen={isWatchTimeOpen}
        onClose={() => setIsWatchTimeOpen(false)}
      />

      <ContactDeveloperModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </header>
  );
}
