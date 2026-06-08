# Rahal — Explorer Mobile App

A travel/location discovery mobile app for Explorers, built with React Native and Expo.

## Prerequisites

- Node.js 20+
- npm 10+
- Expo CLI (`npm install -g expo-cli` or use `npx expo`)
- iOS Simulator (macOS) or Android Emulator

## Install

```bash
npm install --legacy-peer-deps
```

## Run

```bash
npx expo start
```

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go.

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable                      | Description                                                     |
| ----------------------------- | --------------------------------------------------------------- |
| `EXPO_PUBLIC_API_BASE_URL`    | Base URL for the Rahal API                                      |
| `EXPO_PUBLIC_DEV_BYPASS_AUTH` | Set to `true` to bypass auth and access the authenticated shell |

For the local backend Docker Compose setup, use:

```bash
EXPO_PUBLIC_API_BASE_URL=http://localhost:7145/api
```

When testing in Expo Go on a physical phone, the app rewrites local API URLs to
Expo's LAN host IP during development. Your phone and computer still need to be
on the same network, and the backend/firewall must allow LAN requests to port
`7145`.

## Dev Bypass Auth

During development, set `EXPO_PUBLIC_DEV_BYPASS_AUTH=true` in your `.env` to skip authentication and land directly on the Explorer tabs.

## Architecture

See [CLAUDE.md](./claude.md) for the full architectural context, design system bindings, and phased delivery plan.

## Backend Contract Notes

Explorer registration is `multipart/form-data`, including an optional `profilePicture` file. The current backend refresh endpoint is `POST /api/auth/generate`; the frontend targets it, but true expired-access-token refresh still needs backend follow-up because the endpoint is currently protected by `[Authorize]`.

## Scripts

- `npm start` — Start Expo dev server
- `npm run typecheck` — Run TypeScript type checking
- `npm run lint` — Run ESLint
- `npm run format:check` — Check Prettier formatting
- `npm run format` — Auto-format with Prettier
