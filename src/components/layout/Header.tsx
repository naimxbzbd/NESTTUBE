import React, { useState } from 'react';
import { Menu, Search, Mic, Video, Bell, Sun, Moon, ArrowLeft, Crown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useUserStore } from '../../store/useUserStore';
import { useAdsterra } from '../../context/AdsterraContext';
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
  const { isPremium, openPremiumModal } = useAdsterra();
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
              <div className={cn(
                "w-6 sm:w-7 h-4.5 sm:h-5 rounded flex items-center justify-center shrink-0 shadow-sm",
                isPremium ? "bg-gradient-to-tr from-[#ff0000] to-amber-500" : "bg-[#ff0000]"
              )}>
                <div className="w-0 h-0 border-t-[3px] border-t-transparent border-l-[6px] border-l-white border-b-[3px] border-b-transparent ml-0.5"></div>
              </div>
              {isPremium ? (
                <div className="flex flex-col leading-none">
                  <span className="text-base sm:text-lg font-extrabold tracking-tight uppercase leading-none text-neutral-900 dark:text-white">
                    NESTTUBE
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-amber-500 dark:text-amber-400 uppercase text-right leading-none mt-0.5">
                    PRO
                  </span>
                </div>
              ) : (
                <span className="text-base sm:text-lg font-extrabold tracking-tight uppercase leading-none text-neutral-900 dark:text-white">
                  NESTTUBE
                </span>
              )}
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

            {/* Become PRO Section */}
            {!isPremium ? (
              <Tooltip content="Upgrade to NESTTube PRO (100% Ad-Free, Background Play & More)" position="bottom">
                <button
                  onClick={openPremiumModal}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full font-bold text-xs bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black shadow-md hover:shadow-amber-500/25 active:scale-95 transition-all cursor-pointer group"
                  aria-label="Become PRO"
                >
                  <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black group-hover:rotate-12 transition-transform" />
                  <span className="hidden xs:inline sm:inline tracking-wide font-extrabold uppercase text-[11px] sm:text-xs">
                    Become PRO
                  </span>
                  <span className="xs:hidden sm:hidden font-extrabold text-[11px]">
                    PRO
                  </span>
                </button>
              </Tooltip>
            ) : (
              <Tooltip content="NESTTube PRO Active • 100% Ad-Free Experience" position="bottom">
                <button
                  onClick={openPremiumModal}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full font-bold text-xs bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/15 text-amber-600 dark:text-amber-400 border border-amber-500/40 transition-all cursor-pointer shadow-xs"
                  aria-label="PRO Member Active"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="hidden sm:inline font-extrabold uppercase text-[11px] tracking-wider">
                    PRO
                  </span>
                </button>
              </Tooltip>
            )}

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
              <Tooltip content={isPremium ? `${currentUser.name} (PRO Member Active)` : "User Account"} position="bottom">
                <button
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="ml-0.5 sm:ml-1 relative cursor-pointer group"
                >
                  <div className={cn(
                    "w-7 sm:w-8 h-7 sm:h-8 rounded-full text-white overflow-hidden flex items-center justify-center text-xs sm:text-sm font-bold shadow-sm transition-all uppercase",
                    isPremium
                      ? "bg-gradient-to-tr from-amber-600 to-yellow-500 ring-2 ring-amber-400 dark:ring-amber-300 shadow-amber-500/20"
                      : "bg-blue-600 hover:opacity-90"
                  )}>
                    {currentUser.name.charAt(0)}
                  </div>

                  {/* PRO Badge Overlay on User Profile Icon */}
                  {isPremium && (
                    <span 
                      className="absolute -bottom-1 -right-1 px-1 py-[0.5px] bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-black text-[8px] font-black uppercase rounded-full shadow-md border border-neutral-900 dark:border-neutral-950 tracking-tighter flex items-center gap-0.5 leading-none"
                      title="PRO Member Active"
                    >
                      <Crown className="w-2 h-2 fill-black shrink-0" />
                      <span>PRO</span>
                    </span>
                  )}
                </button>
              </Tooltip>
            ) : isPremium ? (
              <Tooltip content="Guest PRO Member Active" position="bottom">
                <button
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="ml-0.5 sm:ml-1 relative cursor-pointer"
                >
                  <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-500 ring-2 ring-amber-400 text-black overflow-hidden flex items-center justify-center text-xs font-bold shadow-sm uppercase">
                    <Crown className="w-4 h-4 fill-black" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 px-1 py-[0.5px] bg-black text-amber-400 text-[8px] font-black uppercase rounded-full shadow-md border border-amber-400 tracking-tighter leading-none">
                    PRO
                  </span>
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
