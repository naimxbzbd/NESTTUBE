import React, { createContext, useContext, useState } from 'react';

export interface ActiveVideo {
  id: string;
  title: string;
  channelTitle: string;
}

interface MiniPlayerContextType {
  activeVideo: ActiveVideo | null;
  isMiniPlayerOpen: boolean;
  openMiniPlayer: (video: ActiveVideo) => void;
  closeMiniPlayer: () => void;
  toggleMiniPlayer: (video?: ActiveVideo) => void;
}

const MiniPlayerContext = createContext<MiniPlayerContextType | undefined>(undefined);

export function MiniPlayerProvider({ children }: { children: React.ReactNode }) {
  const [activeVideo, setActiveVideo] = useState<ActiveVideo | null>(null);
  const [isMiniPlayerOpen, setIsMiniPlayerOpen] = useState(false);

  const openMiniPlayer = (video: ActiveVideo) => {
    setActiveVideo(video);
    setIsMiniPlayerOpen(true);
  };

  const closeMiniPlayer = () => {
    setIsMiniPlayerOpen(false);
  };

  const toggleMiniPlayer = (video?: ActiveVideo) => {
    if (isMiniPlayerOpen) {
      setIsMiniPlayerOpen(false);
    } else if (video) {
      setActiveVideo(video);
      setIsMiniPlayerOpen(true);
    } else if (activeVideo) {
      setIsMiniPlayerOpen(true);
    }
  };

  return (
    <MiniPlayerContext.Provider
      value={{
        activeVideo,
        isMiniPlayerOpen,
        openMiniPlayer,
        closeMiniPlayer,
        toggleMiniPlayer,
      }}
    >
      {children}
    </MiniPlayerContext.Provider>
  );
}

export function useMiniPlayer() {
  const context = useContext(MiniPlayerContext);
  if (!context) {
    throw new Error('useMiniPlayer must be used within a MiniPlayerProvider');
  }
  return context;
}
