import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, SafeAreaView } from 'react-native';
import { useLocation, useDistance } from '@/hooks/useAttendance';
import { LiveClock } from '@/components/features/attendance/LiveClock';
import { LocationMap } from '@/components/features/attendance/LocationMap';
import { StatusCard } from '@/components/features/attendance/StatusCard';
import { CameraModal } from '@/components/features/attendance/CameraModal';
import { getTodayStatus, clockIn, clockOut, AttendanceStatus } from '@/services/attendance';
import { MapPin, Camera } from 'lucide-react-native';
import { useAuthStore } from '@/store/useAuthStore';

const OFFICE_LOCATION = {
  latitude: -6.175392,
  longitude: 106.827153,
  radiusMeters: 200,
};

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { location, errorMsg, requestPermissions } = useLocation();
  const distance = useDistance(
    location?.latitude,
    location?.longitude,
    OFFICE_LOCATION.latitude,
    OFFICE_LOCATION.longitude
  );

  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await getTodayStatus();
      setStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    requestPermissions();
  }, [fetchStatus, requestPermissions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStatus();
    requestPermissions();
  }, [fetchStatus, requestPermissions]);

  const handleClockAction = () => {
    if (!location) {
        Alert.alert("Location needed", "Please wait for location to be detected.");
        return;
    }
    
    if (distance === null || distance > OFFICE_LOCATION.radiusMeters) {
        Alert.alert("Out of Range", `You are ${Math.round(distance || 0)}m away from office. Must be within ${OFFICE_LOCATION.radiusMeters}m.`);
        return;
    }

    setCameraVisible(true);
  };

  const handleCapture = async (photoBase64: string) => {
    setCameraVisible(false);
    setLoading(true);

    try {
        if (!location) return;

        if (status?.clockedIn) {
            await clockOut({
                latitude: location.latitude,
                longitude: location.longitude,
                photo: photoBase64
            });
            Alert.alert("Success", "Clocked Out Successfully!");
        } else {
             await clockIn({
                latitude: location.latitude,
                longitude: location.longitude,
                photo: photoBase64
            });
            Alert.alert("Success", "Clocked In Successfully!");
        }
        await fetchStatus();
    } catch {
        Alert.alert("Error", "Failed to submit attendance.");
    } finally {
        setLoading(false);
    }
  };

  const isWithinRange = distance !== null && distance <= OFFICE_LOCATION.radiusMeters;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
            <View>
                <Text style={styles.greeting}>Hello, {user?.name || 'User'}</Text>
                <Text style={styles.subGreeting}>Let&apos;s get to work!</Text>
            </View>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</Text>
            </View>
        </View>

        <LiveClock />

        {status && (
            <StatusCard 
                clockedIn={status.clockedIn}
                shiftStart={status.shiftStart}
                shiftEnd={status.shiftEnd}
                lastClockIn={status.lastClockIn}
                lastClockOut={status.lastClockOut}
            />
        )}

        <View style={styles.mapContainer}>
             <View style={styles.locationHeader}>
                <MapPin size={18} color="#4b5563" />
                <Text style={styles.locationTitle}>Current Location</Text>
                {distance !== null && (
                    <Text style={[styles.distanceBadge, isWithinRange ? styles.textGreen : styles.textRed]}>
                        {Math.round(distance)}m away
                    </Text>
                )}
            </View>
            <LocationMap 
                userLatitude={location?.latitude}
                userLongitude={location?.longitude}
                officeLatitude={OFFICE_LOCATION.latitude}
                officeLongitude={OFFICE_LOCATION.longitude}
                allowedRadius={OFFICE_LOCATION.radiusMeters}
            />
             {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
            style={[
                styles.actionButton, 
                status?.clockedIn ? styles.buttonOut : styles.buttonIn,
                (!isWithinRange || loading || !location) && styles.buttonDisabled
            ]}
            onPress={handleClockAction}
            disabled={!isWithinRange || loading || !location}
        >
            <Camera size={24} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.buttonText}>
                {loading ? 'Processing...' : status?.clockedIn ? 'Clock Out' : 'Clock In'}
            </Text>
        </TouchableOpacity>
         {!isWithinRange && location && (
            <Text style={styles.warningText}>You must be at the office to clock in/out.</Text>
        )}
      </View>

      <CameraModal 
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={handleCapture}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subGreeting: {
    fontSize: 16,
    color: '#6b7280',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  mapContainer: {
    marginTop: 10,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  distanceBadge: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 'auto',
  },
  textGreen: {
    color: '#16a34a',
  },
  textRed: {
    color: '#dc2626',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  actionButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIn: {
    backgroundColor: '#2563eb',
  },
  buttonOut: {
    backgroundColor: '#dc2626',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  warningText: {
    marginTop: 8,
    color: '#dc2626',
    fontSize: 12,
  },
  errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: 4,
  }
});
