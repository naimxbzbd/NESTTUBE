# Implementation Plan: YouTube-Style Authentication, Creator Studio Dashboard, and Admin Panel

Build an enterprise-grade YouTube-style ecosystem for the application featuring role-based authentication, a Creator Studio Dashboard (uploading, video manager, channel analytics, channel branding), and an Admin Control Panel (user management, content moderation, platform statistics) powered by Firebase Authentication and Cloud Firestore, styled in deep obsidian glassmorphism.

---

## 1. Architecture & Role Hierarchy

Three distinct privilege tiers will be supported:

| Role | Permissions & Access |
|---|---|
| **Viewer (Default User)** | Watch videos/Live TV, like, comment, save to playlists/watch later, customize viewer profile. |
| **Creator (Channel Owner)** | All Viewer permissions + YouTube Studio dashboard, video uploader, video editing/deletion, channel analytics, branding. |
| **Platform Admin** | All Creator permissions + Admin Control Panel, user role promotion/ban, content takedown & moderation, global platform metrics. |

*Initial Platform Admin:* Bootstrapped automatically to the user's account (`h4k3rxbd@gmail.com`).

---

## 2. Technical Stack & Data Modeling

### Cloud Services (Firebase)
1. **Firebase Authentication**:
   - Google Sign-In with popup provider.
   - Auth state listener with role resolution via Firestore document.
2. **Cloud Firestore**:
   - `users/{uid}`: Profile data (`displayName`, `email`, `photoURL`, `role`, `handle`, `createdAt`, `subscriberCount`).
   - `admins/{uid}`: Admin identity verification documents (secures ABAC rule checks).
   - `videos/{videoId}`: Video documents (`title`, `description`, `videoUrl`, `thumbnailUrl`, `creatorId`, `creatorName`, `views`, `likes`, `visibility`, `status`, `createdAt`).
   - `reports/{reportId}`: Content moderation flags.
   - `platform_metrics/overview`: Aggregated statistics.

### Security & Compliance
- Strict schema enforcement via `firebase-blueprint.json`.
- Zero-Trust Firestore Security Rules (`firestore.rules`) with `isValidVideo()`, `isValidUser()`, `isAdmin()`, and `handleFirestoreError` contextual logging.

---

## 3. Key Components & User Interface

### A. Authentication & User Profile Modal
- **Obsidian Glass Modal**:
  - Google Sign-In button with subtle aurora gradient glow.
  - Profile dropdown with avatar, channel link, Studio link, Admin panel link (if admin), and sign-out.
  - Active session persistence across browser reloads.

### B. YouTube Studio (Creator Dashboard)
- **Navigation Bar**: Tabbed sub-views:
  1. **Dashboard Overview**: Latest video performance, total views, subscriber count, quick actions.
  2. **Content Manager (Videos)**: Filterable table of published videos with view counts, likes, visibility toggle, edit metadata modal, and delete confirmation.
  3. **Video Uploader**: Modal/page with real-time preview (video link, thumbnail URL, title, tags, description, category selector).
  4. **Analytics**: Visual interactive charts showing view velocity, engagement rate, top-performing videos, and watch stats.
  5. **Customization**: Channel banner, avatar, handle (`@username`), and bio.

### C. Admin Control Panel
- **Navigation & Security Gate**: Route/view guard checking `admins/{uid}` document.
- **Sub-sections**:
  1. **Platform Analytics**: Total users, total active channels, video count, view impressions.
  2. **User Management**: Searchable user roster with role switcher (`viewer`, `creator`, `admin`) and account status toggle (`active`, `suspended`).
  3. **Content Moderation Queue**: List of all uploaded videos with 1-click ban/unpublish, feature to frontpage, or delete.

---

## 4. Implementation Phases

- **Phase 1: Firebase Setup & Provisioning**
  - Trigger Firebase setup UI for user confirmation.
  - Verify terms acceptance and provision Firebase via `ProvisionFirebase`.
  - Install Firebase client SDK.
  - Create `firebase-blueprint.json` and generate hardened `firestore.rules`.
  - Deploy security rules via `DeployRules`.

- **Phase 2: Auth Context & State Management**
  - Implement `src/contexts/AuthContext.tsx` with user state, role detection, sign-in, and sign-out.
  - Implement Firestore helper utilities with error wrapping (`handleFirestoreError`).

- **Phase 3: Creator Studio Dashboard Components**
  - Create `src/components/studio/CreatorStudio.tsx`, `VideoUploader.tsx`, `ContentTable.tsx`, and `StudioAnalytics.tsx`.
  - Wire video submissions directly into the main app video feed so creator uploads appear instantly on Home and Explore pages.

- **Phase 4: Admin Control Panel Components**
  - Create `src/components/admin/AdminPanel.tsx`, `UserRoster.tsx`, and `ContentModeration.tsx`.
  - Wire role adjustments and status flags to Firestore.

- **Phase 5: Navigation & UI Integration**
  - Update top navigation bar with User Avatar menu, "Studio" button, and "Admin" badge.
  - Test responsive layout and seamless obsidian glass aesthetics.
  - Run build compilation and verify zero TypeScript or lint errors.
