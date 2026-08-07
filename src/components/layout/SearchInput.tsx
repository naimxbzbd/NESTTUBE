import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Mic, X, Clock, Flame, PlaySquare, ArrowUpLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '../ui/Tooltip';
import { useYoutubeStore } from '../../store/useYoutubeStore';
import {
  getSearchHistory,
  saveSearchQuery,
  removeSearchHistoryItem,
  fetchYouTubeSuggestions,
  POPULAR_SUGGESTIONS,
} from '../../services/searchSuggestions';

interface SearchInputProps {
  onOpenVoiceModal?: () => void;
  isMobile?: boolean;
  onCloseMobileSearch?: () => void;
}

export interface SuggestionItem {
  id: string;
  type: 'history' | 'api' | 'video' | 'trending';
  text: string;
  subText?: string;
  videoId?: string;
  thumbnailUrl?: string;
}

export function SearchInput({
  onOpenVoiceModal,
  isMobile = false,
  onCloseMobileSearch,
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [history, setHistory] = useState<string[]>([]);
  const [apiSuggestions, setApiSuggestions] = useState<string[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Access loaded videos for real-time video title/channel matching
  const { videos } = useYoutubeStore();

  // Load search history on mount & when opening
  useEffect(() => {

    setHistory(getSearchHistory());
  }, []);

  // Fetch API suggestions with debounce
  useEffect(() => {
    if (!query.trim()) {
      setApiSuggestions([]);
      setIsLoadingApi(false);
      return;
    }

    setIsLoadingApi(true);
    const timer = setTimeout(async () => {
      const results = await fetchYouTubeSuggestions(query);
      setApiSuggestions(results);
      setIsLoadingApi(false);
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  // Reset selected index when query or suggestions change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [query, apiSuggestions]);

  // Compute combined suggestions list
  const suggestionList = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const list: SuggestionItem[] = [];

    if (!trimmed) {
      // 1. Show Recent History
      history.slice(0, 6).forEach((item, i) => {
        list.push({
          id: `history_${i}_${item}`,
          type: 'history',
          text: item,
        });
      });

      // 2. Show Trending Suggestions
      POPULAR_SUGGESTIONS.slice(0, 5).forEach((item, i) => {
        if (!history.includes(item)) {
          list.push({
            id: `trending_${i}_${item}`,
            type: 'trending',
            text: item,
            subText: 'Trending search',
          });
        }
      });

      return list;
    }

    // When typing query:
    // 1. Matching Search History
    history
      .filter((item) => item.toLowerCase().includes(trimmed))
      .slice(0, 3)
      .forEach((item, i) => {
        list.push({
          id: `history_match_${i}_${item}`,
          type: 'history',
          text: item,
        });
      });

    // 2. API suggestions
    apiSuggestions.forEach((item, i) => {
      if (!list.some((existing) => existing.text.toLowerCase() === item.toLowerCase())) {
        list.push({
          id: `api_${i}_${item}`,
          type: 'api',
          text: item,
        });
      }
    });

    // 3. Matching loaded videos from YouTube store
    if (videos && videos.length > 0) {
      videos
        .filter((v) => {
          const titleMatch = v.snippet?.title?.toLowerCase().includes(trimmed);
          const channelMatch = v.snippet?.channelTitle?.toLowerCase().includes(trimmed);
          return titleMatch || channelMatch;
        })
        .slice(0, 3)
        .forEach((v, i) => {
          list.push({
            id: `video_${i}_${v.id}`,
            type: 'video',
            text: v.snippet?.title || 'Video Result',
            subText: v.snippet?.channelTitle,
            videoId: v.id,
            thumbnailUrl: v.snippet?.thumbnails?.default?.url || v.snippet?.thumbnails?.high?.url,
          });
        });
    }

    // 4. Matching popular suggestions as fallback if list is short
    if (list.length < 5) {
      POPULAR_SUGGESTIONS.filter((item) => item.toLowerCase().includes(trimmed))
        .slice(0, 5)
        .forEach((item, i) => {
          if (!list.some((existing) => existing.text.toLowerCase() === item.toLowerCase())) {
            list.push({
              id: `popular_${i}_${item}`,
              type: 'trending',
              text: item,
            });
          }
        });
    }

    return list.slice(0, 10);
  }, [query, history, apiSuggestions, videos]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExecuteSearch = (searchText: string, videoId?: string) => {
    const finalQuery = searchText.trim();
    if (!finalQuery) return;

    saveSearchQuery(finalQuery);
    setHistory(getSearchHistory());
    setIsOpen(false);

    if (videoId) {
      navigate(`/watch?v=${videoId}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(finalQuery)}`);
    }

    if (isMobile && onCloseMobileSearch) {
      onCloseMobileSearch();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < suggestionList.length) {
      const selected = suggestionList[selectedIndex];
      handleExecuteSearch(selected.text, selected.videoId);
    } else if (query.trim()) {
      handleExecuteSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestionList.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestionList.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestionList.length - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleRemoveHistoryItem = (e: React.MouseEvent, textToRemove: string) => {
    e.stopPropagation();
    const updated = removeSearchHistoryItem(textToRemove);
    setHistory(updated);
  };

  // Highlight query match in string
  const renderHighlightedText = (text: string) => {
    if (!query.trim()) return <span>{text}</span>;

    const trimmedQuery = query.trim();
    const regex = new RegExp(`(${trimmedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, index) =>
          part.toLowerCase() === trimmedQuery.toLowerCase() ? (
            <span key={index} className="font-bold text-neutral-900 dark:text-white">
              {part}
            </span>
          ) : (
            <span key={index} className="text-neutral-700 dark:text-neutral-300">
              {part}
            </span>
          )
        )}
      </span>
    );
  };

  return (
    <div ref={containerRef} className="relative flex-1 w-full max-w-xl">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center bg-neutral-100 dark:bg-[#121212] border border-neutral-300 dark:border-white/10 rounded-full ${
          isMobile ? 'h-9' : 'h-10'
        } group focus-within:border-blue-500 overflow-hidden transition-colors relative z-40`}
      >
        <div className="hidden group-focus-within:flex pl-4">
          <Search className="w-4 h-4 text-neutral-400 dark:text-white/50" />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={isMobile ? 'Search videos...' : 'Search videos, channels, topics...'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoFocus={isMobile}
          className="bg-transparent border-none outline-none flex-1 px-4 text-sm placeholder-neutral-500 dark:placeholder-white/40 text-neutral-900 dark:text-white"
        />

        {query && (
          <Tooltip content="Clear search" position="bottom">
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 mr-1 hover:bg-neutral-200 dark:hover:bg-white/10 rounded-full text-neutral-500 dark:text-white/60 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </Tooltip>
        )}

        <Tooltip content="Search" position="bottom">
          <button
            type="submit"
            className={`${
              isMobile ? 'px-3' : 'px-5'
            } bg-neutral-200/60 hover:bg-neutral-300/80 dark:bg-white/5 dark:hover:bg-white/10 h-full border-l border-neutral-300 dark:border-white/10 transition-colors cursor-pointer flex items-center justify-center`}
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600 dark:text-white/70" />
          </button>
        </Tooltip>
      </form>

      {/* Suggestion Dropdown */}
      {isOpen && suggestionList.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#212121] border border-neutral-200 dark:border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
          <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
            {suggestionList.map((item, index) => {
              const isSelected = selectedIndex === index;

              return (
                <div
                  key={item.id}
                  onClick={() => handleExecuteSearch(item.text, item.videoId)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors text-sm ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-white/10'
                      : 'hover:bg-neutral-100/70 dark:hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Icon based on suggestion type */}
                    {item.type === 'history' && (
                      <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    )}
                    {item.type === 'trending' && (
                      <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    {item.type === 'api' && (
                      <Search className="w-4 h-4 text-neutral-400 dark:text-white/40 shrink-0" />
                    )}
                    {item.type === 'video' && item.thumbnailUrl ? (
                      <img
                        src={item.thumbnailUrl}
                        alt=""
                        className="w-8 h-6 rounded object-cover shrink-0 border border-neutral-200 dark:border-white/10"
                      />
                    ) : item.type === 'video' ? (
                      <PlaySquare className="w-4 h-4 text-blue-500 shrink-0" />
                    ) : null}

                    <div className="flex flex-col min-w-0">
                      <div className="truncate leading-tight">
                        {item.type === 'history' ? (
                          <span className="font-semibold text-purple-700 dark:text-purple-300">
                            {item.text}
                          </span>
                        ) : (
                          renderHighlightedText(item.text)
                        )}
                      </div>
                      {item.subText && (
                        <span className="text-[11px] text-neutral-500 dark:text-white/50 truncate">
                          {item.subText}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Remove history item or search arrow */}
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {item.type === 'history' ? (
                      <button
                        onClick={(e) => handleRemoveHistoryItem(e, item.text)}
                        className="p-1 text-neutral-400 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 rounded-full hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        title="Remove from history"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuery(item.text);
                          inputRef.current?.focus();
                        }}
                        className="p-1 text-neutral-400 hover:text-neutral-700 dark:text-white/40 dark:hover:text-white rounded-full hover:bg-neutral-200 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        title="Fill search"
                      >
                        <ArrowUpLeft className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note for search tips */}
          <div className="px-4 pt-2 mt-1 border-t border-neutral-100 dark:border-white/10 text-[11px] text-neutral-400 dark:text-white/40 flex items-center justify-between">
            <span>Use ↑ ↓ arrows to navigate</span>
            <span>Press Enter to search</span>
          </div>
        </div>
      )}
    </div>
  );
}
