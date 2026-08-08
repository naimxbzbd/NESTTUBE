import React, { useState } from 'react';
import { X, Mail, Lock, User, Key, Sparkles } from 'lucide-react';
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
  
  const { login, register, applyCoupon, currentUser } = useUserStore();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'login') {
      const ok = login(email, password);
      if (ok) {
        onClose();
      } else {
        setError('Invalid email or password');
      }
    } else if (mode === 'register') {
      if (!name || !email || !password) {
        setError('All fields are required');
        return;
      }
      const ok = register(email, password, name);
      if (ok) {
        setSuccess('Account created! Logging in...');
        setTimeout(() => onClose(), 1500);
      } else {
        setError('Email already exists');
      }
    } else if (mode === 'coupon') {
      if (!currentUser) {
        setError('Please log in first');
        return;
      }
      const ok = applyCoupon(coupon);
      if (ok) {
        setSuccess('Coupon applied! Premium activated.');
        setTimeout(() => onClose(), 1500);
      } else {
        setError('Invalid coupon code');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#212121] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-white/10">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'register' && 'Create Account'}
            {mode === 'coupon' && 'Redeem Coupon'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors text-neutral-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm rounded-xl font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 dark:bg-white/5 border border-transparent focus:border-blue-500 rounded-xl outline-none transition-colors dark:text-white"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 dark:bg-white/5 border border-transparent focus:border-blue-500 rounded-xl outline-none transition-colors dark:text-white"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 dark:bg-white/5 border border-transparent focus:border-blue-500 rounded-xl outline-none transition-colors dark:text-white"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </>
            )}

            {mode === 'coupon' && (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Coupon Code</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 dark:bg-white/5 border border-transparent focus:border-blue-500 rounded-xl outline-none transition-colors dark:text-white uppercase font-mono"
                    placeholder="e.g. PREMIUM2026"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2">Hint: Use PREMIUM2026 or FREEPREMIUM</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md"
            >
              {mode === 'login' && 'Sign In'}
              {mode === 'register' && 'Create Account'}
              {mode === 'coupon' && 'Apply Coupon'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-white/10 flex flex-col gap-2 text-sm text-center font-medium">
            {mode === 'login' && (
              <button onClick={() => setMode('register')} className="text-blue-600 hover:underline">
                Don't have an account? Register
              </button>
            )}
            {mode === 'register' && (
              <button onClick={() => setMode('login')} className="text-blue-600 hover:underline">
                Already have an account? Sign in
              </button>
            )}
            {(mode === 'login' || mode === 'register') && currentUser && (
              <button onClick={() => setMode('coupon')} className="text-amber-600 hover:underline flex items-center justify-center gap-1 mt-2">
                <Sparkles className="w-4 h-4" /> Redeem Premium Coupon
              </button>
            )}
            {mode === 'coupon' && (
              <button onClick={() => setMode('login')} className="text-neutral-500 hover:underline">
                Back to Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
