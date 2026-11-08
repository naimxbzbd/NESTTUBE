import React, { useState } from 'react';
import {
  Sparkles,
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Calendar,
  Clock,
  Crown,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Referrals() {
  const { user, userProfile, applyReferralCode, signInWithGoogle } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const referralCode = userProfile?.referralCode || (user ? `NEST-${user.uid.slice(0, 6).toUpperCase()}` : 'NEST-PRO');
  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${referralCode}`
    : `https://nesttube.app/?ref=${referralCode}`;

  const referralsCount = userProfile?.referralsCount || 0;
  const bonusDays = userProfile?.referralBonusDays || (referralsCount * 30);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleApplyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    setIsSubmittingCode(true);
    setStatusMessage(null);

    const res = await applyReferralCode(inputCode.trim());
    setStatusMessage({ text: res.message, isError: !res.success });
    setIsSubmittingCode(false);
    if (res.success) {
      setInputCode('');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NESTTUBE — ৩০ দিনের ফ্রি প্রিমিয়াম উপভোগ করুন!',
          text: `আমার রেফারেল কোড ${referralCode} ব্যবহার করে NESTTUBE এ যোগ দিন এবং ফ্রি ৩০ দিনের অ্যাড-মুক্ত VIP প্রিমিয়াম পান!`,
          url: referralUrl,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Hero Banner */}
      <div className="p-8 md:p-10 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Gift className="w-3.5 h-3.5" />
              <span>রেফার অ্যান্ড আর্ন প্রোগ্রাম (Refer a Friend)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              বন্ধুকে আমন্ত্রণ জানান, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                প্রতি রেফারেলে পান ৩০ দিনের ফ্রি প্রিমিয়াম!
              </span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              আপনার বন্ধুদের সাথে আপনার রেফারেল লিঙ্ক শেয়ার করুন। আপনার বন্ধু যুক্ত হলেই আপনি এবং আপনার বন্ধু উভয়েই পাবেন সম্পূর্ণ ৩০ দিনের অ্যাড-মুক্ত NESTTUBE PRO VIP সাবস্ক্রিপশন!
            </p>
          </div>

          {/* Quick Reward Highlight Card */}
          <div className="w-full lg:w-80 p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl flex flex-col items-center text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-black text-2xl shadow-lg shadow-emerald-500/25">
              30
            </div>
            <div>
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">প্রতি রেফারেলে উপহার</span>
              <span className="text-lg font-black text-white block">৩০ দিন VIP মেম্বারশিপ</span>
            </div>
            <p className="text-[11px] text-neutral-400">কোনো লিমিট নেই — যত রেফার তত বেশি ফ্রি দিন!</p>
          </div>
        </div>
      </div>

      {/* Referral Tracking Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-3xl bg-white/80 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">সফল রেফারেল</span>
            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{referralsCount}</div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2">সক্রিয় আমন্ত্রিত বন্ধু</p>
        </div>

        <div className="p-6 rounded-3xl bg-white/80 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">অর্জিত ফ্রি দিন</span>
            <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{bonusDays} দিন</div>
          <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-2">মোট অর্জিত প্রিমিয়াম ভ্যালু</p>
        </div>

        <div className="p-6 rounded-3xl bg-white/80 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">বর্তমান স্ট্যাটাস</span>
            <Crown className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {userProfile?.isPremium ? 'PRO VIP Active' : 'Free Tier'}
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-2">
            {userProfile?.premiumExpiresAt
              ? `মেয়াদ: ${new Date(userProfile.premiumExpiresAt).toLocaleDateString('bn-BD')}`
              : 'রেফার করে প্রিমিয়াম সক্রিয় করুন'}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white/80 dark:bg-black/50 backdrop-blur-xl border border-black/10 dark:border-white/10 shadow-md">
          <div className="flex items-center justify-between text-slate-500 dark:text-neutral-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">রেফারেল রেট</span>
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">১০০% ফ্রি</div>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-2">আনলিমিটেড এক্সটেনশন</p>
        </div>
      </div>

      {/* Main Referral Actions & Link Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Your Unique Referral Code & Link */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-black/60 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-md dark:shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">আপনার রেফারেল লিঙ্ক ও কোড</h2>
              <p className="text-xs text-slate-600 dark:text-neutral-400 font-medium">বন্ধুদের সাথে শেয়ার করুন এবং বোনাস উপভোগ করুন</p>
            </div>
          </div>

          {!user ? (
            <div className="p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center space-y-4">
              <p className="text-xs text-slate-700 dark:text-neutral-300 font-medium">
                আপনার ব্যক্তিগত রেফারেল কোড পেতে এবং পুরষ্কার ট্র্যাক করতে অ্যাকাউন্টে লগইন করুন।
              </p>
              <button
                onClick={signInWithGoogle}
                className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-neutral-900 font-bold hover:opacity-90 transition-all cursor-pointer text-xs"
              >
                লগইন করে রেফারেল কোড দেখুন
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Code Box */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  আপনার রেফারেল কোড:
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white font-mono font-bold tracking-widest text-base">
                    {referralCode}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 border border-black/10 dark:border-white/10 text-slate-900 dark:text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'কপি হয়েছে' : 'কপি কোড'}</span>
                  </button>
                </div>
              </div>

              {/* Direct Invite URL */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  সরাসরি আমন্ত্রণ লিঙ্ক:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={referralUrl}
                    className="flex-1 px-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-slate-800 dark:text-neutral-300 text-xs font-mono font-medium truncate"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-white dark:text-black font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'কপি হয়েছে' : 'কপি লিঙ্ক'}</span>
                  </button>
                </div>
              </div>

              {/* Instant Social Share Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={handleNativeShare}
                  className="flex-1 py-3 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/10 font-bold text-xs text-slate-800 dark:text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>লিঙ্ক শেয়ার করুন</span>
                </button>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `NESTTUBE এ যোগ দিন এবং ফ্রি ৩০ দিনের VIP প্রিমিয়াম উপভোগ করুন! রেফারেল লিঙ্ক: ${referralUrl}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/30 text-[#128C7E] dark:text-[#25D366] font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Box 2: Have a Friend's Referral Code? Redeem it here */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-black/60 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-md dark:shadow-2xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">বন্ধুর রেফারেল কোড রিডিম করুন</h2>
              <p className="text-xs text-slate-600 dark:text-neutral-400 font-medium">কোড থাকলে প্রবেশ করান এবং সাথে সাথে ৩০ দিন ফ্রি পান</p>
            </div>
          </div>

          {statusMessage && (
            <div
              className={cn(
                "p-4 rounded-2xl border text-xs font-bold flex items-center gap-2",
                statusMessage.isError
                  ? "bg-red-500/20 border-red-500/30 text-red-300"
                  : "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
              )}
            >
              {statusMessage.isError ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {userProfile?.referredBy ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>রেফারেল কোড ইতিমধ্যে সক্রিয় আছে</span>
              </div>
              <p className="text-xs text-neutral-300">
                আপনি রেফারেল কোড <span className="font-mono font-bold text-emerald-300">{userProfile.referredBy}</span> এর মাধ্যমে ৩০ দিনের ফ্রি প্রিমিয়াম বোনাস উপভোগ করছেন।
              </p>
            </div>
          ) : (
            <form onSubmit={handleApplyCode} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  বন্ধুর রেফারেল কোড লিখুন:
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: NEST-A1B2C3"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 font-mono text-sm tracking-wider focus:outline-none focus:border-cyan-500 uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingCode}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmittingCode ? 'যাচাই করা হচ্ছে...' : '৩০ দিনের প্রিমিয়াম সক্রিয় করুন'}
              </button>
            </form>
          )}

          {/* How It Works Steps */}
          <div className="pt-2 border-t border-white/10 space-y-2.5">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">সহজ ৩ ধাপ:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-neutral-300">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="font-bold text-emerald-400 block mb-0.5">১. লিঙ্ক শেয়ার</span>
                <span className="text-[11px] text-neutral-400">আপনার বন্ধুকে রেফারেল লিঙ্ক পাঠান</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="font-bold text-cyan-400 block mb-0.5">২. বন্ধু যুক্ত হবে</span>
                <span className="text-[11px] text-neutral-400">লিঙ্ক দিয়ে ফ্রি অ্যাকাউন্ট তৈরি করবে</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                <span className="font-bold text-purple-400 block mb-0.5">৩. ৩০ দিন ফ্রি</span>
                <span className="text-[11px] text-neutral-400">উভয়েই পেয়ে যাবেন ৩০ দিনের PRO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
