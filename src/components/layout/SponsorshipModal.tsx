import React, { useState } from 'react';
import { X, Heart, Crown, Handshake, Check, Send, Sparkles, Star, Award, Building2, Zap, ArrowRight } from 'lucide-react';

interface SponsorshipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Tier {
  id: string;
  name: string;
  price: string;
  period: string;
  badge: string;
  popular?: boolean;
  icon: React.ElementType;
  color: string;
  border: string;
  bg: string;
  features: string[];
}

const TIERS: Tier[] = [
  {
    id: 'supporter',
    name: 'Fan Supporter',
    price: '$5',
    period: '/ month',
    badge: 'Supporter',
    icon: Heart,
    color: 'text-rose-500',
    border: 'border-rose-500/20',
    bg: 'bg-rose-500/10',
    features: ['Supporter Badge on comments', 'Ad-free experience', 'Early access to new features', 'Community Discord role']
  },
  {
    id: 'creator',
    name: 'Creator Boost',
    price: '$25',
    period: '/ month',
    badge: 'Creator',
    popular: true,
    icon: Zap,
    color: 'text-amber-500',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    features: ['Channel spotlight on homepage', 'Verified Creator badge', 'Featured in Recommended channels', 'Analytics priority queue', 'All Fan Supporter perks']
  },
  {
    id: 'brand',
    name: 'Brand Partner',
    price: '$150',
    period: '/ month',
    badge: 'Official Sponsor',
    icon: Crown,
    color: 'text-purple-500',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
    features: ['Custom banner ad placement', 'Sponsored video tag & boost', 'Logo on NestTube homepage footer', 'Dedicated account manager', 'All Creator Boost perks']
  }
];

const ACTIVE_SPONSORS = [
  { name: 'Apex Media Group', category: 'Digital Creator Agency', tier: 'Brand Partner', logo: 'AM' },
  { name: 'DevStudio Labs', category: 'Developer Tools', tier: 'Gold Sponsor', logo: 'DS' },
  { name: 'ByteStream HQ', category: 'Streaming Solutions', tier: 'Official Partner', logo: 'BS' }
];

export function SponsorshipModal({ isOpen, onClose }: SponsorshipModalProps) {
  const [selectedTier, setSelectedTier] = useState<string>('creator');
  const [formData, setFormData] = useState({ name: '', email: '', company: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ name: '', email: '', company: '', message: '' });
        onClose();
      }, 2500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#181818] border border-neutral-200 dark:border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-neutral-900 dark:text-white flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-neutral-200 dark:border-white/10 flex items-center justify-between bg-neutral-50 dark:bg-[#212121] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Crown className="w-5 h-5 fill-amber-500/20" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">NestTube Sponsorships</h2>
              <p className="text-xs text-neutral-500 dark:text-white/60">Support creators & promote your brand on NestTube</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-500 dark:text-white/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-purple-600/15 border border-amber-500/20 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-extrabold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Partner Program
                </div>
                <h3 className="text-lg font-black tracking-tight">Fuel the Future of Independent Video</h3>
                <p className="text-xs text-neutral-600 dark:text-white/70 max-w-xl leading-relaxed">
                  Join our community of sponsors to get brand exposure, creator perks, and custom promotional opportunities across NestTube.
                </p>
              </div>
            </div>
          </div>

          {/* Sponsorship Tiers Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Select Sponsorship Tier
              </h3>
              <span className="text-xs text-neutral-500 dark:text-white/50">Cancel or upgrade anytime</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {TIERS.map((tier) => {
                const Icon = tier.icon;
                const isSelected = selectedTier === tier.id;

                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-500/5 ring-2 ring-blue-500/30' 
                        : `${tier.border} hover:border-neutral-400 dark:hover:border-white/20 bg-neutral-50 dark:bg-white/5`
                    }`}
                  >
                    {tier.popular && (
                      <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                        Most Popular
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className={`p-2 rounded-xl ${tier.bg} ${tier.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm">{tier.name}</h4>
                          <span className="text-[10px] text-neutral-500 dark:text-white/50">{tier.badge}</span>
                        </div>
                      </div>

                      <div className="my-3 flex items-baseline gap-1">
                        <span className="text-2xl font-black">{tier.price}</span>
                        <span className="text-xs text-neutral-500 dark:text-white/60">{tier.period}</span>
                      </div>

                      <ul className="space-y-2 mb-4">
                        {tier.features.map((feat, idx) => (
                          <li key={idx} className="text-xs text-neutral-600 dark:text-white/80 flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedTier(tier.id)}
                      className={`w-full py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-neutral-200 dark:bg-white/10 text-neutral-800 dark:text-white hover:bg-neutral-300 dark:hover:bg-white/20'
                      }`}
                    >
                      {isSelected ? 'Selected Tier' : 'Choose Tier'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Sponsors Wall */}
          <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-[#212121] border border-neutral-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-500" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-neutral-600 dark:text-white/70">Our Official Sponsors</h4>
              </div>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">Join 12+ Sponsors</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {ACTIVE_SPONSORS.map((sp, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200 dark:border-white/10 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {sp.logo}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs truncate">{sp.name}</div>
                    <div className="text-[10px] text-neutral-500 dark:text-white/50 truncate">{sp.category}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inquiry / Sponsorship Form */}
          {isSuccess ? (
            <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-center space-y-2 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 mx-auto flex items-center justify-center">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-green-600 dark:text-green-400">Sponsorship Request Sent!</h4>
              <p className="text-xs text-neutral-600 dark:text-white/70">
                Thank you for supporting NestTube. Our team will contact you shortly to complete setup.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">Submit Sponsorship Inquiry</h4>
                  <p className="text-xs text-neutral-500 dark:text-white/60">Selected Plan: <span className="font-bold text-blue-600 dark:text-blue-400">{TIERS.find(t => t.id === selectedTier)?.name}</span></p>
                </div>
                <Handshake className="w-5 h-5 text-amber-500" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-white/60 mb-1">Your / Brand Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Inc or Tech Creator"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200 dark:border-white/10 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 dark:text-white/60 mb-1">Contact Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="partner@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200 dark:border-white/10 text-xs focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 dark:text-white/60 mb-1">Special Requirements / Custom Goals (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Tell us about your brand goals, target audience, or custom placement ideas..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#181818] border border-neutral-200 dark:border-white/10 text-xs focus:outline-none focus:border-blue-500 transition-colors resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-white/10 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.email.trim()}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Request Sponsorship</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
