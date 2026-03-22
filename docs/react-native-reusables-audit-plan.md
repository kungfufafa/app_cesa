# React Native Reusables Audit & Migration Plan

## Summary
- Target Markdown file: `docs/react-native-reusables-audit-plan.md`.
- Baseline audit saat rencana dibuat: tidak ada `StyleSheet.create`; `npx tsc --noEmit` lolos; drift utama ada pada path `components/ui` yang campur uppercase/lowercase, primitive `ui` yang masih membawa routing, `TouchableOpacity`, `ActivityIndicator`, dan status/card state yang masih dibuat ad-hoc di layar/feature.
- Goal: semua building block reusable dan interactive mengikuti pola React Native Reusables, lalu `app/` dan `components/features/` berhenti membuat versi ad-hoc sendiri untuk button, input, sheet, badge, card, header, dan state UI.

## Implementation Changes
- Normalisasi `components/ui` ke lowercase reusables-style dan migrasi consumer ke import path baru.
- Refactor primitive utama ke kontrak yang lebih konsisten: `button`, `input`, `sheet-text-input`, `screen-header`, `bottom-sheet`, `error-boundary`.
- Ubah `ScreenHeader` menjadi prop-driven dan pindahkan logika navigasi ke caller.
- Tambahkan primitive baru `textarea`, `spinner`, dan `empty-state`.
- Ganti `TouchableOpacity` di feature/screen menjadi `Button`, `Pressable`, atau interop exception yang terdokumentasi.
- Standarkan badge/card/status di feature layer agar compose `Badge` dan `Card` daripada `View` + `Text` styling manual.
- Tambahkan guardrail ESLint untuk:
  - melarang import `@/store/**`, `@/services/**`, dan `expo-router` di `components/ui`
  - melarang `TouchableOpacity` baru di luar exception `app/(tabs)/_layout.tsx`
  - melarang legacy uppercase ui import paths

## Public APIs / Interfaces
- Import path `components/ui` memakai lowercase:
  - `@/components/ui/button`
  - `@/components/ui/input`
  - `@/components/ui/bottom-sheet`
  - `@/components/ui/screen-header`
  - `@/components/ui/sheet-text-input`
  - `@/components/ui/error-boundary`
- `ScreenHeaderProps` menjadi prop-driven dengan `onBackPress`, `leftAction`, `rightAction`, `showBackButton`, dan styling props.
- Tambahan export baru:
  - `Textarea`
  - `Spinner`
  - `EmptyState`

## Test Plan
- Jalankan `npx tsc --noEmit`.
- Jalankan `npm run lint`.
- Jalankan `npx jest --runInBand --watchman=false`.
- Tambahkan test UI untuk:
  - `Button` variant dan `forwardRef`
  - shared styling contract `Input` dan `Textarea`
  - `ScreenHeader` back action
  - `SheetTextInput` prop passthrough

## Assumptions & Defaults
- Scope migrasi adalah strict parity untuk `components/ui`, `components/features`, dan `app`.
- Perubahan ini structural standardization, bukan redesign visual.
- “Standar React Native Reusables” berarti semua building block reusable dan interactive hidup di `components/ui`, bukan membungkus setiap `View` atau `FlatList`.
- Surface interop tertentu tetap boleh memakai primitive React Native langsung jika wrapper generic akan terasa dipaksakan.
