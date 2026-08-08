/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext';
import { MiniPlayerProvider } from './context/MiniPlayerContext';
import { AdsterraProvider } from './context/AdsterraContext';
import { InterstitialAdModal } from './components/ads/InterstitialAdModal';
import { SocialBarOverlay } from './components/ads/SocialBarOverlay';
import { AdSettingsModal } from './components/ads/AdSettingsModal';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Watch } from './pages/Watch';
import { Search } from './pages/Search';
import { Channel } from './pages/Channel';
import { Shorts } from './pages/Shorts';
import { Subscriptions } from './pages/Subscriptions';
import { PlaylistView } from './pages/PlaylistView';
import { HistoryPage } from './pages/HistoryPage';
import { Trending } from './pages/Trending';
import { Library } from './pages/Library';

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
      <AdsterraProvider>
        <MiniPlayerProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="watch/:id" element={<Watch />} />
                  <Route path="search" element={<Search />} />
                  <Route path="channel/:id" element={<Channel />} />
                  <Route path="shorts" element={<Shorts />} />
                  <Route path="subscriptions" element={<Subscriptions />} />
                  <Route path="playlist/:type" element={<PlaylistView />} />
                  <Route path="history" element={<HistoryPage />} />
                  <Route path="trending" element={<Trending />} />
                  <Route path="library" element={<Library />} />
                </Route>
              </Routes>
              <InterstitialAdModal />
              <SocialBarOverlay />
              <AdSettingsModal />
            </BrowserRouter>
          </QueryClientProvider>
        </MiniPlayerProvider>
      </AdsterraProvider>
    </ThemeProvider>
  );
}

