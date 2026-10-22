# Implementation Plan: Direct Link & Smartlink System with Dynamic Video/GIF Teasers

Replace traditional popunder ads with an **Adsterra Direct Link / Smartlink Monetization System**. Instead of intrusive popunder scripts that are often blocked by modern browsers, the application will display a high-converting, responsive interstitial modal and dynamic teaser banners (video/GIF) with a direct call-to-action that opens the user's configured Direct Link / Smartlink in a new tab.

---

## User Specifications & Selections
1. **Trigger Behavior**: Show interactive interstitial modal with dynamic video/GIF preview and Direct Link CTA.
2. **Creative Content**: Display dynamic video or animated GIF teaser banners that link to the Direct Link.
3. **Default URL**: Use the currently active Smartlink URL in the application (`https://pl30753698.effectivecpmnetwork.com/...`) with full support for custom Direct Link URLs in Ad Settings.

---

## Proposed Changes

### 1. Direct Link & Smartlink Configuration (`src/config/adsterra.ts`)
- Update `DEFAULT_ADSTERRA_CONFIG` to formally transition from legacy popunder to `directLink` / `smartLink`:
  - Provide designated `directLinkUrl` setting (defaulting to the active Smartlink).
  - Add creative media preference: `'video'` | `'gif'` | `'image'` to control how teaser campaigns are showcased.
  - Maintain throttle presets (Aggressive, Balanced, Relaxed, Minimal) and cooldown protection.

### 2. Context & Trigger Logic (`src/context/AdsterraContext.tsx`)
- Replace popunder trigger logic with Direct Link Interstitial triggers:
  - Trigger on video navigation or action according to configured interval (e.g. every 2 videos).
  - Ensure zero popunder script blockage or browser warning banners.
  - Expose helper `openDirectLink(targetUrl?: string)` that opens the active Direct Link in a new tab safely with `rel="noopener noreferrer"`.

### 3. Rich Video & GIF Teaser Interstitial (`src/components/ads/InterstitialAdModal.tsx`)
- Refine the Interstitial modal:
  - Feature engaging video trailers and high-frame-rate animated GIFs (Cloud VPS, 4K ShieldVPN, GameVerse AAA Cloud Gaming, AI tools) with audio toggle (Mute/Unmute).
  - Prominent CTA button linking directly to the Adsterra Smartlink/Direct Link.
  - Countdown timer (3 seconds) with "Skip Ad" button for user-friendly navigation.
  - Display verified trust badges and rating indicators to maximize click-through rate.

### 4. Retire Standalone Popunder Modal & Replace with Direct Link Hook (`src/components/ads/PopunderAdModal.tsx` & `src/App.tsx`)
- Remove the redundant corner popunder modal or repurpose it as a sleek, non-intrusive floating Direct Link mini-teaser when enabled.
- Ensure only one ad format is active at any time to maintain a clean YouTube-like viewing experience.

### 5. Ad Settings Modal (`src/components/ads/AdSettingsModal.tsx`)
- Update the Ad Settings panel:
  - Rebrand the "Popunder" tab/card to **"Direct Link / Smartlink Monetization"**.
  - Add input field for the user's custom Adsterra Direct Link URL with a "Test Direct Link" button.
  - Add selector for creative teaser media format (HD Video, Animated GIF, or High-Res Image).

### 6. Banner Cards with Direct Link (`src/components/ads/NativeAdCard.tsx` & `src/components/ads/AdContainer.tsx`)
- Ensure native ad cards and fallback banners also route directly to the active Direct Link URL when clicked, complete with the video/GIF preview badge.

---

## Verification Plan

### Automated Tests & Checks
- Run `npm run lint` (`lint_applet`) to ensure no TypeScript or syntax issues.
- Run `compile_applet` to confirm build succeeds without errors.

### Manual Verification Steps
1. **Direct Link Interstitial Flow**:
   - Click to play a video on the homepage or watch page.
   - Verify the interstitial modal appears with a video or GIF teaser campaign.
   - Click the CTA button (e.g. "Claim Deal" / "Get Offer") and verify it opens the active Smartlink URL in a new browser tab.
   - Verify the countdown timer ticks down and the "Skip Ad" button smoothly closes the modal and continues video playback.
2. **Ad Settings Customization**:
   - Open Ad Settings via the megaphone icon in the Header.
   - Navigate to the Direct Link / Smartlink section.
   - Modify the Direct Link URL or toggle between Video and GIF teaser modes; verify settings persist to localStorage.
3. **Banner Click-Through**:
   - Click a native ad banner on the homepage and verify it routes to the Direct Link.
