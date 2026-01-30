# App Cesa Agent Context

## Overview

Expo + React Native + NativeWind + Zustand + React Query.

## Structure

```text
.
├── app/                    # Routing (Expo Router)
├── components/
│   ├── ui/                 # Pure shadcn-like primitives
│   └── features/           # Business logic components
├── store/                  # Global state (Zustand)
└── services/               # API integrations
```

## Where to Look

- **Auth**:
  - Store: `store/useAuthStore.ts`
  - Service: `services/auth.ts`
  - Layout/Guards: `app/_layout.tsx`
- **Attendance**:
  - Feature components: `components/features/attendance/*`
- **Routing**: `app/` directory

## Conventions

- **Styling**: NativeWind (`className`) ONLY. Do NOT use `StyleSheet.create`.
- **UI Components**: Place in `components/ui`. Must be pure and reusable.
- **Feature Components**: Place in `components/features`. Contains business logic.

## Anti-Patterns

- ❌ Mixing `StyleSheet` with NativeWind.
- ❌ Placing business logic inside `components/ui`.

## Commands

- Start bundler: `npm start`
- Run Android: `npm run android`
- Run iOS: `npm run ios`
