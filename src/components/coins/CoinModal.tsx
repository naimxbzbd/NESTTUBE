import React, { useState } from 'react';
import { X, Coins, Check, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useCoinStore, COIN_PACKAGES, CoinPackage } from '../../store/useCoinStore';

export const CoinModal: React.FC = () => {
  const { coins, isRechargeModalOpen, closeRechargeModal, addCoins } = useCoinStore();
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage>(COIN_PACKAGES[1]);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [phone, setPhone] = useState('017');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isRechargeModalOpen) return null;

  const handleRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 11) {
      setErrorMessage('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Simulate instant payment verification via bKash/Nagad gateway
    setTimeout(() => {
      const totalToAdd = selectedPackage.coins + (selectedPackage.bonus || 0);
      addCoins(totalToAdd);
      setIsProcessing(false);
      setSuccessMessage(`অভিনন্দন! আপনার অ্যাকাউন্টে ${totalToAdd} কয়েন সফলভাবে যুক্ত হয়েছে।`);
      setTimeout(() => {
        setSuccessMessage(null);
        closeRechargeModal();
      }, 2000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#121824] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with PipraTube Brand Gradient */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#161d27] to-[#121824]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ff9a1f] to-[#ff2d6f] flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                পিপড়াটিউব কয়েন ওয়ালেট
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-[#ff2d6f] border border-pink-500/30">
                  PipraCoins
                </span>
              </h2>
              <p className="text-xs text-gray-400">আপনার বর্তমান ব্যালান্স: <span className="text-amber-400 font-bold font-mono">{coins} কয়েন</span></p>
            </div>
          </div>
          <button
            onClick={closeRechargeModal}
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {successMessage ? (
            <div className="p-6 text-center space-y-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl animate-in zoom-in-95">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">{successMessage}</h3>
              <p className="text-sm text-emerald-400">নতুন ব্যালান্স: {coins} কয়েন</p>
            </div>
          ) : (
            <>
              {/* Step 1: Choose Coin Package */}
              <div>
                <label className="text-sm font-semibold text-gray-200 block mb-3">
                  ১. কয়েন প্যাকেজ নির্বাচন করুন:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {COIN_PACKAGES.map((pkg) => {
                    const isSelected = selectedPackage.id === pkg.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedPackage(pkg)}
                        className={`relative p-3.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-[#ff2d6f] shadow-lg shadow-pink-500/10'
                            : 'bg-[#161d27] border-white/5 hover:border-white/20'
                        }`}
                      >
                        {pkg.bestValue && (
                          <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#ff2d6f] text-white uppercase tracking-wider">
                            সেরা ভ্যালু
                          </span>
                        )}
                        {pkg.popular && (
                          <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-black uppercase tracking-wider">
                            জনপ্রিয়
                          </span>
                        )}
                        <div className="flex items-center gap-2 mb-1">
                          <Coins className="w-4 h-4 text-amber-400" />
                          <span className="font-bold text-white text-base">
                            {pkg.coins} কয়েন
                          </span>
                        </div>
                        {pkg.bonus ? (
                          <div className="text-[11px] text-pink-400 flex items-center gap-1 font-medium mb-1">
                            <Sparkles className="w-3 h-3" />
                            + {pkg.bonus} বোনাস কয়েন
                          </div>
                        ) : null}
                        <div className="text-xs font-semibold text-gray-300">
                          ৳ {pkg.bdtPrice} টাকা
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Payment Gateway Selection */}
              <div>
                <label className="text-sm font-semibold text-gray-200 block mb-3">
                  ২. পেমেন্ট মাধ্যম নির্বাচন করুন:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      paymentMethod === 'bkash'
                        ? 'border-[#e2136e] bg-[#e2136e]/15'
                        : 'border-white/5 bg-[#161d27] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#e2136e] text-white flex items-center justify-center font-bold text-xs">
                        bK
                      </div>
                      <span className="text-sm font-bold text-white">বিকাশ (bKash)</span>
                    </div>
                    {paymentMethod === 'bkash' && <Check className="w-4 h-4 text-[#e2136e]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      paymentMethod === 'nagad'
                        ? 'border-[#f7941d] bg-[#f7941d]/15'
                        : 'border-white/5 bg-[#161d27] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#f7941d] text-white flex items-center justify-center font-bold text-xs">
                        না
                      </div>
                      <span className="text-sm font-bold text-white">নগদ (Nagad)</span>
                    </div>
                    {paymentMethod === 'nagad' && <Check className="w-4 h-4 text-[#f7941d]" />}
                  </button>
                </div>
              </div>

              {/* Step 3: Phone input and submit */}
              <form onSubmit={handleRecharge} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">
                    আপনার {paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'} অ্যাকাউন্ট নম্বর
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-[#161d27] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#ff2d6f] transition-colors"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="p-3 bg-white/5 rounded-xl flex items-center justify-between text-xs text-gray-300">
                  <span>মোট প্রদেয় মূল্য:</span>
                  <span className="text-base font-bold text-white">৳ {selectedPackage.bdtPrice} BDT</span>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ff2d6f] to-[#c026d3] text-white font-bold text-sm hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>প্রসেসিং হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-4 h-4" />
                      <span>{selectedPackage.coins} কয়েন রিচার্জ করুন</span>
                    </>
                  )}
                </button>
              </form>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 text-center pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>নিরাপদ ও তাৎক্ষণিক স্বয়ংক্রিয় রিচার্জ পদ্ধতি</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
