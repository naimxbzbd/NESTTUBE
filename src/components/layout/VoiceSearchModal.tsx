import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Search, Globe, Sparkles, RefreshCw, Volume2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'bn-BD', label: 'বাংলা (Bangladesh)' },
  { code: 'bn-IN', label: 'বাংলা (India)' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
  { code: 'es-ES', label: 'Español (Spanish)' },
  { code: 'fr-FR', label: 'Français (French)' },
  { code: 'de-DE', label: 'Deutsch (German)' },
  { code: 'ja-JP', label: '日本語 (Japanese)' },
  { code: 'ar-SA', label: 'العربية (Arabic)' },
];

const SAMPLE_VOICE_QUERIES = [
  'React JS full course',
  'Bangla natok 2026',
  'Lofi hip hop beats',
  'Top tech gadgets',
  'Trending music videos',
];

export function VoiceSearchModal({ isOpen, onClose }: VoiceSearchModalProps) {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [errorMsg, setErrorMsg] = useState('');
  const [audioVolume, setAudioVolume] = useState<number>(0);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const submitTimerRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();

  // Clean up audio context & media stream
  const cleanupAudioAnalyser = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    setAudioVolume(0);
  };

  // Start live microphone frequency analyzer for realistic visual feedback
  const startAudioAnalyser = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        // Normalize roughly 0 - 100
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioVolume(normalized);
        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      // AudioContext fallback without blocking speech recognition
      console.warn('Audio metering unavailable:', e);
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg(
        'Speech recognition is not supported in this browser. You can type your query below.'
      );
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg('');
        startAudioAnalyser();
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript + ' ';
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        const currentText = (final || interim).trim();
        if (currentText) {
          setTranscript(currentText);

          // Clear existing timer if any
          if (submitTimerRef.current) {
            clearTimeout(submitTimerRef.current);
          }

          // If a final sentence was captured, auto search after brief natural pause
          if (final.trim()) {
            submitTimerRef.current = setTimeout(() => {
              executeSearch(final.trim());
            }, 1200);
          }
        }
      };

      recognition.onerror = (event: any) => {
        cleanupAudioAnalyser();
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMsg(
            'Microphone access was denied. Please grant microphone permissions in browser settings.'
          );
        } else if (event.error === 'no-speech') {
          setErrorMsg('No speech detected. Tap the mic to try speaking again.');
        } else if (event.error !== 'aborted') {
          setErrorMsg(`Voice input: ${event.error}. Click mic to retry.`);
        }
      };

      recognition.onend = () => {
        cleanupAudioAnalyser();
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      cleanupAudioAnalyser();
      setIsListening(false);
      setErrorMsg('Failed to initiate microphone speech recognition.');
    }
  };

  const stopListening = () => {
    if (submitTimerRef.current) {
      clearTimeout(submitTimerRef.current);
      submitTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    cleanupAudioAnalyser();
    setIsListening(false);
  };

  const executeSearch = (searchText: string) => {
    const finalQuery = searchText.trim();
    if (!finalQuery) return;
    stopListening();
    navigate(`/search?q=${encodeURIComponent(finalQuery)}`);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setErrorMsg('');
      return;
    }

    // Auto-start listening on open
    startListening();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopListening();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopListening();
    };
  }, [isOpen, selectedLang]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.trim()) {
      executeSearch(transcript);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1f1f1f] text-neutral-900 dark:text-white rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-7 relative border border-neutral-200 dark:border-white/10 flex flex-col items-center text-center transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 dark:text-white/70 transition-colors cursor-pointer"
          title="Close voice search (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Badge */}
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-5 h-5 text-red-600 animate-pulse" />
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight">Voice Search</h3>
        </div>

        <p className="text-xs text-neutral-500 dark:text-white/60 mb-4 max-w-sm">
          Speak clearly into your microphone to instantly search videos, channels, and playlists.
        </p>

        {/* Language Selector */}
        <div className="flex items-center gap-2 mb-6 text-xs text-neutral-600 dark:text-white/70 bg-neutral-100 dark:bg-white/5 px-3.5 py-1.5 rounded-full border border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20 transition-colors">
          <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="font-medium text-neutral-500 dark:text-white/50">Language:</span>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-transparent border-none outline-none font-semibold text-neutral-900 dark:text-white cursor-pointer pr-1"
          >
            {LANGUAGES.map((lang) => (
              <option
                key={lang.code}
                value={lang.code}
                className="bg-white dark:bg-[#1f1f1f] text-neutral-900 dark:text-white"
              >
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Pulsing Mic Circle with Live Audio Visualizer */}
        <div className="relative mb-6 flex flex-col items-center justify-center">
          {/* Animated Glow Rings when Listening */}
          {isListening && (
            <>
              <div
                className="absolute rounded-full bg-red-500/20 pointer-events-none transition-all duration-150"
                style={{
                  width: `${120 + audioVolume * 0.8}px`,
                  height: `${120 + audioVolume * 0.8}px`,
                }}
              />
              <div
                className="absolute rounded-full bg-red-500/10 pointer-events-none animate-ping"
                style={{ width: '150px', height: '150px' }}
              />
            </>
          )}

          {/* Central Microphone Button */}
          <button
            onClick={isListening ? stopListening : startListening}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xl ${
              isListening
                ? 'bg-red-600 text-white shadow-red-500/50 scale-105'
                : 'bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/20 hover:scale-105 border border-neutral-200 dark:border-white/10'
            }`}
            title={isListening ? 'Click to pause listening' : 'Click to start speaking'}
          >
            {isListening ? (
              <Mic className="w-10 h-10 animate-bounce" />
            ) : (
              <MicOff className="w-10 h-10 text-neutral-400 dark:text-white/50" />
            )}
          </button>

          {/* Real-Time Live Equalizer Bars */}
          {isListening && (
            <div className="flex items-center gap-1.5 mt-5 h-8">
              {[0.4, 0.8, 1.2, 1.0, 0.7, 0.9, 0.5].map((multiplier, i) => {
                const dynamicHeight = Math.max(6, Math.min(32, 8 + audioVolume * 0.3 * multiplier));
                return (
                  <span
                    key={`wave-bar-${i}`}
                    className="w-1.5 bg-red-600 rounded-full transition-all duration-75"
                    style={{ height: `${dynamicHeight}px` }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Live Transcript Display Box */}
        <div className="w-full min-h-[56px] flex items-center justify-center mb-4 px-2">
          {transcript ? (
            <div className="w-full flex items-center justify-between gap-3 bg-neutral-100 dark:bg-white/5 px-4 py-3 rounded-2xl border border-neutral-200 dark:border-white/10 text-left">
              <p className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-white break-words flex-1">
                "{transcript}"
              </p>
              <button
                type="button"
                onClick={() => executeSearch(transcript)}
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-400 dark:text-white/50">
              <Volume2 className="w-4 h-4 text-neutral-400" />
              <span>
                {isListening
                  ? 'Listening... Speak your query clearly'
                  : 'Tap the red microphone to start speaking'}
              </span>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mb-4 bg-amber-500/10 px-3.5 py-2.5 rounded-xl border border-amber-500/20 w-full text-left">
            <span className="flex-1">{errorMsg}</span>
            <button
              onClick={startListening}
              className="p-1 hover:bg-amber-500/20 rounded-md transition-colors shrink-0"
              title="Try again"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Sample Voice Query Prompts */}
        <div className="w-full mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-white/40 mb-2">
            Or try one of these queries:
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {SAMPLE_VOICE_QUERIES.map((queryText) => (
              <button
                key={queryText}
                type="button"
                onClick={() => executeSearch(queryText)}
                className="text-xs px-3 py-1 bg-neutral-100 hover:bg-neutral-200 dark:bg-white/5 dark:hover:bg-white/10 text-neutral-700 dark:text-white/80 rounded-full border border-neutral-200 dark:border-white/10 transition-colors cursor-pointer"
              >
                {queryText}
              </button>
            ))}
          </div>
        </div>

        {/* Fallback Manual Query Form */}
        <form onSubmit={handleManualSubmit} className="w-full flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-white/10">
          <input
            type="text"
            placeholder="Or type your query here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="flex-1 text-sm px-4 py-2 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-300 dark:border-white/10 outline-none focus:border-red-500 text-neutral-900 dark:text-white transition-colors"
          />
          <button
            type="submit"
            disabled={!transcript.trim()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full disabled:opacity-40 transition-all cursor-pointer shadow-md text-xs font-semibold flex items-center gap-1.5"
            title="Search"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>
      </div>
    </div>
  );
}
