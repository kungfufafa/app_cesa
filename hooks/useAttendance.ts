import { useState, useEffect, useCallback, useRef } from 'react';
import * as Location from 'expo-location';
import { calculateDistance } from '@/lib/geo';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

interface UseLocationOptions {
  enableWatch?: boolean;
  watchAccuracy?: Location.Accuracy;
  watchIntervalMs?: number;
  watchDistanceM?: number;
}

export const useLocation = (options: UseLocationOptions = {}) => {
  const {
    enableWatch = false,
    watchAccuracy = Location.Accuracy.Balanced,
    watchIntervalMs = 5000,
    watchDistanceM = 10,
  } = options;

  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const requestPermissions = useCallback(async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return false;
      }

      setErrorMsg(null);
      const current = await Location.getCurrentPositionAsync({
        accuracy: watchAccuracy,
      });
      setLocation({
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        accuracy: current.coords.accuracy,
      });
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error fetching location:', error);
      setErrorMsg('Error fetching location');
      setLoading(false);
      return false;
    }
  }, [watchAccuracy]);

  const startWatching = useCallback(async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return false;
      }

      if (subscriptionRef.current) {
        setLoading(false);
        return true;
      }

      setErrorMsg(null);
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: watchAccuracy,
          timeInterval: watchIntervalMs,
          distanceInterval: watchDistanceM,
        },
        (newLocation) => {
          setLocation({
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            accuracy: newLocation.coords.accuracy,
          });
          setLoading(false);
        }
      );
      return true;
    } catch (error) {
      console.error('Error watching location:', error);
      setErrorMsg('Error fetching location');
      setLoading(false);
      return false;
    }
  }, [watchAccuracy, watchDistanceM, watchIntervalMs]);

  const stopWatching = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enableWatch) {
      startWatching();
      return () => stopWatching();
    }
    return undefined;
  }, [enableWatch, startWatching, stopWatching]);

  useEffect(() => () => stopWatching(), [stopWatching]);

  return {
    location,
    errorMsg,
    loading,
    requestPermissions,
    startWatching,
    stopWatching,
  };
};

// Re-export calculateDistance from centralized location
export { calculateDistance } from '@/lib/geo';

export const useDistance = (
  userLat: number | undefined,
  userLon: number | undefined,
  targetLat: number,
  targetLon: number
) => {
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    if (userLat !== undefined && userLon !== undefined) {
      const d = calculateDistance(userLat, userLon, targetLat, targetLon);
      setDistance(d);
    } else {
      setDistance(null);
    }
  }, [userLat, userLon, targetLat, targetLon]);

  return distance;
};
