import { create } from 'zustand';

export interface CoinPackage {
  id: string;
  coins: number;
  bdtPrice: number;
  popular?: boolean;
  bestValue?: boolean;
  bonus?: number;
}

export interface VirtualGift {
  id: string;
  name: string;
  banglaName: string;
  coins: number;
  icon: string;
  animationColor: string;
}

export const COIN_PACKAGES: CoinPackage[] = [
  { id: 'pack-100', coins: 100, bdtPrice: 50, bonus: 0 },
  { id: 'pack-250', coins: 250, bdtPrice: 120, popular: true, bonus: 20 },
  { id: 'pack-500', coins: 500, bdtPrice: 220, bestValue: true, bonus: 50 },
  { id: 'pack-1200', coins: 1200, bdtPrice: 500, bonus: 150 },
];

export const VIRTUAL_GIFTS: VirtualGift[] = [
  { id: 'rose', name: 'Rose', banglaName: 'গোলাপ', coins: 10, icon: '🌹', animationColor: '#ff2d6f' },
  { id: 'chocolate', name: 'Chocolate', banglaName: 'চকলেট', coins: 25, icon: '🍫', animationColor: '#a16207' },
  { id: 'heart', name: 'Love Heart', banglaName: 'ভালোবাসা', coins: 50, icon: '💖', animationColor: '#ec4899' },
  { id: 'crown', name: 'Gold Crown', banglaName: 'মুকুট', coins: 100, icon: '👑', animationColor: '#eab308' },
  { id: 'rocket', name: 'Super Rocket', banglaName: 'রকেট', coins: 250, icon: '🚀', animationColor: '#06b6d4' },
  { id: 'diamond', name: 'Diamond', banglaName: 'হীরা', coins: 500, icon: '💎', animationColor: '#8b5cf6' },
];

interface CoinState {
  coins: number;
  isRechargeModalOpen: boolean;
  isGiftModalOpen: boolean;
  selectedVideoForGift: { id: string; title: string; channel: string } | null;
  lastCelebration: { gift: VirtualGift; time: number } | null;
  
  // Actions
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  openRechargeModal: () => void;
  closeRechargeModal: () => void;
  openGiftModal: (video: { id: string; title: string; channel: string }) => void;
  closeGiftModal: () => void;
  sendGift: (gift: VirtualGift) => boolean;
  clearCelebration: () => void;
}

const STORAGE_KEY = 'pipratube_coin_balance';

export const useCoinStore = create<CoinState>((set, get) => {
  const saved = localStorage.getItem(STORAGE_KEY);
  const initialCoins = saved !== null ? parseInt(saved, 10) : 150; // Welcome 150 coins bonus!

  return {
    coins: isNaN(initialCoins) ? 150 : initialCoins,
    isRechargeModalOpen: false,
    isGiftModalOpen: false,
    selectedVideoForGift: null,
    lastCelebration: null,

    addCoins: (amount: number) => {
      set((state) => {
        const next = state.coins + amount;
        localStorage.setItem(STORAGE_KEY, next.toString());
        return { coins: next };
      });
    },

    spendCoins: (amount: number) => {
      const current = get().coins;
      if (current < amount) return false;
      const next = current - amount;
      localStorage.setItem(STORAGE_KEY, next.toString());
      set({ coins: next });
      return true;
    },

    openRechargeModal: () => set({ isRechargeModalOpen: true }),
    closeRechargeModal: () => set({ isRechargeModalOpen: false }),

    openGiftModal: (video) => set({ isGiftModalOpen: true, selectedVideoForGift: video }),
    closeGiftModal: () => set({ isGiftModalOpen: false, selectedVideoForGift: null }),

    sendGift: (gift) => {
      const success = get().spendCoins(gift.coins);
      if (success) {
        set({ lastCelebration: { gift, time: Date.now() }, isGiftModalOpen: false });
      }
      return success;
    },

    clearCelebration: () => set({ lastCelebration: null }),
  };
});
