import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const requestPermissions = useCallback(async () => {
    try {
      setLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setLoading(false);
        return false;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      });
      setLoading(false);
      return true;
    } catch (error) {
        setErrorMsg('Error fetching location');
        setLoading(false);
        return false;
    }
  }, []);

    // Watch position
    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;

        const startWatching = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                subscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 5000,
                        distanceInterval: 10,
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
            } else {
                setLoading(false);
            }
        };
        
        startWatching();

        return () => {
            if (subscription) {
                subscription.remove();
            }
        };
    }, []);


  return { location, errorMsg, loading, requestPermissions };
};

// Haversine formula
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d;
};

export const useDistance = (userLat: number | undefined, userLon: number | undefined, targetLat: number, targetLon: number) => {
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
