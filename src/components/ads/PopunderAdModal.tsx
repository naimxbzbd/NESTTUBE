import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAdsterra } from '../../context/AdsterraContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export const PopunderAdModal: React.FC = () => {
  const {
    isPopunderModalOpen,
    closePopunderModal,
    config,
    isPremium
  } = useAdsterra();

  const [countdown, setCountdown] = useState<number>(3);
  const [canSkip, setCanSkip] = useState<boolean>(false);

  useEffect(() => {
    if (!isPopunderModalOpen) {
      setCountdown(3);
      setCanSkip(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanSkip(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPopunderModalOpen]);

  if (isPremium || !isPopunderModalOpen) return null;

  const smartLink = config.popunder.smartLinkUrl;
  const isScript = smartLink?.trim().endsWith('.js');

  return (
    <AnimatePresence>
      <div className="fixed bottom-4 right-4 z-[9999] p-2 animate-in fade-in duration-200 pointer-events-none flex justify-end">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="relative w-full max-w-sm sm:max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col text-white pointer-events-auto"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-950/90 border-b border-neutral-800/80">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-black text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide">
                Sponsored
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Skip Button or Countdown */}
              {canSkip ? (
                <button
                  onClick={closePopunderModal}
                  className="bg-white text-black hover:bg-neutral-200 font-bold px-3 py-1 rounded-full text-[11px] flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                >
                  <span>Close</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="bg-neutral-800/80 text-neutral-300 font-medium px-3 py-1 rounded-full text-[11px] flex items-center gap-1.5 opacity-80 cursor-not-allowed">
                  <span>Close in</span>
                  <span className="font-bold text-amber-400 text-xs">{countdown}s</span>
                </div>
              )}
            </div>
          </div>

          {/* Ad Main Content Body - Display iframe instead of placeholder */}
          <div className="relative w-full h-[40vh] sm:h-[45vh] bg-white flex flex-col">
            {smartLink ? (
              isScript ? (
                <iframe
                  srcDoc={`<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:0;background:#fff;display:flex;justify-content:center;align-items:center;height:100vh;overflow:hidden;}</style></head><body><script type="text/javascript" src="${smartLink}"></script></body></html>`}
                  title="Advertisement"
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              ) : (
                <iframe
                  src={smartLink}
                  title="Advertisement"
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              )
            ) : (
              <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-neutral-400 text-sm">
                Ad URL not configured
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
