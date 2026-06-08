# Rahal — Front-End Master Context File

> **Status:** v1 — Draft
> **Owner:** Zeyad (+ 1 collaborator)
> **Scope:** React Native / Expo mobile application, Explorer persona only
> **Last updated:** 2026-04-13

This document is the **Source of Truth** for the Rahal mobile front-end. It defines scope, architecture, design translation, phased delivery, and decision history. All implementation decisions must be traceable to a section here; if they aren't, extend the document before writing code.

---

## 1. Project Charter

### 1.1 Vision

Rahal ("traveler") is a travel/location discovery mobile app for Explorers. The app feels like **a curated editorial journal of exploration** — not a gamified arcade, despite the presence of XP, levels, badges, and rewards under the hood. The design language ("Solar Minimalist") treats discovery as an archival act: relics are catalogued, not celebrated with confetti.

### 1.2 Scope (In)

- Explorer-facing mobile app on iOS and Android via Expo
- Auth, place discovery, map-based exploration, check-ins, gamification surfacing, rewards catalog, social feed, payments via PayMob, push notifications
- English-only UI, with i18n scaffolding for future locales

### 1.3 Scope (Out / Non-Goals)

- Vendor-facing features (separate web dashboard)
- Admin features (separate web dashboard)
- Arabic translations for v1 (scaffolding only)
- Complex offline sync (scoped to last-viewed cache + deferred check-ins)
- Automated tests in the initial phases (revisited post-MVP)
- Android-specific parity with iOS glassmorphism if it hurts performance

### 1.4 Success Criteria (Graduation Defense)

The app must demonstrate, end-to-end and live, within a 10-minute window:

1. Authenticated Explorer session (login + refresh token lifecycle)
2. Map-based place discovery with a custom-themed map
3. A completed check-in that awards XP and updates the Explorer's level display
4. Navigation through at least one rewards catalog with one redemption flow
5. Architecture documentation (this file) presented as the engineering artifact

Phases beyond MVP (Social, Payment, Push) are **demonstrated if time permits** but not defense-blocking.

---

## 2. Architectural Principles

### 2.1 Folder Structure

```
app/                          # expo-router file-based routes
  (auth)/                     # unauthenticated routes
  (explorer)/                 # authenticated routes (tab group)
  _layout.tsx                 # root layout, providers
src/
  features/                   # one folder per backend module
    auth/
    places/
    gamification/
    rewards/
    social/
    payment/
    <each contains: api/, hooks/, screens/, components/, store/>
  shared/
    api/                      # client, interceptors, ApiResponse unwrapper
    components/               # cross-feature primitives
    layout/                   # editorial layout primitives (§3.3)
    theme/                    # design tokens
    i18n/                     # translation setup
    navigation/               # nav helpers, typed routes
    hooks/                    # generic hooks
    utils/
  config/                     # env, constants, feature flags
```

**Rule:** Feature folders mirror backend modules 1:1. If the backend introduces a new module, a new feature folder appears. Cross-feature code lives in `shared/`.

### 2.2 State Management Model

Hybrid, enforced by convention:

| State Type                | Tool                            | Examples                                                   |
| ------------------------- | ------------------------------- | ---------------------------------------------------------- |
| Server state              | **TanStack Query**              | Places list, user profile, rewards catalog, feed           |
| Client state (persistent) | **Zustand + expo-secure-store** | Auth tokens, user session                                  |
| Client state (ephemeral)  | **Zustand (memory only)**       | UI flags, modal visibility, filters                        |
| Form state                | **React Hook Form + Zod**       | All forms, validation mirrors FluentValidation server-side |

**Rule:** No Redux. No Context for server data. If you reach for screen-level state to hold data that came from the API, that data belongs in a TanStack Query hook instead.

### 2.3 API Layer Contract

The backend returns every response wrapped in `ApiResponse<T>` (Success/Failure + ErrorCode). The front-end must:

1. **Unwrap at the client boundary.** A single `apiClient` utility strips the envelope and throws a typed error on `Failure`. Feature code never sees the raw envelope.
2. **Map ErrorCodes to a front-end error taxonomy** defined in `shared/api/errors.ts`. Each code maps to: (a) a user-facing message key, (b) a recovery action (retry, re-auth, toast, silent).
3. **Handle refresh tokens transparently.** A request interceptor queues concurrent 401s, refreshes once, replays queued requests. On refresh failure → purge Zustand auth store → redirect to `(auth)/login`.
4. **Respect the 60 req/min rate limit.** TanStack Query's default retry/backoff plus request deduplication via query keys handles most of this. No manual throttling needed.
5. **Validate responses with Zod** at the client boundary. This catches backend contract drift early and is cheap insurance.

### 2.4 Navigation

- **Expo Router** (file-based) with typed routes enabled.
- Route groups: `(auth)` for unauthenticated, `(explorer)` for the authenticated tab bar.
- Deep linking configured from Phase 0 to support future push-notification targets.
- The "Archivist Bar" (floating glass bottom nav from the design system) replaces the standard Expo Router tab bar via a custom tab bar component.

### 2.5 Map Provider Abstraction

Map provider is **undecided** between Google Maps, Apple Maps, and Mapbox. To avoid rework:

- Define a `MapProvider` interface in `shared/map/` with the operations the app actually needs (render map, set region, render markers, render clustered markers, handle press, apply custom theme JSON).
- All screens import from this abstraction. The concrete implementation is swapped at the `shared/map/provider.ts` level.
- **Custom map theming is a hard requirement.** The chosen provider must support styled maps. This alone may force the Mapbox decision — evaluated in Phase 2.

### 2.6 Auth Lifecycle

- Tokens stored in `expo-secure-store` (never AsyncStorage — tokens are sensitive).
- Zustand auth store hydrates from secure storage on app start.
- A router-level guard redirects unauthenticated users out of `(explorer)` routes.
- Biometric unlock deferred; flagged in the Decision Log for post-MVP consideration.

### 2.7 Offline Strategy (Minimal)

- TanStack Query cache persisted to disk via `@tanstack/query-async-storage-persister` backed by `expo-file-system`.
- Last-viewed places remain readable offline.
- Map tiles: cache a bounded region around the user's last known location (provider-dependent; revisit in Phase 2).
- Check-in attempted offline → queued locally → toast: "We'll complete your check-in when you're back online." Queue flushes on reconnect. No conflict resolution beyond "last write wins."

### 2.8 Push Notifications

- `expo-notifications` configured in Phase 0 (permissions + token registration deferred to later phases).
- Push token sent to backend after auth success.
- Notification payloads carry a deep link; tapping routes directly to the relevant screen.

---

## 3. Design System Bindings

### 3.1 Token Pipeline

Design tokens from the Solar Minimalist system live in `src/shared/theme/tokens.ts` as a single typed object. Consumed via a `useTheme()` hook. No hardcoded colors or spacings anywhere in feature code — lint rule enforces this.

Token categories:

- **Color:** `primary`, `surface`, `surface-container-lowest/low/default/high`, `on-surface`, `on-surface-variant`, `outline-variant`, `primary-container`
- **Typography:** Space Grotesk at Display/Headline/Body/Label scales, loaded via `expo-font` at app boot
- **Spacing:** 4/8/12/16/24/32/40/64 scale
- **Radii:** `sm` (4px), `lg` (8px), `xl` (12px)
- **Elevation:** Tonal layering first; shadow token (`0 10 40 rgba(on-surface, 0.06)`) as last resort

### 3.2 Gamification ↔ Editorial Translation Rules

The backend gives us XP, levels, badges, streaks. The design system forbids arcade tropes. Translation rules:

| Gamification Concept | Editorial Expression                                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| XP gain              | A small amber "beacon" animation + label-caps metadata line, never a full-screen celebration              |
| Level up             | A "Relic Title" moment using Display typography, offset left, no confetti                                 |
| Badge earned         | A framed archival card on `surface-container-lowest` with label-caps cataloging metadata (date, location) |
| Leaderboard          | A cataloged list with tonal row separation, not a podium                                                  |
| Streak               | A subtle label row, never a flame emoji                                                                   |

**Principle:** Gamification events should feel like entries added to a journal, not rewards from a slot machine.

### 3.3 Editorial Layout Primitives

To enforce the "intentional asymmetry" rule without per-screen drift, we build a small set of layout components once and compose them everywhere:

- **`<OffsetHeadline>`** — Headline with asymmetric horizontal margins per the design spec.
- **`<TonalStack>`** — Vertical stack that nests surface containers (base → low → lowest) without borders, using background shifts for separation.
- **`<RelicCard>`** — `surface-container-lowest` card with `lg` radius, no dividers internally, whitespace-based hierarchy.
- **`<ArchivistBar>`** — The floating glass bottom nav.
- **`<BeaconButton>`** — Primary amber button; visually distinct enough that there should be **at most one per screen** (guideline, not lint-enforced).
- **`<LabelCaps>`** — Small, tracked-out all-caps metadata label for cataloging dates, locations, XP values.

**Rule:** If a screen needs asymmetric layout and there's no primitive for it, extend the primitive library first, then use it. Never style asymmetry inline.

### 3.4 Map Theming

The chosen map provider must accept a custom JSON theme aligned to the Solar Minimalist palette: warm off-white base (`surface`), muted road strokes, amber POI highlights reserved for Rahal-curated places. Theme lives in `shared/map/theme.json`.

---

## 4. Feature Roadmap

Phases are relative (not date-anchored). Each phase has explicit entry/exit criteria. MVP = Phases 0–3 + one reward flow from Phase 4. Everything else is stretch.

### Phase 0 — Foundation

**Goal:** Nothing user-facing works. Everything a developer needs does.

- Expo project scaffold, TypeScript strict mode, Expo Router with route groups
- Design token module, Space Grotesk font loading, theme hook
- Editorial layout primitives (§3.3) built as empty-state skeletons
- API client with `ApiResponse<T>` unwrapping, error taxonomy, refresh interceptor
- Zustand auth store wired to `expo-secure-store`
- TanStack Query client with persistence
- `MapProvider` abstraction interface defined (no implementation yet)
- i18n scaffolding (English only, all strings through `t()` from day one)
- `expo-notifications` permissions flow (not yet tied to push delivery)
- CI: type-check + lint on push (tests deferred)

**Exit criteria:** A developer can clone the repo, run `expo start`, log in against a dev backend, and land on an empty authenticated shell.

### Phase 1 — Auth & Identity

- Login, register, forgot password, email verification screens
- Explorer profile bootstrap (country code, gender, birthdate, premium tier read-only)
- Refresh token rotation verified under network-failure conditions
- Logout + token purge

**Exit criteria:** Full auth lifecycle works. User can register, verify, log in, log out, and refresh tokens stay valid across app restarts.

### Phase 2 — Core Discovery (The Archivist Experience)

- Places list (paginated, cached)
- Place detail screen
- Search + category filtering
- Map view with custom theme, markers, clustering
- Vendor business detail (read-only view of vendor-listed places)
- **Map provider decision finalized here.** Evaluation criteria: custom theme support, cost at scale, Expo compatibility, offline tile support.

**Exit criteria:** An Explorer can find a place three ways (list, search, map) and view its full detail page.

### Phase 3 — Gamification Layer

- XP display in profile header (editorial treatment, not a progress bar on steroids)
- Level progression and "Relic Title" moments
- Badges catalog, earned vs. unearned states
- Check-in flow (online path) that awards XP and triggers the level-up editorial moment
- Offline check-in queueing (§2.7)

**Exit criteria:** An Explorer can check in at a place, see XP awarded, and level up with the proper editorial treatment. This is the centerpiece of the defense demo.

### Phase 4 — Rewards

- Rewards catalog
- Reward detail + redemption flow
- Redemption history
- Premium tier gating on premium-only rewards

**MVP scope:** Catalog browse + one completed redemption. Full history deferrable.

### Phase 5 — Social

- Feed (paginated, optimistic updates on interactions)
- Post detail, comments, likes/reactions
- Follow/unfollow, user profile (other users)
- Content moderation UI deferred

### Phase 6 — Payment

- PayMob integration for premium upgrade
- Payment history
- Receipt screen
- Secondary gateway (if chosen) added here behind the same abstraction

### Phase 7 — Polish

- Empty states for every screen, tuned to editorial aesthetic
- Loading skeletons using tonal layering (not shimmer)
- Accessibility pass (contrast, touch targets, screen reader labels)
- Deep link coverage for push targets
- Performance pass: glassmorphism verified on low-end Android, degraded if needed
- Demo data seeding for defense

---

## 5. Component Hierarchy

Three-tier model, no atomic-design dogma:

### 5.1 Primitives (`src/shared/components/`)

Low-level, design-token-aware, no business logic.

- `Text` (with typography variant prop)
- `Surface` (wraps a View with surface-container tone)
- `Pressable` (theme-aware press states)
- `Icon` (Lucide wrapper)
- `Spacer`
- `LabelCaps`

### 5.2 Layout Primitives (`src/shared/layout/`)

See §3.3. These enforce the editorial asymmetry rules.

### 5.3 Feature Components (`src/features/<module>/components/`)

Business-logic-aware compositions of primitives.

- Example: `features/places/components/PlaceCard` composes `<RelicCard>` + `<Text>` + `<LabelCaps>` into a place list item.
- **Rule:** Feature components never import from another feature's folder. Shared needs → promote to `shared/`.

### 5.4 Screens (`app/(group)/...`)

File-based routes. Screens compose feature components and handle route params, navigation, and screen-level Zustand slices. Screens do not contain styling beyond layout composition; all visual styling lives in components below them.

---

## 6. Cross-Cutting Concerns

### 6.1 Internationalization

- `i18next` + `expo-localization` from Phase 0.
- English is the only bundled locale for v1.
- All user-facing strings go through `t('namespace.key')`. No inline literals.
- Translation files structured per feature: `shared/i18n/en/auth.json`, `places.json`, etc.
- RTL support not wired; adding Arabic later requires a layout audit.

### 6.2 Accessibility

- All interactive elements have accessible labels.
- Touch targets ≥ 44pt.
- Contrast verified against WCAG AA against the Solar Minimalist palette.
- Screen reader tested on both platforms during Phase 7.

### 6.3 Telemetry

Deferred. A `track()` no-op function is defined in Phase 0 so instrumentation calls can be placed now and wired to an analytics provider later.

### 6.4 Error Handling

Three-tier error surfacing:

- **Silent** — handled by retry logic, user never sees.
- **Toast** — transient, non-blocking (e.g., failed optimistic update).
- **Screen-level** — blocking error state with recovery action (e.g., network failure on initial place load).

Each ErrorCode from the backend maps to exactly one tier in `shared/api/errors.ts`.

### 6.5 Environment & Config

- `.env` via `expo-constants` with separate `dev`, `staging`, `prod` configs.
- Feature flags in `config/flags.ts` to gate stretch features during demos.

---

## 7. Milestones & Checkpoints

Timeline is relative until a graduation date is set. Each checkpoint is a live demo to yourself or your collaborator; if it doesn't run on a fresh device, the checkpoint isn't complete.

| Checkpoint               | Contents                                                                       | Phase         |
| ------------------------ | ------------------------------------------------------------------------------ | ------------- |
| **M1: Skeleton Runs**    | Phase 0 complete. Empty authenticated shell navigable.                         | 0             |
| **M2: Identity Works**   | Phase 1 complete. Full auth lifecycle demonstrable.                            | 1             |
| **M3: Discovery Works**  | Phase 2 complete. Map provider finalized, custom theme applied.                | 2             |
| **M4: MVP Demo-Ready**   | Phase 3 complete + one reward flow from Phase 4. This is the graduation floor. | 3 + partial 4 |
| **M5: Feature Complete** | Phases 4–6 complete.                                                           | 4–6           |
| **M6: Polish Complete**  | Phase 7 complete. Defense rehearsed end-to-end on real hardware.               | 7             |

---

## 8. Risk Register

| Risk                                                       | Likelihood | Impact | Mitigation                                                                                    |
| ---------------------------------------------------------- | ---------- | ------ | --------------------------------------------------------------------------------------------- |
| Map provider decision delayed, blocks Phase 2              | Medium     | High   | `MapProvider` abstraction (§2.5) so screens build against interface first                     |
| Android glassmorphism perf issues                          | Medium     | Low    | Degrade gracefully to solid surface + opacity (§1.3)                                          |
| PayMob integration complexity on Expo managed workflow     | Medium     | Medium | Evaluate PayMob's Expo compatibility in Phase 5 prep; fall back to WebView checkout if needed |
| Backend contract drift during development                  | Medium     | Medium | Zod validation at client boundary catches this early                                          |
| Team of 2 without clear ownership leads to merge conflicts | Medium     | Medium | Collaboration Protocol (§10); feature-folder ownership split                                  |
| Gamification visual treatment drifts toward "arcade"       | High       | Medium | Translation rules (§3.2) reviewed at each phase gate                                          |
| Scope creep pushes MVP past graduation date                | High       | High   | §1.4 success criteria is immutable; stretch phases are explicitly demoted                     |

---

## 9. Decision Log

Append-only. Every architectural decision goes here with rationale.

| Date       | Decision                                                         | Rationale                                                                   |
| ---------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 2026-04-13 | Expo managed workflow                                            | Solo/small team, graduation timeline, EAS Build sufficient                  |
| 2026-04-13 | Expo Router (file-based)                                         | Pairs with Expo, typed routes, deep linking out of the box                  |
| 2026-04-13 | Zustand + TanStack Query (hybrid)                                | Less boilerplate than Redux, clean server/client separation                 |
| 2026-04-13 | React Hook Form + Zod                                            | Zod mirrors FluentValidation server-side; single source of validation truth |
| 2026-04-13 | `expo-secure-store` for tokens                                   | Sensitive data; never AsyncStorage                                          |
| 2026-04-13 | Lucide icons                                                     | Free (ISC license), editorial aesthetic fit                                 |
| 2026-04-13 | English-only, i18n scaffolded                                    | Future-proof for Arabic without v1 cost                                     |
| 2026-04-13 | PayMob primary gateway                                           | Prior project experience, Egyptian market fit                               |
| 2026-04-13 | Editorial layout primitives over bespoke styling                 | Prevents visual drift across 15+ screens                                    |
| 2026-04-13 | `MapProvider` abstraction, provider decision deferred to Phase 2 | Unblocks screen development without locking provider choice                 |
| 2026-04-13 | MVP = Phases 0–3 + one reward flow                               | Matches 10-minute defense demo budget                                       |
| 2026-04-13 | Automated tests deferred                                         | Revisited post-MVP; not a committee requirement                             |
| 2026-04-13 | Biometric unlock deferred                                        | Post-MVP consideration                                                      |

---

## 10. Collaboration Protocol (Team of 2)

- **Branch per feature folder.** Ownership aligns to feature folders; two people rarely edit the same feature simultaneously.
- **PR review required** before merging to `main`, even with a team of two. The review is the documentation of intent.
- **Shared code changes** (anything in `src/shared/`) require both members' sign-off.
- **Decision Log entries** for any architectural change. If it's not in the log, it didn't happen.
- **Weekly sync** against this document: what phase are we in, what's blocking the next checkpoint.

---

## 11. Open Questions (To Resolve)

1. Graduation defense date → anchor M1–M6 to calendar dates.
2. Map provider choice → finalized at Phase 2 entry.
3. Secondary payment gateway (if any) → finalized at Phase 6 entry.
4. Biometric unlock → post-MVP go/no-go.
5. Analytics provider → post-MVP.

---

_End of v1. Append to §9 when decisions are made; revise §4 phase contents if scope shifts; never delete — supersede._
