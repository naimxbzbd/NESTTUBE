import React, { useState } from 'react';
import { Menu, Search, Mic, Video, Bell, Sun, Moon, ArrowLeft, Megaphone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useUserStore } from '../../store/useUserStore';
import { useAdsterra } from '../../context/AdsterraContext';
import { CreateVideoModal } from './CreateVideoModal';
import { VoiceSearchModal } from './VoiceSearchModal';
import { NotificationsPopover } from './NotificationsPopover';
import { UserAccountPopover } from './UserAccountPopover';
import { WatchTimeModal } from './WatchTimeModal';
import { ContactDeveloperModal } from './ContactDeveloperModal';
import { SearchInput } from './SearchInput';
import { Tooltip } from '../ui/Tooltip';
import { AuthModal } from '../auth/AuthModal';

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
  const { openSettings: openAdSettings, config: adConfig } = useAdsterra();
  const location = useLocation();

  const handleLogoClick = () => {
    if (location.pathname === '/') {
      window.dispatchEvent(new CustomEvent('refresh-home'));
    }
  };

  const unreadCount = unreadNotificationCount();

  return (
    <header className="h-14 flex items-center justify-between px-3 md:px-4 shrink-0 bg-white dark:bg-[#0f0f0f] text-neutral-900 dark:text-white border-b border-neutral-200 dark:border-white/10 transition-colors z-30 relative">
      {/* Full-width Mobile Search Bar overlay when active */}
      {isMobileSearchActive ? (
        <div className="flex items-center gap-2 w-full animate-in fade-in duration-150">
          <button
            onClick={() => setIsMobileSearchActive(false)}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full text-neutral-700 dark:text-white cursor-pointer shrink-0"
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
            className="p-2 bg-neutral-100 dark:bg-white/5 rounded-full shrink-0"
          >
            <Mic className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Logo & Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Tooltip content="Main Menu" position="bottom">
              <button 
                onClick={onToggleMenu}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full text-neutral-800 dark:text-white transition-colors cursor-pointer"
                aria-label="Open Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </Tooltip>
            <Link to="/" onClick={handleLogoClick} className="flex items-center gap-1.5 sm:gap-2">
              <div className="bg-[#ff0000] w-6 sm:w-7 h-4.5 sm:h-5 rounded flex items-center justify-center shrink-0 shadow-sm">
                <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[6px] border-l-white border-b-[3px] border-b-transparent ml-0.5"></div>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base sm:text-lg font-extrabold tracking-tight uppercase leading-none text-neutral-900 dark:text-white">NESTTUBE</span>
                <span className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-white/60 font-normal leading-none mt-0.5">by Naim Xbz</span>
              </div>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden sm:flex items-center gap-3 max-w-xl w-full px-4">
            <SearchInput
              onOpenVoiceModal={() => setIsVoiceOpen(true)}
            />
            <Tooltip content="Search with your voice" position="bottom">
              <button
                onClick={() => setIsVoiceOpen(true)}
                className="p-2.5 bg-neutral-100 hover:bg-neutral-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-800 dark:text-white rounded-full shrink-0 transition-colors cursor-pointer"
              >
                <Mic className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 relative">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsMobileSearchActive(true)}
              className="p-2 sm:hidden hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-800 dark:text-white rounded-full cursor-pointer"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Adsterra Monetization Manager */}
            <Tooltip content="Adsterra Ad Settings" position="bottom">
              <button
                onClick={openAdSettings}
                className="p-2 sm:p-2.5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-800 dark:text-white rounded-full transition-colors flex items-center justify-center cursor-pointer relative"
                aria-label="Adsterra Monetization Settings"
              >
                <Megaphone className="w-5 h-5 text-amber-500" />
                {adConfig.enabled && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                )}
              </button>
            </Tooltip>

            {/* Theme Toggle Button */}
            <Tooltip content={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'} position="bottom">
              <button
                onClick={toggleTheme}
                className="p-2 sm:p-2.5 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-700 dark:text-white rounded-full transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-700 fill-slate-700/20" />
                )}
              </button>
            </Tooltip>

            {/* Create / Upload Video */}
            <Tooltip content="Create or upload video" position="bottom">
              <button
                onClick={() => setIsCreateOpen(true)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-800 dark:text-white rounded-full transition-colors cursor-pointer"
              >
                <Video className="w-5 sm:w-6 h-5 sm:h-6" />
              </button>
            </Tooltip>

            {/* Notifications */}
            <Tooltip content="Notifications" position="bottom">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-800 dark:text-white rounded-full relative transition-colors cursor-pointer"
              >
                <Bell className="w-5 sm:w-6 h-5 sm:h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 rounded-full border-2 border-white dark:border-[#0f0f0f] text-white text-[9px] flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
            </Tooltip>

            {/* User Avatar & Account Menu */}
            {currentUser ? (
              <Tooltip content="User Account" position="bottom">
                <button
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="ml-0.5 sm:ml-1 relative cursor-pointer"
                >
                  <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-blue-600 text-white overflow-hidden flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm hover:opacity-90 transition-opacity uppercase">
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
                className="ml-2 flex items-center gap-2 px-3 py-1.5 border border-neutral-200 dark:border-white/20 rounded-full text-blue-600 dark:text-blue-400 font-medium text-sm hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors whitespace-nowrap cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full border border-blue-600 dark:border-blue-400 flex items-center justify-center">
                  <span className="text-[10px]"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                </div>
                Sign in
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
