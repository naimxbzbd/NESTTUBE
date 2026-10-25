/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { MiniPlayerProvider } from './context/MiniPlayerContext';
import { AdsterraProvider } from './context/AdsterraContext';
import { InterstitialAdModal } from './components/ads/InterstitialAdModal';
import { PopunderAdModal } from './components/ads/PopunderAdModal';
import { AdSettingsModal } from './components/ads/AdSettingsModal';
import { AdBlockDetector } from './components/ads/AdBlockDetector';
import { PremiumModal } from './components/subscription/PremiumModal';
import { BkashPaymentModal } from './components/subscription/BkashPaymentModal';
import { AdminPaymentModal } from './components/admin/AdminPaymentModal';
import { CoinModal } from './components/coins/CoinModal';
import { GiftModal } from './components/video/GiftModal';
import { CelebrationOverlay } from './components/video/CelebrationOverlay';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Watch } from './pages/Watch';
import { LiveTv } from './pages/LiveTv';
import { Search } from './pages/Search';
import { Channel } from './pages/Channel';
import { Shorts } from './pages/Shorts';
import { Subscriptions } from './pages/Subscriptions';
import { PlaylistView } from './pages/PlaylistView';
import { HistoryPage } from './pages/HistoryPage';
import { Trending } from './pages/Trending';
import { Library } from './pages/Library';
import { Studio } from './pages/Studio';
import { AdminPanel } from './pages/AdminPanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdsterraProvider>
          <MiniPlayerProvider>
            <QueryClientProvider client={queryClient}>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="live-tv" element={<LiveTv />} />
                    <Route path="live" element={<LiveTv />} />
                    <Route path="watch/:id" element={<Watch />} />
                    <Route path="search" element={<Search />} />
                    <Route path="channel/:id" element={<Channel />} />
                    <Route path="shorts" element={<Shorts />} />
                    <Route path="subscriptions" element={<Subscriptions />} />
                    <Route path="playlist/:type" element={<PlaylistView />} />
                    <Route path="history" element={<HistoryPage />} />
                    <Route path="trending" element={<Trending />} />
                    <Route path="library" element={<Library />} />
                    <Route path="studio" element={<Studio />} />
                    <Route path="admin" element={<AdminPanel />} />
                  </Route>
                </Routes>
              {/* PipraCoins Wallet & Virtual Gifts Modals */}
              <CoinModal />
              <GiftModal />
              <CelebrationOverlay />

              {/* Ads & Subscription Modals */}
              <InterstitialAdModal />
              <PopunderAdModal />
              <AdSettingsModal />
              <AdBlockDetector />
              <PremiumModal />
              <BkashPaymentModal />
              <AdminPaymentModal />
            </BrowserRouter>
          </QueryClientProvider>
        </MiniPlayerProvider>
      </AdsterraProvider>
    </AuthProvider>
  </ThemeProvider>
);
}
