/**
 * Centralized attendance permissions hook
 * Handles camera and location permission checks for attendance features
 */
import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { Camera } from "expo-camera";
import * as Location from "expo-location";

export interface UseAttendancePermissionsResult {
  /** Check and request camera + location permissions */
  ensurePermissions: () => Promise<boolean>;
  /** Whether permissions are currently being checked */
  isChecking: boolean;
}

/**
 * Hook to manage attendance-related permissions (camera + location)
 * @returns Permission state and check function
 */
export function useAttendancePermissions(): UseAttendancePermissionsResult {
  const [isChecking, setIsChecking] = useState(false);

  const ensurePermissions = useCallback(async (): Promise<boolean> => {
    try {
      setIsChecking(true);

      // Check/request camera permission
      const currentCameraPermission = await Camera.getCameraPermissionsAsync();
      const cameraPermission = currentCameraPermission.granted
        ? currentCameraPermission
        : await Camera.requestCameraPermissionsAsync();

      // Check/request location permission
      const currentLocationPermission =
        await Location.getForegroundPermissionsAsync();
      const locationPermission = currentLocationPermission.granted
        ? currentLocationPermission
        : await Location.requestForegroundPermissionsAsync();

      const hasAllPermissions =
        cameraPermission.granted && locationPermission.granted;

      if (!hasAllPermissions) {
        Alert.alert(
          "Izin Diperlukan",
          "Presensi membutuhkan akses Kamera dan Lokasi. Aktifkan keduanya untuk melanjutkan."
        );
      }

      return hasAllPermissions;
    } catch {
      Alert.alert("Error", "Gagal memeriksa izin perangkat. Coba lagi.");
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    ensurePermissions,
    isChecking,
  };
}
