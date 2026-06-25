# ALU Student Companion — Mobile App

React Native + Expo app for iOS and Android. Uses the same Firebase project
and FastAPI/Claude backend as the web app.

## Screens

| Screen | Route |
|---|---|
| Splash / redirect | `app/index.tsx` |
| Login | `app/(auth)/login.tsx` |
| Sign up | `app/(auth)/signup.tsx` |
| Forgot password | `app/(auth)/forgot-password.tsx` |
| Chat (main) | `app/(app)/chat.tsx` |
| Opportunities | `app/(app)/opportunities.tsx` |
| News | `app/(app)/news.tsx` |
| Profile | `app/(app)/profile.tsx` |

## Getting started

### 1. Prerequisites

```bash
# Install Expo CLI and EAS CLI globally
npm install -g expo-cli eas-cli

# Install Node dependencies
cd mobile
npm install
```

### 2. Firebase setup

1. Open your Firebase console → Project settings → Add app → Android
2. Package name: `com.studentcompanionai.app`
3. Download `google-services.json` → place it in `mobile/` (root of this folder)
4. Add an iOS app with bundle ID `com.studentcompanionai.app`
5. Download `GoogleService-Info.plist` → place it in `mobile/`

### 3. Assets

Place these files in `mobile/assets/`:
- `icon.png` — 1024×1024 app icon (use the gold zen logo)
- `splash.png` — 1242×2436 splash screen
- `adaptive-icon.png` — 1024×1024 Android adaptive icon foreground
- `favicon.png` — 48×48

```bash
# Quick way: copy the web logo as a starting point
cp ../public/logo.png assets/icon.png
cp ../public/logo.png assets/adaptive-icon.png
cp ../public/logo.png assets/splash.png
cp ../public/logo.png assets/favicon.png
```

### 4. Run locally

```bash
# Start the dev server
npm start

# Scan the QR code with:
# - Expo Go app (iOS App Store / Google Play) — no account needed
# - Or press 'a' for Android emulator, 'i' for iOS simulator
```

### 5. Build a free APK (Android — no Play Store account needed)

```bash
# Log in to Expo
eas login

# Build a shareable APK
npm run build:android
# EAS will give you a download link — send it to anyone to install directly
```

### 6. Build for both stores (when ready)

```bash
npm run build:all
```

## Project structure

```
mobile/
├── app/
│   ├── _layout.tsx          Root layout (fonts, auth provider)
│   ├── index.tsx            Redirect: login or chat
│   ├── (auth)/
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   └── (app)/
│       ├── _layout.tsx      Bottom tab bar
│       ├── chat.tsx         Main AI chat screen
│       ├── opportunities.tsx
│       ├── news.tsx
│       └── profile.tsx
├── assets/                  App icons and splash screen
├── config/
│   └── api.ts               Backend URL + fetch helpers
├── constants/
│   └── theme.ts             Colors, fonts, border radii
├── context/
│   └── AuthContext.tsx      Firebase auth + Firestore profile
├── app.json                 Expo config
├── eas.json                 EAS Build config
└── package.json
```
