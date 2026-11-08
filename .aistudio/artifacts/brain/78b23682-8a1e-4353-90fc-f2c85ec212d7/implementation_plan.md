# NestTube Network Stream Architecture & Implementation Plan

A dedicated, high-performance Network Stream hub (`/network-stream`) allowing users to paste any custom live stream URL or full remote M3U playlist, featuring automatic stream sniffing, Firestore cross-device account synchronization, IndexedDB guest fallback, and seamless HLS playback.

> [!IMPORTANT]
> **User Review & Confirmed Decisions**
> 
> - **Stream Compatibility**: Support both single direct stream URLs (`.m3u8`, `.mp4`, direct HLS feeds) and full multi-channel M3U/M3U8 playlist files.
> - **Data Persistence & Sync**: Store custom streams in the user's account profile (Firestore `users/{userId}/network_streams`) for instant cross-device access, paired with local IndexedDB storage for offline/guest viewing.
> - **Interface & Navigation**: A dedicated page (`/network-stream`) integrated into the primary sidebar and mobile navigation drawer, equipped with stream inspection, quick-test presets, and a saved streams manager.
> - **Performance**: Lightweight stream sniffing, 20-at-a-time batch channel rendering if a multi-channel M3U is pasted, and instant playback via `HlsLivePlayer`.

---

### 1. Overview & Core Concept

The **Network Stream (নেটওয়ার্ক স্ট্রিম)** feature empowers NestTube users to stream any private, public, or regional broadcast by simply pasting a web URL:
1. **Direct Stream Feeds**: Pasting a direct `.m3u8` or `.mp4` URL instantly begins live playback with full player controls, audio switcher, and picture-in-picture.
2. **Multi-Channel M3U Playlists**: Pasting an M3U playlist URL (`http.../playlist.m3u`) parses all embedded television channels, categorizes them, and provides a 20-item batch infinite scroll channel grid with real-time search.
3. **Cross-Device Stream Cloud Sync**: When authenticated, custom streams and playlists automatically sync to the user's Firestore profile (`users/{userId}/network_streams`). Guest users benefit from local IndexedDB storage.
4. **Quick Sample Presets**: Includes one-click test streams (e.g., Apple HLS Sample, Big Buck Bunny 1080p, Akamai Test Stream) for instant validation.

---

### 2. User Experience & Visual Design

#### A. Key User Flows
- **Pasting & Playing a Single Stream**:
  User enters `https://example.com/live/feed.m3u8`, clicks "স্ট্রিম শুরু করুন (Play Stream)". The app detects a single stream, loads it into `HlsLivePlayer`, and automatically saves it to their "Saved Network Streams" library.
- **Loading a Full M3U Playlist**:
  User pastes an M3U URL containing 200 channels. The stream sniffer identifies `#EXTM3U`, extracts all channels with logos and categories, and displays an interactive channel switcher sidebar alongside the video player.
- **Managing Saved Streams**:
  A visual library of previously added network streams displays title, stream URL, date added, and one-click play or delete actions.
- **Quick Test Strip**:
  A curated row of verified test streams allows users to test their player buffering and network speed with a single click.

#### B. Visual Identity & Theme
- **Dominant Neutral Canvas (60%)**: Deep obsidian black (`#070a12` / `#0b0f19`) providing cinematic contrast.
- **Structural Surfaces (30%)**: Glass panels (`bg-white/[0.04]`, `border border-white/[0.08]`) with clean hairline dividers.
- **Accent Budget (10%)**: Radiant cyan (`#06b6d4`) and electric pink (`#ff2d6f`) highlighting active streams and play actions.
- **Typography**: Clean sans paired with tabular numbers (`font-mono tabular-nums`) for bitrates and stream URLs. Unboxed metadata separated by typographic dots (`·`).

---

### 3. Key Product Decisions & Trade-Offs

#### Decision 1: Hybrid Dual-Layer Storage (Firestore + IndexedDB)
- **Chosen Approach**: If the user is logged in, sync streams to Firestore (`users/{userId}/network_streams`); for guest users, store locally in IndexedDB (`nesttube_custom_streams`).
- **Why**: Ensures zero barriers to entry for guest viewers while fulfilling the confirmed requirement for seamless cross-device synchronization for registered users.
- **Alternatives Considered**: Firestore-only blocks guest viewers; LocalStorage-only fails to sync across devices and risks 5MB quota errors.

#### Decision 2: Automatic Stream Type Detection (Sniffer)
- **Chosen Approach**: Inspect URL extensions (`.m3u`, `.m3u8`, `.mp4`) and perform a lightweight `HEAD` or initial chunk text check to automatically detect whether the URL is a single channel or a full multi-channel playlist.
- **Why**: Eliminates manual user toggling ("is this a single stream or playlist?") and delivers an effortless, smart user experience.

#### Decision 3: CORS & Stream Error Recovery
- **Chosen Approach**: Integrated stream diagnostic check. If a stream fails due to CORS or host restrictions, the player offers a direct stream link, error recovery retry, and clear feedback.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NestTube Application Layer                     │
├────────────────────────────────────────────────────────────────────────┤
│             Sidebar Navigation  -->  /network-stream Route             │
├────────────────────────────────────────────────────────────────────────┤
│                       Network Stream Page View                         │
│ ┌───────────────────────────────────┬────────────────────────────────┐ │
│ │ URL Input Bar & Stream Sniffer    │ Quick-Test Stream Presets      │ │
│ └───────────────────────────────────┴────────────────────────────────┘ │
│ ┌───────────────────────────────────┬────────────────────────────────┐ │
│ │ HlsLivePlayer (Balanced Buffers)  │ Channel List / Stream Library  │ │
│ └───────────────────────────────────┴────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│                          Persistence Layer                             │
│ ┌────────────────────────────────────┬───────────────────────────────┐ │
│ │ Logged-In: Firestore Sync          │ Guest: IndexedDB Store        │ │
│ │ users/{userId}/network_streams     │ nesttube_custom_streams       │ │
│ └────────────────────────────────────┴───────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Components & Implementation Steps:
1. **`firebase-blueprint.json` & `firestore.rules` Update**:
   - Add `network_streams` subcollection definition under `users/{userId}/network_streams/{streamId}`.
   - Enforce owner-only reads and writes via `isOwner(userId)`.
2. **`src/services/networkStreamService.ts`**:
   - URL detection (`isM3uPlaylist(url)` vs `isDirectStream(url)`).
   - Multi-channel M3U parser.
   - CRUD functions for saving, listing, and removing custom streams with Firestore and IndexedDB fallback.
3. **`src/pages/NetworkStream.tsx`**:
   - Sleek URL input with clipboard paste button, format auto-detection, and play trigger.
   - Quick-test stream chips.
   - Integrated `HlsLivePlayer` with stream status badge.
   - Saved streams management list with one-click resume.
4. **`src/components/layout/Sidebar.tsx` & `src/App.tsx`**:
   - Add "নেটওয়ার্ক স্ট্রিম (Network Stream)" navigation item with `Radio` / `Globe` icon.
   - Register route `/network-stream`.
