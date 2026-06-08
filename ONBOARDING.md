# Rahal Frontend — Developer Onboarding Guide

> For: New contributors joining the project
> Stack: React Native · Expo · TypeScript
> Current status: Phase 1 complete (Auth + Foundation). Phase 2 (Discovery) is next.

---

## Table of Contents

1. [What is Rahal?](#1-what-is-rahal)
2. [Prerequisites](#2-prerequisites)
3. [Getting the Project Running](#3-getting-the-project-running)
4. [The Mental Model: How This App is Structured](#4-the-mental-model-how-this-app-is-structured)
5. [Folder Structure — What Lives Where](#5-folder-structure--what-lives-where)
6. [What's Already Built](#6-whats-already-built)
7. [What's Not Built Yet (and When)](#7-whats-not-built-yet-and-when)
8. [Design System — How to Build UI](#8-design-system--how-to-build-ui)
9. [State Management — Where Data Lives](#9-state-management--where-data-lives)
10. [API Layer — How to Talk to the Backend](#10-api-layer--how-to-talk-to-the-backend)
11. [Adding a New Feature — Step by Step](#11-adding-a-new-feature--step-by-step)
12. [Adding a New Screen](#12-adding-a-new-screen)
13. [Internationalization (i18n)](#13-internationalization-i18n)
14. [Navigation](#14-navigation)
15. [Common Patterns and Conventions](#15-common-patterns-and-conventions)
16. [Tools and Scripts](#16-tools-and-scripts)
17. [Key Files to Read First](#17-key-files-to-read-first)

---

## 1. What is Rahal?

Rahal ("traveler" in Arabic) is an Explorer-facing mobile app for place discovery and gamified check-ins. It runs on iOS and Android via Expo.

The core loop: an Explorer finds places on a map, checks in, earns XP, levels up, and redeems rewards. The design philosophy is **editorial, not arcade** — think a curated travel journal, not a game. XP events look like journal entries. Badges look like archival cards. No confetti, no flashy animations.

**The design language is called "Solar Minimalist."** Everything visual traces back to `design.md` in the project root. Read it before you build any UI.

---

## 2. Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | Use LTS |
| npm | 9+ | Comes with Node |
| Expo CLI | latest | `npm install -g expo` |
| iOS Simulator | Xcode 15+ | Mac only |
| Android emulator | Android Studio | Cross-platform |
| Expo Go app | latest | On your physical device for quick testing |

You do not need to eject from Expo managed workflow. Do not run `expo eject`.

---

## 3. Getting the Project Running

**Step 1 — Clone and install**

```bash
git clone <repo-url>
cd Rahal-Frontend
npm install --legacy-peer-deps
```

The `--legacy-peer-deps` flag is required because of peer dependency conflicts in the React 19 ecosystem. Do not drop it.

**Step 2 — Set up environment variables**

```bash
cp .env.example .env
```

Open `.env` and set:

```
EXPO_PUBLIC_API_BASE_URL=http://<your-machine-lan-ip>:7145/api
EXPO_PUBLIC_DEV_BYPASS_AUTH=true
```

- Use your LAN IP (e.g. `192.168.1.x`), not `localhost` — Expo Go on a physical device cannot resolve `localhost`.
- `DEV_BYPASS_AUTH=true` lets you bypass the login screen during development. Flip it to `false` when testing auth flows.

**Step 3 — Start the dev server**

```bash
npx expo start
```

Press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go on your phone.

**Step 4 — Verify it works**

With `DEV_BYPASS_AUTH=true`, you should land directly on the Explorer tab bar (the Discover screen). If auth bypass is off, you should see the Welcome screen.

---

## 4. The Mental Model: How This App is Structured

Before touching any file, internalize these three ideas:

### Routes live in `app/`, logic lives in `src/`

`app/` is just file-based routing (Expo Router). Screens here are thin: they compose components, read route params, and call hooks. They contain almost no logic and no visual styling of their own.

All logic — API calls, state, validation, business rules — lives in `src/`.

### Features mirror backend modules

The backend is modular: `auth`, `places`, `gamification`, `rewards`, `social`, `payment`. The frontend mirrors this exactly under `src/features/`. If the backend ships a new module, a new feature folder appears. If something is needed by multiple features, it goes into `src/shared/`.

### Three-tier component model

1. **Primitives** (`src/shared/components/`) — pure UI, no business logic. `Text`, `Surface`, `BeaconButton`, etc.
2. **Layout primitives** (`src/shared/layout/`) — enforce the editorial asymmetry rules. `OffsetHeadline`, `RelicCard`, `ArchivistBar`, etc.
3. **Feature components** (`src/features/<module>/components/`) — business-aware compositions of primitives. A `PlaceCard` in `features/places/components/` uses `RelicCard` + `Text` + `LabelCaps`.

Feature components never import from another feature's folder. Cross-feature needs get promoted to `shared/`.

---

## 5. Folder Structure — What Lives Where

```
app/                          # Expo Router file-based routes (screens only)
  (auth)/                     # Unauthenticated screens (welcome, sign-in, sign-up, etc.)
  (explorer)/                 # Authenticated screens (tab group)
  _layout.tsx                 # Root layout: fonts, providers, splash screen
  index.tsx                   # Root route guard (auth check → redirect)

src/
  config/
    env.ts                    # Typed access to EXPO_PUBLIC_* env vars
    flags.ts                  # Feature flags (gate unfinished phases)

  features/
    auth/                     # COMPLETE — everything auth + profile related
      api/                    # API call functions (wrappers around axios client)
      components/             # Auth-specific UI (CountryPicker, DatePicker, etc.)
      hooks/                  # TanStack Query mutations/queries (useSignIn, useProfile, etc.)
      schemas/                # Zod validation schemas (one per form)
      store/                  # Zustand auth store (tokens + user + secure-store hydration)
      utils/                  # JWT parsing

    gamification/             # SCAFFOLDED — folder structure only, Phase 3
    places/                   # SCAFFOLDED — folder structure only, Phase 2
    rewards/                  # SCAFFOLDED — folder structure only, Phase 4
    social/                   # SCAFFOLDED — folder structure only, Phase 5
    payment/                  # SCAFFOLDED — folder structure only, Phase 6

  shared/
    api/
      client.ts               # Axios instance + ApiResponse<T> envelope unwrapper
      errors.ts               # Error taxonomy: backend error code → front-end tier + message key
      refreshInterceptor.ts   # 401 queue + token refresh + replay
      queryClient.ts          # TanStack Query config + disk persistence
      zodParse.ts             # Zod response validation helper

    components/               # Primitive UI components (Text, Surface, Button, etc.)
    layout/                   # Editorial layout primitives (ArchivistBar, OffsetHeadline, etc.)
    theme/
      tokens.ts               # THE design token source of truth (colors, spacing, typography)
      useTheme.ts             # Hook that returns tokens object

    i18n/
      en/                     # Translation JSON files (one per feature + common)
      index.ts                # i18next setup

    map/
      provider.ts             # Abstract MapProvider interface (implementation TBD in Phase 2)
      theme.json              # Custom map styling (Solar Minimalist palette)
      types.ts                # Map type definitions

    notifications/
      permissions.ts          # Push notification permission helpers (scaffolded)

    telemetry/
      track.ts                # Analytics stub (wire up in post-MVP)

assets/
  fonts/                      # Space Grotesk: Regular, Medium, Bold
  images/                     # App icons, splash, brand assets
```

---

## 6. What's Already Built

### Phase 0 — Foundation (complete)

- Expo Router with typed routes, route groups `(auth)` and `(explorer)`
- Root layout with Space Grotesk font loading, provider setup, splash screen gate
- Design token module (`src/shared/theme/tokens.ts`) and `useTheme()` hook
- Tailwind/NativeWind configuration wired to tokens
- Full set of shared primitive components (Text, Surface, Button, Input, Icon, Toast, ErrorBanner)
- Editorial layout primitives (OffsetHeadline, TonalStack, RelicCard, ArchivistBar)
- API client with `ApiResponse<T>` unwrapping and typed error taxonomy
- Refresh token interceptor (401 queue → refresh → replay)
- TanStack Query client with disk persistence
- Zustand auth store backed by `expo-secure-store`
- i18n scaffolding with 7 namespaces (English only)
- Dev auth bypass

### Phase 1 — Auth & Identity (complete)

- Welcome screen
- Sign-in screen (email + password, React Hook Form + Zod)
- Sign-up screen (full registration: name, email, password, phone, birthdate, gender, country, bio, profile picture)
- Email verification screen (OTP code entry + resend)
- Forgot password screen
- Reset password screen
- All corresponding hooks: `useSignIn`, `useSignUp`, `useSignOut`, `useVerifyEmail`, `useResendVerification`, `useForgotPassword`, `useResetPassword`, `useRefreshToken`
- Explorer profile screen: real data (name, photo, level, XP progress) with placeholder data for badges/activity (Phase 3 fills those in)
- Full session lifecycle: login → store tokens → refresh on 401 → logout → purge

---

## 7. What's Not Built Yet (and When)

| Phase | Feature | What to build |
|-------|---------|--------------|
| **2** | Place Discovery | Map view (provider TBD), place list (paginated), place detail screen, search + category filtering, vendor business detail. **Start here with the `MapProvider` abstraction in `src/shared/map/`.** |
| **3** | Gamification | Check-in flow that awards XP, XP animations (amber "beacon" style, no confetti), level-up "Relic Title" moment, badges catalog, offline check-in queue flush |
| **4** | Rewards | Rewards catalog, reward detail, redemption flow, premium tier gating |
| **5** | Social | Paginated feed, post detail, comments, reactions, follow/unfollow, other user profiles |
| **6** | Payment | PayMob integration, premium upgrade flow, payment history, receipt screen |
| **7** | Polish | Empty states, loading skeletons (tonal layering, no shimmer), a11y pass, deep link coverage, performance pass on low-end Android |

**Phase 2 is the current next step.** Before writing any map code, read `src/shared/map/provider.ts` and finalize the map provider decision (Google Maps vs. Mapbox vs. Apple Maps). The CLAUDE.md §2.5 documents the decision criteria.

---

## 8. Design System — How to Build UI

**Read `design.md` first.** It is short and it will prevent common mistakes.

### The rules that matter most

**No hardcoded colors or spacings.** Every color and spacing value comes from tokens:

```tsx
const theme = useTheme();
// theme.colors.primary, theme.spacing[4], theme.radii.lg, etc.
```

**No borders/dividers.** Separation is done through background color shifts (tonal layering). Use the `Surface` component with a `tone` prop (`base`, `low`, `lowest`, `high`). Background shifts from slightly darker to slightly lighter create visual hierarchy without lines.

**No inline `StyleSheet` for layout.** Use NativeWind (Tailwind classes). For design-token values, use `useTheme()` directly.

**Intentional asymmetry.** Headlines use `OffsetHeadline` for left-offset asymmetry. Do not replicate the offset inline.

**At most one `BeaconButton` per screen.** The primary amber button is visually dominant. If you find yourself adding two, reconsider the screen hierarchy.

### Typography

Use the `Text` component, not raw `<Text>` from React Native:

```tsx
import { Text } from '@/shared/components';

<Text variant="headlineLarge">Discover</Text>
<Text variant="bodyMedium" color={theme.colors.onSurfaceVariant}>12 places nearby</Text>
```

Available variants: `displayLarge`, `displayMedium`, `displaySmall`, `headlineLarge`, `headlineMedium`, `headlineSmall`, `bodyLarge`, `bodyMedium`, `labelMedium`, `labelSmall`.

### Surface (tonal containers)

```tsx
import { Surface } from '@/shared/components';

<Surface tone="lowest">
  {/* content on the lightest background */}
</Surface>
```

### Gamification → editorial translation

| Avoid | Use instead |
|-------|------------|
| Full-screen confetti | Small amber beacon animation + `LabelCaps` metadata |
| Progress bar styled like a health bar | Subtle tonal progress indicator with `LabelCaps` XP count |
| Flame emoji for streaks | A `LabelCaps` row reading "12-day streak" |
| Podium for leaderboards | Catalogued list with tonal row separation |

---

## 9. State Management — Where Data Lives

| What kind of data | Tool | Location |
|-------------------|------|---------|
| Server data (places, profile, rewards, feed) | **TanStack Query** | `src/features/<module>/hooks/use<Resource>.ts` |
| Auth tokens + user session | **Zustand + expo-secure-store** | `src/features/auth/store/authStore.ts` |
| UI flags (modal open, filter state) | **Zustand (memory only)** | `src/features/<module>/store/` |
| Form input state | **React Hook Form** | Inside the screen/component, paired with Zod schema |

**Never** hold API-sourced data in local state (`useState`). It belongs in a TanStack Query hook. **Never** store tokens in `AsyncStorage` — always use `expo-secure-store` via the auth store.

### Writing a new query hook

```typescript
// src/features/places/hooks/usePlaces.ts
import { useQuery } from '@tanstack/react-query';
import { placesApi } from '../api/placesApi';

export function usePlaces(categoryId?: string) {
  return useQuery({
    queryKey: ['places', categoryId],
    queryFn: () => placesApi.list({ categoryId }),
  });
}
```

### Writing a new mutation hook

```typescript
// src/features/places/hooks/useCheckIn.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { placesApi } from '../api/placesApi';
import { useToast } from '@/shared/components';
import { useTranslation } from 'react-i18next';

export function useCheckIn() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation('places');

  return useMutation({
    mutationFn: placesApi.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.show(t('checkIn.success'));
    },
  });
}
```

---

## 10. API Layer — How to Talk to the Backend

### The contract

The backend wraps every response in `ApiResponse<T>`:

```json
{ "isSuccess": true, "value": { ... } }
{ "isSuccess": false, "errorCode": 1003, "errorMessage": "..." }
```

`src/shared/api/client.ts` unwraps this automatically. Feature code receives `T` directly (on success) or a typed `ApiError` is thrown (on failure). **Feature code never handles the raw envelope.**

### Writing a new API module

```typescript
// src/features/places/api/placesApi.ts
import { apiClient } from '@/shared/api';
import { PlaceListDto, CheckInDto } from './types';

export const placesApi = {
  list: (params: { categoryId?: string; page?: number }) =>
    apiClient.get<PlaceListDto[]>('/places', { params }),

  detail: (id: string) =>
    apiClient.get<PlaceDetailDto>(`/places/${id}`),

  checkIn: (payload: CheckInDto) =>
    apiClient.post<CheckInResultDto>('/places/checkin', payload),
};
```

### Error handling

Errors from `apiClient` are `ApiError` instances with a typed `code` (from `src/shared/api/errors.ts`). Each code maps to a recovery tier:

- `silent` — retry; user never sees anything
- `toast` — show a transient toast
- `screen` — show a blocking error state with a recovery action

TanStack Query's `onError` callback is where you read `error.code` and decide the tier.

### Multipart form data

Registration includes a profile picture upload. See `src/features/auth/api/authApi.ts` for the pattern of building a `FormData` object and setting the correct headers. Do not send `Content-Type: application/json` for multipart endpoints.

---

## 11. Adding a New Feature — Step by Step

Take Phase 2 (Places) as an example.

**Step 1 — Create the folder structure**

```
src/features/places/
  api/
    placesApi.ts        # Endpoint wrappers
    types.ts            # DTOs (match backend C# models exactly)
  components/
    PlaceCard.tsx       # Uses RelicCard + Text + LabelCaps
    PlaceMarker.tsx     # Custom map marker
  hooks/
    usePlaces.ts        # TanStack Query: place list
    usePlaceDetail.ts   # TanStack Query: single place
    useCheckIn.ts       # TanStack Query mutation: check-in
  schemas/
    checkIn.schema.ts   # Zod: check-in form validation (if any)
  store/
    placesStore.ts      # Zustand (ephemeral): selected category filter, map region
```

**Step 2 — Add translation strings**

Open `src/shared/i18n/en/places.json` and add all user-facing strings. No inline text in components.

**Step 3 — Build the API module**

Write `placesApi.ts` with typed wrappers around `apiClient`. Match the DTOs to the Postman collection (`postman.json`) and backend contract notes.

**Step 4 — Build hooks**

Write TanStack Query hooks that call the API module. One file per domain concept (`usePlaces`, `usePlaceDetail`, `useCheckIn`).

**Step 5 — Build components**

Compose shared primitives into feature components. `PlaceCard` uses `RelicCard` from layout primitives. No new visual patterns — extend primitives if needed.

**Step 6 — Wire the screen**

In `app/(explorer)/index.tsx` (the Discover screen), import hooks and components from `features/places/`. The screen stays thin.

**Step 7 — Update CLAUDE.md**

Add any architectural decisions to the Decision Log (§9). If scope shifted, update the phase description.

---

## 12. Adding a New Screen

**Step 1 — Create the file** in the appropriate route group:

- `app/(auth)/new-screen.tsx` — unauthenticated
- `app/(explorer)/new-screen.tsx` — authenticated (tab group)

**Step 2 — Register in the layout if needed.** Tab screens auto-register. Modal or stack screens may need adding to the `_layout.tsx` in the group.

**Step 3 — Keep the screen thin.** The pattern:

```tsx
// app/(explorer)/place-detail.tsx
import { useLocalSearchParams } from 'expo-router';
import { usePlaceDetail } from '@/features/places/hooks/usePlaceDetail';
import { PlaceDetailView } from '@/features/places/components/PlaceDetailView';

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: place, isLoading, error } = usePlaceDetail(id);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return <PlaceDetailView place={place} />;
}
```

All visual layout goes inside the feature component, not the screen file.

**Step 4 — Add strings** to the relevant `src/shared/i18n/en/<feature>.json`.

---

## 13. Internationalization (i18n)

Every user-facing string goes through i18n. No inline literals anywhere.

```tsx
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation('places'); // use the relevant namespace
  return <Text variant="bodyMedium">{t('search.placeholder')}</Text>;
}
```

String files are at `src/shared/i18n/en/<namespace>.json`. Namespaces: `common`, `auth`, `places`, `gamification`, `rewards`, `social`, `payment`.

Add new strings to the appropriate namespace file before using `t()`. English only for v1; the scaffolding is ready for Arabic later.

---

## 14. Navigation

Navigation uses Expo Router typed routes. Import `router` or `Link` from `expo-router`:

```tsx
import { router } from 'expo-router';

// Push a new screen
router.push('/(explorer)/place-detail?id=abc123');

// Navigate to a tab
router.replace('/(explorer)/');

// Go back
router.back();
```

Route groups:
- `(auth)` — unauthenticated. The `_layout.tsx` here redirects authenticated users to `(explorer)`.
- `(explorer)` — authenticated. The `_layout.tsx` here redirects unauthenticated users to `(auth)/welcome`.

The root `app/index.tsx` is the initial route — it checks the auth store and redirects immediately. Never put UI in `app/index.tsx`.

---

## 15. Common Patterns and Conventions

### Path aliases

`tsconfig.json` defines two aliases:
- `@/*` → `src/*` (e.g. `@/shared/components`)
- `@app/*` → `app/*`

Always use aliases. No relative paths like `../../shared/components`.

### Form pattern

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mySchema, MyFormValues } from '../schemas/my.schema';

const { control, handleSubmit, formState: { errors } } = useForm<MyFormValues>({
  resolver: zodResolver(mySchema),
});
```

Pair every form with a Zod schema in `schemas/`. Schema files mirror backend validation rules.

### Multipart upload pattern

See `src/features/auth/api/authApi.ts` — `registerExplorer()` builds a `FormData` object for the profile picture upload. Reuse this pattern for any file upload.

### Toast pattern

```tsx
import { useToast } from '@/shared/components';

const toast = useToast();
toast.show('Check-in successful');
```

### Loading / error states

Do not build per-screen loading spinners. When `isLoading` is true, return a skeleton or the shared `LoadingState` component. When `error` is not null, return `<ErrorState error={error} />`.

### The dev auth bypass

`src/config/env.ts` exposes `DEV_BYPASS_AUTH`. When `true`, `src/features/auth/store/authStore.ts` seeds fake tokens and a fake user so you skip the login screen. Useful during Phase 2–6 development. Never commit `.env` with `DEV_BYPASS_AUTH=true` to a staging or production environment.

---

## 16. Tools and Scripts

| Command | What it does |
|---------|-------------|
| `npx expo start` | Start Expo dev server |
| `npx expo start --ios` | Launch directly in iOS simulator |
| `npx expo start --android` | Launch directly in Android emulator |
| `npm run typecheck` | Run `tsc --noEmit` (TypeScript type checking, no build output) |
| `npm run lint` | Run ESLint |
| `npm run format` | Run Prettier on all source files |

Run `npm run typecheck` and `npm run lint` before every PR. There is no CI that blocks merges yet, but type errors in a strict TypeScript project accumulate fast.

---

## 17. Key Files to Read First

Read these in order before writing any code:

| File | Why |
|------|-----|
| `CLAUDE.md` | Master context: vision, architecture decisions, phased roadmap, decision log. Every decision traces back here. |
| `design.md` | Solar Minimalist design system. Read this before building any UI. |
| `src/shared/theme/tokens.ts` | The token values: exact colors, spacings, typographic scales. |
| `src/shared/api/client.ts` | How the API layer works: `ApiResponse<T>` unwrapping, error throwing. |
| `src/features/auth/store/authStore.ts` | How auth state is stored and hydrated. |
| `src/shared/api/errors.ts` | Full error taxonomy: every backend error code and what it means to the front-end. |
| `postman.json` | The backend API endpoints. Import into Postman to see request/response shapes. |
| `src/features/auth/api/authApi.ts` | The most complete example of an API module in the codebase. |
| `src/features/auth/hooks/useSignIn.ts` | The most complete example of a mutation hook. |
| `app/(auth)/sign-up.tsx` | The most complete example of a form screen. |
| `app/(explorer)/profile.tsx` | The most complex implemented screen; good reference for component composition. |

---

## Appendix: Architecture Rules at a Glance

- **No Redux.** Zustand for client state, TanStack Query for server state.
- **No AsyncStorage for tokens.** Always `expo-secure-store` via the auth store.
- **No inline colors or spacings.** Always `useTheme()` tokens.
- **No 1px borders.** Use tonal layering (`Surface` tone prop).
- **No inline text strings.** Always `t('namespace.key')`.
- **No cross-feature imports.** If feature A needs something from feature B, it moves to `shared/`.
- **No logic in screen files.** Screens compose; logic lives in hooks and feature components.
- **No `StyleSheet.create()`.** Use NativeWind Tailwind classes.
- **One `BeaconButton` per screen** (guideline).
- **All decisions go in `CLAUDE.md` §9 Decision Log** before the code is written.
