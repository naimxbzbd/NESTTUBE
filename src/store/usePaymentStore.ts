import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserStore } from './useUserStore';

export type PaymentMethod = 'bkash' | 'nagad' | 'rocket';
export type PaymentPackageId = '1_month' | '6_months' | '1_year';

export interface PaymentPackage {
  id: PaymentPackageId;
  name: string;
  nameBn: string;
  durationDays: number;
  amountBDT: number;
  popular?: boolean;
  savings?: string;
  planKey: 'monthly' | 'annual' | 'lifetime';
}

export const PRO_PAYMENT_PACKAGES: PaymentPackage[] = [
  {
    id: '1_month',
    name: '1 Month PRO',
    nameBn: '১ মাস প্রো',
    durationDays: 30,
    amountBDT: 100,
    popular: true,
    planKey: 'monthly',
  },
  {
    id: '6_months',
    name: '6 Months PRO',
    nameBn: '৬ মাস প্রো',
    durationDays: 180,
    amountBDT: 500,
    savings: 'Save 100 ৳',
    planKey: 'annual',
  },
  {
    id: '1_year',
    name: '1 Year PRO',
    nameBn: '১ বছর প্রো',
    durationDays: 365,
    amountBDT: 900,
    savings: 'Best Value • Save 300 ৳',
    planKey: 'annual',
  },
];

export interface ManualPaymentRequest {
  id: string;
  userId?: string;
  userEmail: string;
  userName: string;
  method: PaymentMethod;
  personalNumber: string;
  senderNumber: string;
  trxId: string;
  packageId: PaymentPackageId;
  packageName: string;
  amountBDT: number;
  durationDays: number;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
  reviewedAt?: number;
  rejectReason?: string;
}

interface PaymentStoreState {
  personalNumber: string;
  paymentRequests: ManualPaymentRequest[];
  adminPin: string;
  isAdminUnlocked: boolean;
  isBkashModalOpen: boolean;
  isAdminModalOpen: boolean;
  
  // UI triggers
  openBkashModal: () => void;
  closeBkashModal: () => void;
  openAdminModal: () => void;
  closeAdminModal: () => void;
  unlockAdmin: (pin: string) => boolean;
  lockAdmin: () => void;

  // Actions
  submitPaymentRequest: (data: {
    userEmail: string;
    userName: string;
    method: PaymentMethod;
    senderNumber: string;
    trxId: string;
    packageId: PaymentPackageId;
  }) => ManualPaymentRequest;

  approvePaymentRequest: (requestId: string) => boolean;
  rejectPaymentRequest: (requestId: string, reason?: string) => boolean;
  deletePaymentRequest: (requestId: string) => void;
  seedDemoRequest: () => void;
}

export const usePaymentStore = create<PaymentStoreState>()(
  persist(
    (set, get) => ({
      personalNumber: '01703223141',
      paymentRequests: [
        {
          id: 'demo-req-1',
          userEmail: 'demo@nesttube.com',
          userName: 'Demo Viewer',
          method: 'bkash',
          personalNumber: '01703223141',
          senderNumber: '01711223344',
          trxId: 'BL749KQ982',
          packageId: '1_month',
          packageName: '1 Month PRO (100 ৳)',
          amountBDT: 100,
          durationDays: 30,
          status: 'pending',
          submittedAt: Date.now() - 1000 * 60 * 25, // 25 mins ago
        }
      ],
      adminPin: '1234',
      isAdminUnlocked: false,
      isBkashModalOpen: false,
      isAdminModalOpen: false,

      openBkashModal: () => set({ isBkashModalOpen: true }),
      closeBkashModal: () => set({ isBkashModalOpen: false }),
      openAdminModal: () => set({ isAdminModalOpen: true }),
      closeAdminModal: () => set({ isAdminModalOpen: false }),

      unlockAdmin: (pin: string) => {
        const correct = pin.trim() === get().adminPin;
        if (correct) {
          set({ isAdminUnlocked: true });
        }
        return correct;
      },
      lockAdmin: () => set({ isAdminUnlocked: false }),

      submitPaymentRequest: (data) => {
        const pkg = PRO_PAYMENT_PACKAGES.find(p => p.id === data.packageId) || PRO_PAYMENT_PACKAGES[0];
        const newRequest: ManualPaymentRequest = {
          id: `trx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          userEmail: data.userEmail || 'guest@nesttube.com',
          userName: data.userName || 'NESTTube Subscriber',
          method: data.method,
          personalNumber: get().personalNumber,
          senderNumber: data.senderNumber.trim(),
          trxId: data.trxId.trim().toUpperCase(),
          packageId: pkg.id,
          packageName: `${pkg.name} (${pkg.amountBDT} ৳)`,
          amountBDT: pkg.amountBDT,
          durationDays: pkg.durationDays,
          status: 'pending',
          submittedAt: Date.now(),
        };

        set((state) => ({
          paymentRequests: [newRequest, ...state.paymentRequests],
        }));

        return newRequest;
      },

      approvePaymentRequest: (requestId: string) => {
        const { paymentRequests } = get();
        const req = paymentRequests.find((r) => r.id === requestId);
        if (!req) return false;

        const durationMs = req.durationDays * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const expiryTimestamp = now + durationMs;
        const expiryDate = new Date(expiryTimestamp);
        const formattedExpiry = expiryDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const formattedSince = new Date(now).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        // Activate PRO in user store
        const userStore = useUserStore.getState();
        const targetPlan: 'monthly' | 'annual' | 'lifetime' = req.durationDays >= 365 ? 'annual' : 'monthly';

        if (userStore.currentUser) {
          const updatedUser = {
            ...userStore.currentUser,
            isPremium: true,
            premiumPlan: targetPlan,
            premiumSince: formattedSince,
            premiumExpiresAt: formattedExpiry,
          };
          useUserStore.setState({
            currentUser: updatedUser,
            isPremium: true,
            premiumPlan: targetPlan,
            premiumSince: formattedSince,
            premiumExpiresAt: formattedExpiry,
            accounts: userStore.accounts.map((a) =>
              a.email === userStore.currentUser?.email ? updatedUser : a
            ),
          });
        } else {
          useUserStore.setState({
            isPremium: true,
            premiumPlan: targetPlan,
            premiumSince: formattedSince,
            premiumExpiresAt: formattedExpiry,
          });
        }

        // Update request status to approved
        set({
          paymentRequests: paymentRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: 'approved', reviewedAt: Date.now() }
              : r
          ),
        });

        return true;
      },

      rejectPaymentRequest: (requestId: string, reason = 'Invalid TrxID or payment not received') => {
        set((state) => ({
          paymentRequests: state.paymentRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: 'rejected', reviewedAt: Date.now(), rejectReason: reason }
              : r
          ),
        }));
        return true;
      },

      deletePaymentRequest: (requestId: string) => {
        set((state) => ({
          paymentRequests: state.paymentRequests.filter((r) => r.id !== requestId),
        }));
      },

      seedDemoRequest: () => {
        const randomNum = Math.floor(10000000 + Math.random() * 90000000);
        const randomTrx = 'TRX' + Math.random().toString(36).substring(2, 9).toUpperCase();
        const methods: PaymentMethod[] = ['bkash', 'nagad', 'rocket'];
        const chosenMethod = methods[Math.floor(Math.random() * methods.length)];
        const pkgs = PRO_PAYMENT_PACKAGES;
        const chosenPkg = pkgs[Math.floor(Math.random() * pkgs.length)];

        const sample: ManualPaymentRequest = {
          id: `trx-${Date.now()}`,
          userEmail: `subscriber${Math.floor(Math.random() * 999)}@gmail.com`,
          userName: `Viewer #${Math.floor(100 + Math.random() * 900)}`,
          method: chosenMethod,
          personalNumber: get().personalNumber,
          senderNumber: `017${randomNum.toString().slice(0, 8)}`,
          trxId: randomTrx,
          packageId: chosenPkg.id,
          packageName: `${chosenPkg.name} (${chosenPkg.amountBDT} ৳)`,
          amountBDT: chosenPkg.amountBDT,
          durationDays: chosenPkg.durationDays,
          status: 'pending',
          submittedAt: Date.now(),
        };

        set((state) => ({
          paymentRequests: [sample, ...state.paymentRequests],
        }));
      },
    }),
    {
      name: 'nesttube_manual_payments_v1',
    }
  )
);
