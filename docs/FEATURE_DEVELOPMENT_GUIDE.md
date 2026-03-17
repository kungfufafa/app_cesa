# Panduan Teknis: Membuat Fitur Baru di CESA App

Dokumen ini menjelaskan step-by-step teknis untuk menambahkan fitur baru agar hasilnya clean, konsisten, dan mudah di-maintain.

---

## Daftar Isi

1. [Arsitektur & Alur Data](#1-arsitektur--alur-data)
2. [Step 1: Definisikan Types](#step-1-definisikan-types)
3. [Step 2: Buat Service Layer](#step-2-buat-service-layer)
4. [Step 3: Buat React Query Hooks](#step-3-buat-react-query-hooks)
5. [Step 4: Buat Zustand Store (jika perlu)](#step-4-buat-zustand-store-jika-perlu)
6. [Step 5: Buat UI Components](#step-5-buat-ui-components)
7. [Step 6: Buat Feature Components](#step-6-buat-feature-components)
8. [Step 7: Buat Screen/Route](#step-7-buat-screenroute)
9. [Step 8: Buat Unit Tests](#step-8-buat-unit-tests)
10. [Checklist Final](#checklist-final)
11. [Anti-Patterns](#anti-patterns)

---

## 1. Arsitektur & Alur Data

```
Screen (app/)
  |
  +--> Feature Component (components/features/)
  |       |
  |       +--> UI Primitives (components/ui/)
  |       +--> React Query Hook (hooks/<domain>/)
  |       +--> Zustand Store (store/)
  |
  +--> React Query Hook
          |
          +--> Service (services/<domain>/)
                 |
                 +--> Axios Instance (services/api.ts)
                        |
                        +--> Backend API
```

**Aturan dependensi (satu arah, atas ke bawah):**
- `app/` boleh import dari semua layer
- `components/features/` boleh import `ui/`, `hooks/`, `store/`, `lib/`
- `components/ui/` **TIDAK BOLEH** import `store/` atau `services/`
- `hooks/` boleh import `services/` dan `lib/`
- `services/` hanya import `api.ts` dan `lib/`

**Struktur folder per fitur (mirror across layers):**
```
services/pengajuan/         # API calls
  types.ts                  # Shared types
  pengajuan.ts              # Service functions
hooks/pengajuan/            # React Query hooks
  usePengajuanQueries.ts
components/features/pengajuan/  # Domain UI
  PengajuanCard.tsx
  PengajuanForm.tsx
app/pengajuan/              # Routes
  index.tsx
  [id].tsx
```

---

## Step 1: Definisikan Types

Buat file types terlebih dahulu. Ini jadi "kontrak" antara backend dan frontend.

**File:** `services/<domain>/types.ts`

```typescript
// services/pengajuan/types.ts

// Re-use ApiResponse generic dari presensi (atau pindahkan ke services/types.ts)
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[] | string>;
};

// Tipe data dari API
export type PengajuanItem = {
  id: number;
  title: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  description: string;
};

// Tipe untuk request body (submit form)
export type PengajuanPayload = {
  title: string;
  description: string;
  attachment_uri?: string;
};
```

**Konvensi:**
- Gunakan `type` (bukan `interface`) untuk data shapes, konsisten dengan codebase
- Suffix `Response` untuk raw API data, suffix `Payload` untuk request body
- Semua field nullable dari API harus eksplisit: `field: string | null`
- Jangan pakai `any` — selalu definisikan tipe spesifik

---

## Step 2: Buat Service Layer

Service layer adalah satu-satunya tempat yang melakukan HTTP call.

**File:** `services/<domain>/<nama>.ts`

```typescript
// services/pengajuan/pengajuan.ts
import api from "@/services/api";
import { ApiResponse, PengajuanItem, PengajuanPayload } from "./types";

/**
 * Ambil daftar pengajuan
 */
export async function getPengajuanList(): Promise<PengajuanItem[]> {
  const response = await api.get<ApiResponse<PengajuanItem[]>>(
    "/api/pengajuan"
  );

  if (!response.data.success) {
    throw new Error(response.data.message || "Gagal memuat data pengajuan.");
  }

  return response.data.data ?? [];
}

/**
 * Submit pengajuan baru
 */
export async function submitPengajuan(
  data: PengajuanPayload
): Promise<{ success: boolean; message: string }> {
  // Untuk form biasa (JSON)
  const response = await api.post<ApiResponse<null>>("/api/pengajuan", data);

  if (!response.data.success) {
    throw new Error(response.data.message || "Gagal mengirim pengajuan.");
  }

  return { success: true, message: response.data.message };
}

/**
 * Submit dengan file attachment (multipart/form-data)
 */
export async function submitPengajuanWithFile(
  data: PengajuanPayload
): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  formData.append("title", data.title);
  formData.append("description", data.description);

  if (data.attachment_uri) {
    const filename = data.attachment_uri.split("/").pop() || "file";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("attachment", {
      uri: data.attachment_uri,
      name: filename,
      type,
    } as unknown as Blob); // RN FormData workaround
  }

  const response = await api.post<ApiResponse<null>>(
    "/api/pengajuan",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return { success: response.data.success, message: response.data.message };
}
```

**Konvensi:**
- Satu function per endpoint, nama deskriptif: `getX`, `submitX`, `updateX`, `deleteX`
- Selalu type generic Axios: `api.get<ApiResponse<T>>()`
- Error message dalam **Bahasa Indonesia**
- Untuk file upload, gunakan `as unknown as Blob` (bukan `@ts-ignore`)
- Tidak ada try/catch di service — biarkan error propagate ke caller

---

## Step 3: Buat React Query Hooks

React Query mengelola server state (caching, refetch, loading, error).

**File:** `hooks/<domain>/use<Domain>Queries.ts`

```typescript
// hooks/pengajuan/usePengajuanQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPengajuanList,
  submitPengajuan,
} from "@/services/pengajuan/pengajuan";

// Query key factory — memastikan invalidation konsisten
export const pengajuanKeys = {
  all: ["pengajuan"] as const,
  list: () => [...pengajuanKeys.all, "list"] as const,
  detail: (id: number) => [...pengajuanKeys.all, "detail", id] as const,
};

/**
 * Hook untuk fetch daftar pengajuan
 */
export function usePengajuanList() {
  return useQuery({
    queryKey: pengajuanKeys.list(),
    queryFn: getPengajuanList,
  });
}

/**
 * Hook untuk submit pengajuan (mutation)
 */
export function useSubmitPengajuan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitPengajuan,
    onSuccess: () => {
      // Invalidate list agar refetch data terbaru
      queryClient.invalidateQueries({ queryKey: pengajuanKeys.all });
    },
  });
}
```

**Konvensi:**
- Query key factory di atas file, prefix = nama domain
- `useQuery` untuk GET (read), `useMutation` untuk POST/PUT/DELETE (write)
- Invalidate query setelah mutation sukses
- Jangan tambah `staleTime` atau `retry` per-query — sudah di-set global di QueryClient:
  ```
  staleTime: 5 * 60 * 1000  (5 menit)
  retry: 2
  refetchOnWindowFocus: false
  ```

---

## Step 4: Buat Zustand Store (jika perlu)

Zustand untuk **client-only state**: UI state, bottom sheet, form wizard, dll.
Jangan pakai Zustand untuk data dari server (pakai React Query).

**File:** `store/use<Nama>Store.ts`

```typescript
// store/usePengajuanSheetStore.ts
import { create } from "zustand";

interface PengajuanSheetState {
  isOpen: boolean;
  selectedType: string | null;
  open: (type?: string) => void;
  close: () => void;
}

export const usePengajuanSheet = create<PengajuanSheetState>((set) => ({
  isOpen: false,
  selectedType: null,
  open: (type) => set({ isOpen: true, selectedType: type ?? null }),
  close: () => set({ isOpen: false, selectedType: null }),
}));
```

**Konvensi:**
- Interface state + actions dalam satu type
- Actions langsung di dalam `create()`, bukan di luar
- Nama store = `use<Nama>` (camelCase, prefix `use`)
- Minimal state — hanya simpan apa yang benar-benar perlu di-share antar komponen
- Akses store dengan selector: `const isOpen = usePengajuanSheet((s) => s.isOpen)`

**Kapan pakai Zustand vs React Query vs useState:**

| Data | Tool | Contoh |
|------|------|--------|
| Data dari API | React Query | Daftar pengajuan, profil user |
| State yang di-share antar screen | Zustand | Auth state, bottom sheet open/close |
| State lokal 1 komponen | `useState` | Form input, loading tombol |

---

## Step 5: Buat UI Components

Komponen UI murni, reusable, tanpa business logic.

**File:** `components/ui/<NamaKomponen>.tsx`

```typescript
// components/ui/status-badge.tsx
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "px-3 py-1.5 rounded-full items-center justify-center min-w-[72px]",
  {
    variants: {
      variant: {
        success: "bg-emerald-100",
        warning: "bg-yellow-100",
        danger: "bg-red-100",
        info: "bg-blue-100",
        neutral: "bg-secondary",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

const badgeTextVariants = cva("text-xs font-bold", {
  variants: {
    variant: {
      success: "text-emerald-700",
      warning: "text-yellow-700",
      danger: "text-red-700",
      info: "text-blue-700",
      neutral: "text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

type StatusBadgeProps = VariantProps<typeof badgeVariants> & {
  label: string;
  className?: string;
};

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)}>
      <Text className={badgeTextVariants({ variant })}>{label}</Text>
    </View>
  );
}
```

**Konvensi:**
- Styling **hanya NativeWind** (`className`). **Tidak boleh** `StyleSheet.create`
- Gunakan `cva()` untuk variants, `cn()` untuk merge classes
- Props: terima `className?: string` untuk override dari parent
- Gunakan `<Text>` dari `@/components/ui/text` (bukan dari `react-native`)
- **Tidak boleh** import `store/`, `services/`, atau `hooks/` di sini
- Font weight via class name (`font-bold`, `font-semibold`), **bukan** Tailwind `fontWeight`

---

## Step 6: Buat Feature Components

Komponen domain yang menyambungkan UI primitives dengan data/state.

**File:** `components/features/<domain>/<NamaKomponen>.tsx`

```typescript
// components/features/pengajuan/PengajuanCard.tsx
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { getStatusLabel } from "@/lib/status-helpers";
import type { PengajuanItem } from "@/services/pengajuan/types";
import { formatDate } from "@/lib/dates";

interface PengajuanCardProps {
  item: PengajuanItem;
  onPress?: () => void;
  className?: string;
}

export function PengajuanCard({ item, onPress, className }: PengajuanCardProps) {
  const badgeVariant =
    item.status === "approved" ? "success" :
    item.status === "rejected" ? "danger" : "neutral";

  return (
    <TouchableOpacity
      className={cn(
        "p-4 rounded-xl border border-border bg-card active:bg-secondary",
        className
      )}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Text className="font-semibold text-foreground">{item.title}</Text>
          <Text className="text-sm text-muted-foreground mt-1">
            {formatDate(item.created_at)}
          </Text>
        </View>
        <StatusBadge variant={badgeVariant} label={getStatusLabel(item.status)} />
      </View>
    </TouchableOpacity>
  );
}
```

**Konvensi:**
- Boleh import dari `ui/`, `lib/`, `store/`, `hooks/`, dan types dari `services/`
- Terima data via props — bukan fetch sendiri di dalamnya (kecuali memang self-contained)
- Gunakan types dari `services/<domain>/types.ts`
- Tanggung jawab: mapping data -> UI. Bukan tempat fetch data.

---

## Step 7: Buat Screen/Route

Screen adalah "glue" yang menyatukan semuanya.

**File:** `app/<domain>/<nama>.tsx`

```typescript
// app/pengajuan/index.tsx
import React, { useCallback, useRef, useMemo, useState } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/Button";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { PengajuanCard } from "@/components/features/pengajuan/PengajuanCard";
import {
  usePengajuanList,
  useSubmitPengajuan,
} from "@/hooks/pengajuan/usePengajuanQueries";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { normalizeApiError } from "@/lib/api-errors";
import { Colors } from "@/constants/theme";

export default function PengajuanScreen() {
  // -- Hooks & refs --
  const colorScheme = useColorScheme();
  const { requireAuth } = useRequireAuth();
  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["60%", "85%"], []);

  // -- Server state (React Query) --
  const { data: items = [], isLoading, refetch } = usePengajuanList();
  const submitMutation = useSubmitPengajuan();

  // -- Local form state --
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // -- Handlers --
  const handleOpenForm = useCallback(() => {
    requireAuth(() => sheetRef.current?.present());
  }, [requireAuth]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Peringatan", "Semua field wajib diisi.");
      return;
    }

    try {
      await submitMutation.mutateAsync({ title, description });
      Alert.alert("Berhasil", "Pengajuan berhasil dikirim.");
      sheetRef.current?.dismiss();
      setTitle("");
      setDescription("");
    } catch (error) {
      Alert.alert("Gagal", normalizeApiError(error));
    }
  }, [title, description, submitMutation]);

  // -- Render --
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Pengajuan" showBack />

      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <PengajuanCard item={item} className="mx-4 mb-3" />
        )}
        contentContainerClassName="pt-4 pb-24"
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-muted-foreground">Belum ada pengajuan.</Text>
          </View>
        }
        onRefresh={() => refetch()}
        refreshing={false}
      />

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg"
        onPress={handleOpenForm}
      >
        <Text className="text-white text-2xl font-bold">+</Text>
      </TouchableOpacity>

      {/* Bottom Sheet Form */}
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
          />
        )}
        backgroundStyle={{
          backgroundColor: Colors[colorScheme ?? "light"].background,
        }}
        handleIndicatorStyle={{
          backgroundColor: Colors[colorScheme ?? "light"].icon,
        }}
      >
        <BottomSheetScrollView className="flex-1 px-6 pt-4 pb-8">
          <Text className="text-xl font-bold mb-4">Pengajuan Baru</Text>

          <Text className="text-sm font-medium text-muted-foreground mb-1">
            Judul
          </Text>
          <BottomSheetTextInput
            className="border border-border rounded-lg px-4 py-3 text-foreground bg-background mb-4"
            value={title}
            onChangeText={setTitle}
            placeholder="Masukkan judul..."
          />

          <Text className="text-sm font-medium text-muted-foreground mb-1">
            Deskripsi
          </Text>
          <BottomSheetTextInput
            className="border border-border rounded-lg px-4 py-3 text-foreground bg-background mb-6"
            value={description}
            onChangeText={setDescription}
            placeholder="Jelaskan pengajuan Anda..."
            multiline
            numberOfLines={4}
          />

          <Button onPress={handleSubmit} disabled={submitMutation.isPending}>
            <Text className="text-white font-bold">
              {submitMutation.isPending ? "Mengirim..." : "Kirim Pengajuan"}
            </Text>
          </Button>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeAreaView>
  );
}
```

**Konvensi penting di Screen:**
- `useRequireAuth()` untuk aksi yang butuh login — jangan cek `isAuthenticated` manual
- `BottomSheetTextInput` (bukan `TextInput`) di dalam bottom sheet — keyboard-aware
- Error handling: `normalizeApiError(error)` untuk pesan yang user-friendly
- `Alert.alert()` untuk feedback ke user (Bahasa Indonesia)
- Loading state: `ActivityIndicator` atau `Skeleton` components
- Pull-to-refresh di FlatList: `onRefresh` + `refreshing`
- `Stack.Screen options` untuk konfigurasi header per-screen

---

## Step 8: Buat Unit Tests

**File:** `__tests__/<layer>/<nama>.test.ts`

### Test untuk utility/lib functions

```typescript
// __tests__/lib/pengajuan-helpers.test.ts
import { mapStatusToVariant } from "@/lib/pengajuan-helpers";

describe("mapStatusToVariant", () => {
  it("returns success for approved", () => {
    expect(mapStatusToVariant("approved")).toBe("success");
  });

  it("returns danger for rejected", () => {
    expect(mapStatusToVariant("rejected")).toBe("danger");
  });

  it("returns neutral for unknown status", () => {
    expect(mapStatusToVariant("something_else")).toBe("neutral");
  });
});
```

### Test untuk React Query hooks (mock service)

```typescript
// __tests__/hooks/usePengajuanQueries.test.ts
import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePengajuanList } from "@/hooks/pengajuan/usePengajuanQueries";

jest.mock("@/services/pengajuan/pengajuan", () => ({
  getPengajuanList: jest.fn(),
}));

import { getPengajuanList } from "@/services/pengajuan/pengajuan";
const mockGetList = getPengajuanList as jest.MockedFunction<typeof getPengajuanList>;

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe("usePengajuanList", () => {
  it("returns data on success", async () => {
    mockGetList.mockResolvedValue([{ id: 1, title: "Test", status: "pending" }]);

    const { result } = renderHook(() => usePengajuanList(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});
```

### Test untuk Zustand store

```typescript
// __tests__/store/usePengajuanSheet.test.ts
import { usePengajuanSheet } from "@/store/usePengajuanSheetStore";

describe("usePengajuanSheet", () => {
  beforeEach(() => {
    usePengajuanSheet.setState({ isOpen: false, selectedType: null });
  });

  it("opens with type", () => {
    usePengajuanSheet.getState().open("cuti");
    expect(usePengajuanSheet.getState().isOpen).toBe(true);
    expect(usePengajuanSheet.getState().selectedType).toBe("cuti");
  });

  it("resets on close", () => {
    usePengajuanSheet.getState().open("cuti");
    usePengajuanSheet.getState().close();
    expect(usePengajuanSheet.getState().isOpen).toBe(false);
    expect(usePengajuanSheet.getState().selectedType).toBeNull();
  });
});
```

**Konvensi testing:**
- File test di `__tests__/` mirror struktur source: `__tests__/lib/`, `__tests__/store/`, `__tests__/hooks/`
- Mock native modules di `jest.setup.js`
- Mock services di test file pakai `jest.mock()`
- Zustand store: gunakan `getState()` / `setState()` langsung (tidak perlu render)
- Jalankan: `npm test` atau `npm run test:watch`

---

## Checklist Final

Sebelum submit PR, pastikan semua item ini:

### Code Quality
- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npx expo lint` — 0 errors
- [ ] `npm test` — semua tests pass
- [ ] Tidak ada `any` type
- [ ] Tidak ada `@ts-ignore` (gunakan type assertion yang tepat)
- [ ] Tidak ada `StyleSheet.create` (gunakan NativeWind)
- [ ] Tidak ada unused imports

### Konsistensi
- [ ] Error messages dalam Bahasa Indonesia
- [ ] Gunakan `<Text>` dari `@/components/ui/text` (bukan RN Text)
- [ ] Gunakan `@/` path alias untuk semua imports
- [ ] Gunakan `dayjs` dari `@/lib/dates` untuk format tanggal
- [ ] Gunakan `cn()` untuk merge className
- [ ] Gunakan `normalizeApiError()` untuk error handling
- [ ] Gunakan `useRequireAuth()` untuk aksi yang perlu autentikasi

### Arsitektur
- [ ] Types di `services/<domain>/types.ts`
- [ ] API calls di `services/<domain>/`
- [ ] React Query hooks di `hooks/<domain>/`
- [ ] Query key factory di atas file hooks
- [ ] Feature components di `components/features/<domain>/`
- [ ] UI components tidak import store/services
- [ ] Unit tests untuk logic baru

---

## Anti-Patterns

| Jangan | Lakukan |
|--------|---------|
| Import `store/` atau `services/` di `components/ui/` | Hanya import `lib/utils`, `lib/` utilities |
| `StyleSheet.create({...})` | `className="..."` (NativeWind) |
| `TextInput` di bottom sheet | `BottomSheetTextInput` |
| `catch (error: any)` | `catch (error)` + `normalizeApiError(error)` |
| Fetch data di feature component | Fetch di screen, pass via props |
| `@ts-ignore` | `as unknown as Blob` atau proper type assertion |
| `fontWeight: "bold"` style | `className="font-bold"` |
| Hardcode error string in English | `"Gagal memuat data."` (Bahasa Indonesia) |
| `console.log` di production code | Wrap dengan `if (__DEV__)` |
| `useState` untuk server data | `useQuery` dari React Query |
| Duplikasi utility function | Taruh di `lib/`, import dari sana |
| `new Date()` langsung | `dayjs()` dari `@/lib/dates` |
| Inline `Linking.openURL` | `openExternalUrl()` dari `@/lib/open-url` |
| Manual auth check `if (isAuthenticated)` | `requireAuth(() => action())` |
