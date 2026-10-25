import React, { useState } from 'react';
import { X, Mail, Lock, User, Key, Sparkles, Shield, Video, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUserStore } from '../../store/useUserStore';
import { cn } from '../../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register' | 'coupon';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'coupon'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [coupon, setCoupon] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { signInWithGoogle } = useAuth();
  const { login, register, applyCoupon, currentUser } = useUserStore();

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      setSuccess('সফলভাবে লগইন হয়েছে!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Google দিয়ে সাইন-ইন সম্পন্ন করা যায়নি।');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'login') {
      const ok = login(email, password);
      if (ok) {
        setSuccess('সফলভাবে লগইন হয়েছে!');
        setTimeout(() => onClose(), 800);
      } else {
        setError('ইমেইল বা পাসওয়ার্ড ভুল হয়েছে');
      }
    } else if (mode === 'register') {
      if (!name || !email || !password) {
        setError('সকল ঘর পূরণ করুন');
        return;
      }
      const ok = register(email, password, name);
      if (ok) {
        setSuccess('অ্যাকাউন্ট তৈরি হয়েছে! লগইন হচ্ছে...');
        setTimeout(() => onClose(), 1200);
      } else {
        setError('এই ইমেইলে ইতিমধ্যে অ্যাকাউন্ট রয়েছে');
      }
    } else if (mode === 'coupon') {
      if (!currentUser) {
        setError('অনুগ্রহ করে প্রথমে লগইন করুন');
        return;
      }
      const ok = applyCoupon(coupon);
      if (ok) {
        setSuccess('কুপন সক্রিয় হয়েছে! প্রিমিয়াম সুবিধা চালু হয়েছে।');
        setTimeout(() => onClose(), 1500);
      } else {
        setError('ভুল কুপন কোড');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-3xl bg-[#0d1117]/95 border border-white/10 shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top ambient glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 relative z-10">
          <div>
            <h2 className="text-lg font-black text-white">
              {mode === 'login' && 'NestTube এ লগইন করুন'}
              {mode === 'register' && 'নতুন অ্যাকাউন্ট তৈরি করুন'}
              {mode === 'coupon' && 'কুপন রিডিম করুন'}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {mode === 'login' && 'ভিডিও দেখতে, আপলোড করতে ও মন্তব্য করতে সাইন-ইন করুন'}
              {mode === 'register' && 'ক্রিয়েটর ও ভিউয়ার কমিউনিটিতে যোগ দিন'}
              {mode === 'coupon' && 'ফ্রি প্রিমিয়াম কোড থাকলে প্রবেশ করান'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 relative z-10">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/40 text-red-300 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs rounded-xl font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Primary Recommended: Fast 1-Click Google Sign In */}
          {mode !== 'coupon' && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-white text-neutral-900 font-bold hover:bg-neutral-100 active:scale-98 transition-all shadow-xl cursor-pointer"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Google দিয়ে সরাসরি ১-ক্লিকে প্রবেশ করুন</span>
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-[1px] bg-white/10" />
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">অথবা ইমেইল</span>
                <div className="flex-1 h-[1px] bg-white/10" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">পুরো নাম (Full Name)</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="আপনার নাম"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>
              </div>
            )}

            {mode !== 'coupon' ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">ইমেইল ঠিকানা</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-pink-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">পাসওয়ার্ড</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-pink-500 transition-colors"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">কুপন কোড (Coupon Code)</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="NESTVIP2026"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-sm uppercase font-mono focus:outline-none focus:border-pink-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 shadow-lg shadow-pink-500/20 active:scale-98 transition-all cursor-pointer text-sm"
            >
              {mode === 'login' && 'লগইন করুন'}
              {mode === 'register' && 'অ্যাকাউন্ট খুলুন'}
              {mode === 'coupon' && 'কুপন প্রয়োগ করুন'}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="pt-2 text-center text-xs text-neutral-400 border-t border-white/10 flex items-center justify-center gap-3">
            {mode === 'login' ? (
              <>
                <span>অ্যাকাউন্ট নেই?</span>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-pink-400 hover:underline cursor-pointer"
                >
                  রেজিস্টার করুন
                </button>
              </>
            ) : (
              <>
                <span>ইতিমধ্যে অ্যাকাউন্ট আছে?</span>
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-pink-400 hover:underline cursor-pointer"
                >
                  লগইন করুন
                </button>
              </>
            )}
            <span className="text-neutral-600">•</span>
            <button
              type="button"
              onClick={() => setMode('coupon')}
              className="text-neutral-400 hover:text-white hover:underline cursor-pointer"
            >
              কুপন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
