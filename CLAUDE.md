# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run ios            # Run on iOS
npx expo lint          # Lint
npx tsc --noEmit       # Type-check (pre-PR gate)
```

EAS builds: `eas build --profile development|preview|production`

## Environment

Requires `EXPO_PUBLIC_API_URL` in `.env` (see `.env.example`).

## Architecture

**Expo Router** app (React Native 0.81, Expo ~54, React 19) with file-based routing.

### Layers

- **`app/`** — Routes and layouts. `(tabs)/` holds tab navigation with a custom floating "Request" button. Dynamic routes like `employee/[id].tsx`.
- **`components/ui/`** — Pure, reusable primitives built on **React Native Reusables** (`@rn-primitives/*`) — a shadcn/ui port for React Native. Use `cva()` for variants, `cn()` for class merging. **No stores, no services, no business logic.**
- **`components/features/`** — Domain components that compose `ui/` primitives and wire up stores/services.
- **`services/`** — API layer. Centralized Axios instance (`services/api.ts`) with JWT Bearer interceptor. Token stored in `expo-secure-store`.
- **`store/`** — Zustand stores for global state (auth, bottom sheets, attendance).
- **`hooks/`** — Custom hooks (`useRequireAuth` for auth guards, `useAttendance` for location).
- **`constants/`** — Theme tokens, service grid config.
- **`lib/utils.ts`** — `cn()` helper (clsx + tailwind-merge).

### Feature module structure

Feature modules are mirrored across layers by domain name:
```
services/presensi/          # API calls
hooks/presensi/             # React Query hooks
components/features/presensi/ # UI components
app/presensi/               # Routes
```

### State management

- **Zustand** for client state (auth, UI state)
- **React Query** for server state (5min stale time, 2 retries, no refetch on window focus)

### Auth flow

`useAuthStore` handles sign-in with structured error types (`validation`, `auth`, `network`, `server`, `rate_limit`). Session restores on launch from secure store. `useRequireAuth` hook wraps protected actions — if unauthenticated, shows auth bottom sheet.

## Conventions

- **Styling**: NativeWind v4 (`className`) exclusively. **Never use `StyleSheet.create`**.
- **Fonts**: Inter loaded via `@expo-google-fonts/inter`. Use font-family variants, not font-weight Tailwind classes.
- **Imports**: Use `@/` path alias.
- **Modals**: `@gorhom/bottom-sheet` with `BottomSheetTextInput` for keyboard-aware inputs.
- **Dates**: `dayjs`.
- **Error messages**: Indonesian language for user-facing strings.

## Anti-patterns

- Importing `store/` or `services/` into `components/ui/`
- Mixing `StyleSheet.create` with NativeWind
- Creating one-off generic components in `features/` (move to `ui/`)
