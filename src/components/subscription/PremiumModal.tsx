import React, { useState } from 'react';
import { 
  X, 
  Crown, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CreditCard, 
  Tag, 
  Smartphone, 
  Sliders, 
  AlertCircle,
  ExternalLink,
  Flame,
  ArrowRight,
  Shield,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUserStore } from '../../store/useUserStore';
import { useAdsterra } from '../../context/AdsterraContext';
import { usePaymentStore } from '../../store/usePaymentStore';
import { cn } from '../../lib/utils';

export type PlanType = 'annual' | 'monthly' | 'lifetime';

export const PremiumModal: React.FC = () => {
  const { 
    isPremium, 
    premiumPlan, 
    premiumSince, 
    premiumExpiresAt,
    activatePremium, 
    cancelPremium, 
    applyCoupon,
    currentUser 
  } = useUserStore();

  const { isPremiumModalOpen, closePremiumModal } = useAdsterra();
  const { openBkashModal } = usePaymentStore();

  // Subscription state
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'coupon'>('card');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Simulated card inputs
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardName, setCardName] = useState(currentUser?.name || 'Valued Subscriber');

  if (!isPremiumModalOpen) return null;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    val = val.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(val);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 2) {
      val = `${val.substring(0, 2)}/${val.substring(2)}`;
    }
    setCardExpiry(val);
  };

  const handleSubscribe = () => {
    setIsProcessing(true);
    setTimeout(() => {
      activatePremium(selectedPlan);
      setIsProcessing(false);
      setShowCelebration(true);
    }, 700);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) {
      setCouponError('Please enter a promo code');
      return;
    }

    const success = applyCoupon(couponInput.trim());
    if (success) {
      setCouponSuccess(true);
      setCouponError('');
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        setShowCelebration(true);
      }, 500);
    } else {
      setCouponError('Invalid promo code. Try PREMIUM2026, ADFREE, or VIP2026');
      setCouponSuccess(false);
    }
  };

  const handleQuickToggleOff = () => {
    cancelPremium();
  };

  const handleQuickToggleOn = () => {
    activatePremium(selectedPlan);
  };

  const planPricing = {
    annual: {
      monthlyRate: '$3.33',
      billed: '$39.99 billed annually',
      savings: 'Save 44%',
      trial: '14-Day Free Trial',
    },
    monthly: {
      monthlyRate: '$5.99',
      billed: '$5.99 billed monthly',
      savings: 'Flexible',
      trial: 'Cancel Anytime',
    },
    lifetime: {
      monthlyRate: '$69.99',
      billed: 'One-time payment • Never renews',
      savings: 'Best Long-Term',
      trial: 'Lifetime Pass',
    },
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-neutral-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden text-neutral-100"
        >
          {/* Top Ambient Glow Banner */}
          <div className="relative h-28 sm:h-32 bg-gradient-to-r from-amber-600/30 via-yellow-500/20 to-purple-600/30 border-b border-amber-500/20 flex items-center justify-between px-6 shrink-0 overflow-hidden">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg ring-4 ring-amber-500/20">
                <Crown className="w-6 h-6 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                    NESTTUBE PREMIUM
                  </h3>
                  {isPremium && (
                    <span className="bg-amber-500 text-black font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-full shadow-xs">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-200/90 font-medium">
                  {isPremium 
                    ? '100% Ad-Free Subscription Active' 
                    : 'Unlimited Ad-Free Video Streaming & VIP Access'}
                </p>
              </div>
            </div>

            <button
              onClick={closePremiumModal}
              className="relative z-10 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">

            {/* If celebration active */}
            {showCelebration ? (
              <div className="py-8 px-4 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mx-auto flex items-center justify-center text-white shadow-xl animate-bounce">
                  <Crown className="w-8 h-8 fill-white" />
                </div>
                <h4 className="text-2xl font-black text-white">
                  Welcome to Ad-Free Premium!
                </h4>
                <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                  All Adsterra banners (728x90, 300x250), video interstitials, popunders, and feed ads have been completely deactivated.
                </p>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 max-w-sm mx-auto text-xs text-amber-300">
                  <div className="font-bold mb-1">👑 Active Plan: {selectedPlan.toUpperCase()} PASS</div>
                  <div>Enjoy seamless video streaming with zero interruptions.</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCelebration(false);
                    closePremiumModal();
                  }}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg cursor-pointer transition-all active:scale-95"
                >
                  Start Watching Ad-Free →
                </button>
              </div>
            ) : isPremium ? (
              /* ALREADY SUBSCRIBED / MANAGEMENT VIEW */
              <div className="space-y-5">
                {/* Active Membership Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-amber-500/40 relative overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                        <Crown className="w-5 h-5 fill-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-white">
                            {currentUser?.name || 'Premium Member'}
                          </h4>
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-0.5">
                          {currentUser?.email || 'Active on this browser'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                        {premiumPlan ? `${premiumPlan.toUpperCase()} PASS` : 'ANNUAL PASS'}
                      </span>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {premiumExpiresAt || 'Renews Nov 2027'}
                      </div>
                    </div>
                  </div>

                  {/* Active Perks List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 pt-4 border-t border-neutral-800 text-xs text-neutral-300">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>All Adsterra Banners Blocked</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Zero Interstitials & Popunders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Zero Floating Overlays or Popups</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Ultra HD 4K & Instant Playback</span>
                    </div>
                  </div>
                </div>

                {/* Management Toggles & Actions */}
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-neutral-400">
                    Subscription Management
                  </h5>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div>
                      <span className="font-semibold text-xs text-white block">Ad-Free Mode Status</span>
                      <span className="text-[11px] text-neutral-400">
                        Temporarily toggle ads back on to preview how free visitors experience NESTTube.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleQuickToggleOff}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      Disable Ad-Free (Test Ads)
                    </button>
                  </div>

                  <hr className="border-neutral-800 my-2" />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-neutral-400">
                      Need to cancel or transfer membership?
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        cancelPremium();
                        closePremiumModal();
                      }}
                      className="text-xs text-red-400 hover:text-red-300 hover:underline cursor-pointer font-medium"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* NOT SUBSCRIBED: SIGN-UP FLOW */
              <div className="space-y-6">

                {/* Core Benefits Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-white">100% Ad-Free</h5>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                        Zero banners, popunders, or video pre-roll pauses.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-white">Instant Playback</h5>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                        Immediate start without 5-second countdown timers.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800/80 flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-white">4K & PiP Support</h5>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
                        Highest bitrates and seamless background listening.
                      </p>
                    </div>
                  </div>
                </div>

                {/* bKash / Nagad / Rocket Bangladeshi Payment Action Banner */}
                <div 
                  onClick={() => {
                    closePremiumModal();
                    openBkashModal();
                  }}
                  className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/15 via-orange-500/15 to-purple-500/15 border border-pink-500/40 hover:border-pink-500/70 transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-sm hover:shadow-pink-500/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-600 via-orange-500 to-purple-600 text-white font-black flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition-transform">
                      ৳
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-white group-hover:text-amber-400 transition-colors">
                          বিকাশ / নগদ / রকেট দিয়ে প্রো কিনুন (Send Money)
                        </span>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-amber-500 text-black rounded-full">
                          Personal: 01703223141
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-300 block mt-0.5">
                        ১ মাস (১০০ ৳) • ৬ মাস (৫০০ ৳) • ১ বছর (৯০০ ৳) — TrxID দিয়ে ভেরিফাই করুন
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white font-extrabold text-xs shrink-0 flex items-center gap-1.5 shadow-md group-hover:scale-105 transition-all cursor-pointer"
                  >
                    <span>Pay with bKash</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Plan Selection Cards */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-neutral-400">
                      Choose Your Plan
                    </span>
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      14-Day Money Back Guarantee
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Annual Plan */}
                    <div
                      onClick={() => setSelectedPlan('annual')}
                      className={cn(
                        "p-3.5 rounded-xl border relative cursor-pointer transition-all flex flex-col justify-between",
                        selectedPlan === 'annual'
                          ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10"
                          : "bg-neutral-950 border-neutral-800 hover:border-neutral-700"
                      )}
                    >
                      <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs">
                        Popular • Save 44%
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">Annual Pass</span>
                          <div className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center",
                            selectedPlan === 'annual' ? "border-amber-400 bg-amber-400 text-black" : "border-neutral-600"
                          )}>
                            {selectedPlan === 'annual' && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="mt-2">
                          <span className="text-xl font-black text-white">$3.33</span>
                          <span className="text-xs text-neutral-400"> / month</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-neutral-400 mt-2 pt-2 border-t border-white/5">
                        $39.99 billed annually after 14-day trial.
                      </p>
                    </div>

                    {/* Monthly Plan */}
                    <div
                      onClick={() => setSelectedPlan('monthly')}
                      className={cn(
                        "p-3.5 rounded-xl border relative cursor-pointer transition-all flex flex-col justify-between",
                        selectedPlan === 'monthly'
                          ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10"
                          : "bg-neutral-950 border-neutral-800 hover:border-neutral-700"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">Monthly</span>
                          <div className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center",
                            selectedPlan === 'monthly' ? "border-amber-400 bg-amber-400 text-black" : "border-neutral-600"
                          )}>
                            {selectedPlan === 'monthly' && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="mt-2">
                          <span className="text-xl font-black text-white">$5.99</span>
                          <span className="text-xs text-neutral-400"> / month</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-neutral-400 mt-2 pt-2 border-t border-white/5">
                        Billed monthly. Cancel anytime with 1 click.
                      </p>
                    </div>

                    {/* Lifetime Plan */}
                    <div
                      onClick={() => setSelectedPlan('lifetime')}
                      className={cn(
                        "p-3.5 rounded-xl border relative cursor-pointer transition-all flex flex-col justify-between",
                        selectedPlan === 'lifetime'
                          ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10"
                          : "bg-neutral-950 border-neutral-800 hover:border-neutral-700"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-white">Lifetime Pass</span>
                          <div className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center",
                            selectedPlan === 'lifetime' ? "border-amber-400 bg-amber-400 text-black" : "border-neutral-600"
                          )}>
                            {selectedPlan === 'lifetime' && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="mt-2">
                          <span className="text-xl font-black text-white">$69.99</span>
                          <span className="text-xs text-neutral-400"> one-time</span>
                        </div>
                      </div>

                      <p className="text-[10px] text-neutral-400 mt-2 pt-2 border-t border-white/5">
                        Pay once. Ad-free forever on all updates.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Methods & Checkout */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider text-neutral-400">
                      Payment / Activation Method
                    </span>

                    {/* Payment tabs */}
                    <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={cn(
                          "px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1",
                          paymentMethod === 'card' ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
                        )}
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>Card</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('wallet')}
                        className={cn(
                          "px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1",
                          paymentMethod === 'wallet' ? "bg-neutral-800 text-white" : "text-neutral-400 hover:text-white"
                        )}
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>Digital Pay</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('coupon')}
                        className={cn(
                          "px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1",
                          paymentMethod === 'coupon' ? "bg-amber-500 text-black font-bold" : "text-neutral-400 hover:text-white"
                        )}
                      >
                        <Tag className="w-3 h-3" />
                        <span>Promo Code</span>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
                      <div>
                        <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                          Card Number
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="4242 4242 4242 4242"
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono tracking-wider text-white focus:outline-none focus:border-amber-400"
                          />
                          <CreditCard className="w-4 h-4 text-neutral-500 absolute right-3 top-2.5" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                            Expires (MM/YY)
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            placeholder="12/28"
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                            Security CVC
                          </label>
                          <input
                            type="text"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').substring(0, 4))}
                            placeholder="888"
                            className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-neutral-400 block mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'wallet' && (
                    <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                      <p className="text-xs text-neutral-400 mb-2">
                        Complete your subscription with your preferred digital wallet.
                      </p>
                      <button
                        type="button"
                        onClick={handleSubscribe}
                        className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                      >
                        <span>Google Pay</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSubscribe}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#0070ba] hover:bg-[#005ea6] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
                      >
                        <span>PayPal Checkout</span>
                      </button>
                    </div>
                  )}

                  {paymentMethod === 'coupon' && (
                    <form onSubmit={handleApplyCoupon} className="p-4 rounded-xl bg-neutral-950 border border-amber-500/30 space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-amber-300 block mb-1">
                          Enter Promo Code or Gift Voucher
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            placeholder="e.g. PREMIUM2026, ADFREE, VIP2026"
                            className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs font-mono uppercase text-white focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors cursor-pointer shrink-0"
                          >
                            Redeem
                          </button>
                        </div>
                      </div>

                      {couponError && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{couponError}</span>
                        </p>
                      )}

                      <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-white/5 text-[11px] text-neutral-400">
                        <span className="font-semibold text-neutral-300">Available test codes: </span>
                        <code className="text-amber-300 font-mono">PREMIUM2026</code>, <code className="text-amber-300 font-mono">ADFREE</code>, or <code className="text-amber-300 font-mono">VIP2026</code>
                      </div>
                    </form>
                  )}
                </div>

                {/* Primary CTA and Demo Shortcuts */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    disabled={isProcessing}
                    className="w-full py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                  >
                    {isProcessing ? (
                      <span className="animate-pulse">Activating Ad-Free Membership...</span>
                    ) : (
                      <>
                        <Crown className="w-4 h-4 fill-black" />
                        <span>
                          {selectedPlan === 'annual'
                            ? 'Start 14-Day Free Trial & Activate'
                            : selectedPlan === 'lifetime'
                            ? 'Activate Lifetime Pass ($69.99)'
                            : 'Start Monthly Subscription ($5.99)'}
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1 pt-1">
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <Shield className="w-3 h-3" />
                      <span>Zero charge during trial • Cancel anytime</span>
                    </span>

                    {/* Instant 1-Click Evaluation Shortcut */}
                    <button
                      type="button"
                      onClick={() => {
                        activatePremium('annual');
                        setShowCelebration(true);
                      }}
                      className="text-amber-400 hover:text-amber-300 hover:underline cursor-pointer font-bold"
                    >
                      ⚡ Instant 1-Click Demo
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Footer Info */}
          <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-400 shrink-0">
            <span>
              NESTTUBE Premium: 100% ad-free video streaming platform
            </span>
            <span>
              Safe & secure 256-bit SSL
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
