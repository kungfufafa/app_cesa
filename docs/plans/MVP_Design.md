# MVP Design: Attendance Mobile App (Expo 54)

## 1. Overview
A mobile application for internal attendance management (similar to Talenta/Presensi) built with Expo 54. The app focuses on "Solo Developer" maintainability using a modern, unified tech stack. It consumes a Laravel API.

## 2. Technical Stack
- **Framework:** Expo 54 (React Native 0.74+)
- **Routing:** Expo Router 3.5 (File-based)
- **Styling:** NativeWind v4 (Tailwind CSS)
- **State Management:**
  - **Client State (Auth):** Zustand (Persistent storage via MMKV)
  - **Server State (Data):** TanStack Query v5
- **Networking:** Axios
- **Maps:** `react-native-maps`
- **Location:** `expo-location`
- **Camera:** `expo-camera`
- **Biometrics:** `expo-local-authentication` (optional future)

## 3. Architecture

### Directory Structure
```
app/
├── (auth)/             # Login/Forgot Password routes
│   └── login.tsx
├── (app)/              # Protected routes
│   ├── (tabs)/         # Main Tab Navigator
│   │   ├── home.tsx    # Clock In/Out
│   │   ├── history.tsx # Logs
│   │   └── profile.tsx
│   └── _layout.tsx     # Auth Guard
├── components/         # Reusable UI
│   ├── ui/             # Primitive components (Button, Input) - shadcn-like
│   └── features/       # Feature-specific components
├── services/           # API calls (Axios instances)
│   ├── auth.ts
│   └── attendance.ts
├── store/              # Zustand stores
│   └── useAuthStore.ts
├── hooks/              # Custom Hooks
│   └── useLocation.ts
└── lib/                # Utilities (axios, dayjs)
```

## 4. Feature Specifications

### 4.1. Authentication
- **Flow:** Check for stored JWT on launch. If invalid/missing -> Redirect to `(auth)/login`.
- **Login Screen:** Email/Username + Password.
- **Backend:** `POST /api/login` -> returns `{ token, user }`.

### 4.2. Attendance (Home Tab)
- **UI:**
  - Current Date/Time (Live Clock).
  - Status Card: "Shift: 08:00 - 17:00", "Status: Not Clocked In".
  - Map Preview: Shows current user location vs Office Geofence.
  - Action Button: "Clock In" (Green) or "Clock Out" (Red).
- **Logic:**
  1. Fetch `GET /api/attendance/today` to determine state.
  2. Get GPS Location (`expo-location`).
  3. Validate distance to Office Coords (Haversine formula).
  4. If valid -> Open Camera Modal.
  5. Capture Selfie -> `POST /api/attendance/clock-in` with `lat, long, photo`.

### 4.3. History
- **UI:** List view of attendance logs grouped by month.
- **Data:** `GET /api/attendance/history`.

## 5. API Contract (Expectations)

### Auth
- `POST /login`
  - Body: `{ email, password, device_name }`
  - Response: `{ token: "Bearer ...", user: { ... } }`

### Attendance
- `GET /attendance/status`
  - Response: `{ status: "in" | "out", shift: { start: "08:00", end: "17:00" }, last_log: { ... } }`
- `POST /attendance`
  - Body: `{ type: "in"|"out", latitude, longitude, photo: (multipart/base64) }`

## 6. Implementation Plan
1. **Setup:** Initialize Expo, NativeWind, Zustand, Axios.
2. **Auth:** Create Login screen + Auth Guard (_layout.tsx).
3. **Home UI:** Build the Dashboard layout.
4. **Logic:** Implement Location + Camera permissions and hooks.
5. **Integration:** Connect to Mock API (or real Laravel endpoint if provided).
