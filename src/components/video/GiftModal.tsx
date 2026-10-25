import React, { useState } from 'react';
import { X, Gift, Coins, Plus, Check, Sparkles } from 'lucide-react';
import { useCoinStore, VIRTUAL_GIFTS, VirtualGift } from '../../store/useCoinStore';

export const GiftModal: React.FC = () => {
  const {
    coins,
    isGiftModalOpen,
    closeGiftModal,
    selectedVideoForGift,
    sendGift,
    openRechargeModal,
  } = useCoinStore();

  const [selectedGift, setSelectedGift] = useState<VirtualGift>(VIRTUAL_GIFTS[0]);
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  if (!isGiftModalOpen || !selectedVideoForGift) return null;

  const handleSend = () => {
    if (coins < selectedGift.coins) {
      // Need recharge
      closeGiftModal();
      openRechargeModal();
      return;
    }

    const success = sendGift(selectedGift);
    if (success) {
      setSentNotice(`আপনি সফলভাবে ${selectedGift.banglaName} ${selectedGift.icon} উপহার পাঠিয়েছেন!`);
      setTimeout(() => {
        setSentNotice(null);
        closeGiftModal();
      }, 1800);
    }
  };

  const hasEnoughCoins = coins >= selectedGift.coins;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md glass-panel border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff2d6f] to-[#c026d3] flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">গিফট পাঠান (Send Gift)</h2>
              <p className="text-xs text-gray-400 truncate max-w-[200px]">
                {selectedVideoForGift.channel || selectedVideoForGift.title}
              </p>
            </div>
          </div>
          <button
            onClick={closeGiftModal}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {sentNotice ? (
            <div className="py-8 text-center space-y-3 bg-pink-500/10 border border-pink-500/30 rounded-xl">
              <div className="text-5xl animate-bounce">{selectedGift.icon}</div>
              <h3 className="text-base font-bold text-white">{sentNotice}</h3>
              <p className="text-xs text-pink-400">ক্রিয়েটর আপনার উপহার পেয়েছেন!</p>
            </div>
          ) : (
            <>
              {/* User Balance Strip */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl glass-card">
                <div className="flex items-center gap-2.5">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <div>
                    <span className="text-xs text-slate-400 block">আপনার বর্তমান ব্যালান্স</span>
                    <span className="text-sm font-bold text-white font-mono">{coins} কয়েন</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    closeGiftModal();
                    openRechargeModal();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-pink-500/20 text-[#ff2d6f] hover:bg-pink-500/30 text-xs font-bold flex items-center gap-1.5 border border-pink-500/30 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>কয়েন কিনুন</span>
                </button>
              </div>

              {/* Gifts Grid */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2.5">
                  একটি উপহার নির্বাচন করুন:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {VIRTUAL_GIFTS.map((gift) => {
                    const isSelected = selectedGift.id === gift.id;
                    const canAfford = coins >= gift.coins;
                    return (
                      <button
                        key={gift.id}
                        type="button"
                        onClick={() => setSelectedGift(gift)}
                        className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-b from-pink-500/25 to-purple-500/20 border-[#ff2d6f] ring-2 ring-pink-500/30 shadow-lg shadow-pink-500/20 scale-[1.02]'
                            : 'glass-card border-white/5 hover:border-white/20'
                        } ${!canAfford ? 'opacity-70' : ''}`}
                      >
                        <span className="text-3xl mb-1 filter drop-shadow-md">{gift.icon}</span>
                        <span className="text-xs font-bold text-white">{gift.banglaName}</span>
                        <div className="flex items-center gap-1 mt-1 text-[11px] font-mono font-semibold text-amber-400">
                          <Coins className="w-3 h-3" />
                          <span>{gift.coins}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Gift Summary & Send CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSend}
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                    hasEnoughCoins
                      ? 'bg-gradient-to-r from-[#ff2d6f] to-[#c026d3] text-white hover:opacity-95 shadow-pink-500/25 active:scale-[0.99]'
                      : 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20'
                  }`}
                >
                  {hasEnoughCoins ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {selectedGift.banglaName} উপহার পাঠান ({selectedGift.coins} কয়েন)
                      </span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>কয়েন অপর্যাপ্ত — রিচার্জ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
