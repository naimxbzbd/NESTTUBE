import React from 'react';
import { Bell, CheckCheck, ExternalLink, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../../store/useUserStore';

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPopover({ isOpen, onClose }: NotificationsPopoverProps) {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useUserStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popover */}
      <div className="absolute right-12 top-14 z-50 w-80 sm:w-96 bg-white dark:bg-[#212121] text-neutral-900 dark:text-white rounded-2xl shadow-2xl border border-neutral-200 dark:border-white/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-bold">Notifications</h3>
          </div>
          <button
            onClick={markAllNotificationsAsRead}
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all as read
          </button>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-neutral-100 dark:divide-white/5 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500 dark:text-white/60">
              No notifications yet.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markNotificationAsRead(item.id)}
                className={`p-3.5 flex items-start gap-3 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                  !item.isRead ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                }`}
              >
                {/* Channel Icon */}
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {item.channelTitle.charAt(0)}
                </div>

                <div className="flex-1 flex flex-col gap-0.5">
                  <div className="text-xs font-semibold text-neutral-900 dark:text-white leading-snug">
                    <span className="font-bold">{item.channelTitle} </span>
                    {item.title}
                  </div>
                  <span className="text-[10px] text-neutral-500 dark:text-white/50">{item.timeAgo}</span>
                </div>

                {item.videoId && (
                  <Link
                    to={`/watch/${item.videoId}`}
                    onClick={onClose}
                    className="p-1 text-neutral-400 hover:text-blue-500 shrink-0"
                    title="Watch video"
                  >
                    <Video className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </>
  );
}
