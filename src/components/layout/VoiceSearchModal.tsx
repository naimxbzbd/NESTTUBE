import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Search, Volume2, Globe, Sparkles, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'bn-BD', label: 'Bangla (Bangladesh)' },
  { code: 'bn-IN', label: 'Bangla (India)' },
  { code: 'hi-IN', label: 'Hindi' },
  { code: 'es-ES', label: 'Spanish' },
];

export function VoiceSearchModal({ isOpen, onClose }: VoiceSearchModalProps) {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en-US');
  const [errorMsg, setErrorMsg] = useState('');
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Speech recognition is not supported in this browser. You can type your query below.');
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
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg('');
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const resultTranscript = event.results[current][0].transcript;
        setTranscript(resultTranscript);

        if (event.results[current].isFinal) {
          setIsListening(false);
          if (resultTranscript.trim()) {
            setTimeout(() => {
              navigate(`/search?q=${encodeURIComponent(resultTranscript.trim())}`);
              onClose();
            }, 600);
          }
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access denied. Please check microphone permissions in your browser.');
        } else if (event.error === 'no-speech') {
          setErrorMsg('No speech was detected. Please try speaking again.');
        } else {
          setErrorMsg('Voice input stopped. Click the microphone to try again.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
      setErrorMsg('Failed to start voice recognition.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopListening();
      setTranscript('');
      setErrorMsg('');
      return;
    }

    // Auto-start listening when modal opens
    startListening();

    return () => {
      stopListening();
    };
  }, [isOpen, selectedLang]);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transcript.trim()) {
      navigate(`/search?q=${encodeURIComponent(transcript.trim())}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1f1f1f] text-neutral-900 dark:text-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative border border-neutral-200 dark:border-white/10 flex flex-col items-center text-center transition-colors">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 text-neutral-500 dark:text-white/70 transition-colors cursor-pointer"
          title="Close voice search"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-red-600 animate-pulse" />
          <h3 className="text-xl font-bold">Voice Search</h3>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-1.5 mb-6 text-xs text-neutral-500 dark:text-white/60 bg-neutral-100 dark:bg-white/5 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-white/10">
          <Globe className="w-3.5 h-3.5 text-blue-500" />
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-transparent border-none outline-none font-semibold text-neutral-800 dark:text-white cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-white dark:bg-[#1f1f1f] text-neutral-900 dark:text-white">
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Pulsing Mic Circle & Audio Wave Animation */}
        <div className="relative mb-6 flex flex-col items-center">
          {isListening && (
            <>
              <div className="absolute -inset-4 rounded-full bg-red-500/20 animate-ping pointer-events-none" />
              <div className="absolute -inset-8 rounded-full bg-red-500/10 animate-pulse pointer-events-none" />
            </>
          )}

          <button
            onClick={isListening ? stopListening : startListening}
            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xl ${
              isListening
                ? 'bg-red-600 text-white shadow-red-500/50 scale-105'
                : 'bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-white hover:bg-neutral-200 dark:hover:bg-white/20 hover:scale-105'
            }`}
            title={isListening ? 'Click to stop listening' : 'Click to speak'}
          >
            {isListening ? <Mic className="w-10 h-10 animate-bounce" /> : <MicOff className="w-10 h-10" />}
          </button>

          {/* Sound Wave Indicator */}
          {isListening && (
            <div className="flex items-center gap-1.5 mt-4 h-6">
              <span className="w-1.5 h-3 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_100ms]" />
              <span className="w-1.5 h-6 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_200ms]" />
              <span className="w-1.5 h-4 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_300ms]" />
              <span className="w-1.5 h-6 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_400ms]" />
              <span className="w-1.5 h-3 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_500ms]" />
            </div>
          )}
        </div>

        {/* Transcript or Prompt */}
        <div className="w-full min-h-[48px] flex items-center justify-center mb-3 px-3">
          {transcript ? (
            <p className="text-lg font-bold text-neutral-900 dark:text-white italic bg-neutral-100 dark:bg-white/5 px-4 py-2 rounded-2xl border border-neutral-200 dark:border-white/10 w-full break-words">
              "{transcript}"
            </p>
          ) : (
            <p className="text-sm font-medium text-neutral-400 dark:text-white/50">
              {isListening ? 'Listening... Speak now!' : 'Tap the microphone to start speaking'}
            </p>
          )}
        </div>

        {/* Error message / Retry */}
        {errorMsg && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 mb-4 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20 w-full text-left">
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

        {/* Search input fallback */}
        <form onSubmit={handleManualSubmit} className="w-full flex items-center gap-2 mt-1">
          <input
            type="text"
            placeholder="Type search query manually..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="flex-1 text-sm px-4 py-2.5 rounded-full bg-neutral-100 dark:bg-white/5 border border-neutral-300 dark:border-white/10 outline-none focus:border-blue-500 text-neutral-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!transcript.trim()}
            className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full disabled:opacity-40 transition-all cursor-pointer shadow-md"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}

