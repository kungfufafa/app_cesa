import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  submitAttendance,
  getSchedule,
  getProfilePhoto,
  ScheduleResponse,
} from '@/services/presensi/attendance';

// Haversine formula to calculate distance in meters
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d * 1000; // Distance in m
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export default function AttendanceMapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ photoUri: string }>();
  const photoUri = params.photoUri;
  
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null);
  const [isScheduleLoading, setIsScheduleLoading] = useState(true);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [isFaceConfirmed, setIsFaceConfirmed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [scheduleData, profilePhoto] = await Promise.all([
          getSchedule(),
          getProfilePhoto().catch(() => null),
        ]);

        setSchedule(scheduleData);

        if (profilePhoto) {
          setProfilePhotoUrl(profilePhoto);
        }
      } catch (error: any) {
        setErrorMsg(error?.message || 'Failed to load schedule');
      } finally {
        setIsScheduleLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let subscription: Location.LocationSubscription | null = null;
    let didCleanup = false;

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) setErrorMsg('Permission to access location was denied');
          return;
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        if (!isMounted) return;
        setLocation(current);

        const sub = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 5,
          },
          (newLoc) => {
            if (isMounted) setLocation(newLoc);
          }
        );

        if (didCleanup) {
          sub.remove();
        } else {
          subscription = sub;
        }
      } catch (e) {
        if (isMounted) setErrorMsg('Gagal mendapatkan lokasi. Pastikan GPS aktif.');
      }
    })();

    return () => {
      isMounted = false;
      didCleanup = true;
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (location && schedule?.office) {
      const dist = getDistanceFromLatLonInM(
        location.coords.latitude,
        location.coords.longitude,
        schedule.office.latitude,
        schedule.office.longitude
      );
      setDistance(Number.isFinite(dist) ? dist : null);
    } else {
      setDistance(null);
    }
  }, [location, schedule]);

  const isWithinRange = useMemo(() => {
    if (!schedule) return false;
    if (schedule.is_wfa) return true;
    if (distance === null) return false;
    return distance <= schedule.office.radius;
  }, [distance, schedule]);

  const canSubmit = useMemo(() => {
    return isWithinRange && isFaceConfirmed && !!profilePhotoUrl;
  }, [isFaceConfirmed, isWithinRange, profilePhotoUrl]);

  const handleSubmit = async () => {
    if (!location || !photoUri || !schedule || !canSubmit) return;

    try {
      setIsSubmitting(true);
      await submitAttendance({
        photoUri: photoUri,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      
      Alert.alert("Success", "Attendance submitted successfully!", [
        { text: "OK", onPress: () => router.replace("/(tabs)") }
      ]);
    } catch (error) {
      if (__DEV__) console.warn("submitAttendance failed", error);
      Alert.alert("Error", "Failed to submit attendance. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (errorMsg) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-500 font-bold">{errorMsg}</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 p-2 bg-gray-200 rounded">
          <Text>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isScheduleLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-500 mt-4">Memuat jadwal...</Text>
      </View>
    );
  }

  const fallbackLatitude = location?.coords.latitude ?? schedule?.office.latitude ?? -6.200000;
  const fallbackLongitude = location?.coords.longitude ?? schedule?.office.longitude ?? 106.816666;

  return (
    <View className="flex-1 bg-white">
      {/* Map Section */}
      <View className="h-[70%] w-full relative">
         <MapView
            className="w-full h-full"
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
            showsUserLocation={true}
            initialRegion={{
              latitude: fallbackLatitude,
              longitude: fallbackLongitude,
              latitudeDelta: 0.005,
              longitudeDelta: 0.005,
            }}
            region={location ? {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            } : undefined}
         >
            {schedule?.office && (
              <>
                <Marker 
                    coordinate={{ latitude: schedule.office.latitude, longitude: schedule.office.longitude }} 
                    title={schedule.office.name || "Office"}
                    description="Office Location"
                />
                {!schedule.is_wfa && (
                  <Circle
                      center={{ latitude: schedule.office.latitude, longitude: schedule.office.longitude }}
                      radius={schedule.office.radius}
                      fillColor="rgba(34, 197, 94, 0.2)" // Green with opacity
                      strokeColor="rgba(34, 197, 94, 0.8)"
                      strokeWidth={2}
                  />
                )}
              </>
            )}
         </MapView>
         
         {/* Back Button Overlay */}
         <TouchableOpacity 
            className="absolute top-12 left-4 bg-white/90 p-3 rounded-full shadow-md z-10 items-center justify-center"
            onPress={() => router.back()}
         >
            <Ionicons name="arrow-back" size={24} color="#000" />
         </TouchableOpacity>
      </View>

      {/* Bottom Sheet Section */}
      <View className="h-[40%] bg-white rounded-t-[32px] -mt-8 shadow-2xl px-8 pt-8 flex-col pb-10 z-20">
        <View className="items-center mb-6">
            <View className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </View>

        <View className="mb-4">
          <Text className="text-gray-400 font-semibold text-xs uppercase tracking-widest mb-2">
            Current Location
          </Text>
          <View className="flex-row items-center space-x-2 mb-1">
            <View
              className={`w-2.5 h-2.5 rounded-full ${isWithinRange ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <Text className={`text-2xl font-bold ${isWithinRange ? 'text-green-600' : 'text-red-500'}`}>
              {schedule?.is_wfa ? 'WFA Enabled' : isWithinRange ? 'Inside Office' : 'Outside Office'}
            </Text>
          </View>
          <Text className="text-gray-500 text-sm font-medium">
            {schedule?.is_wfa
              ? 'Presensi diizinkan dari lokasi mana pun'
              : distance !== null
                ? `${Math.round(distance)} meters from office`
                : 'Calculating...'}
          </Text>
        </View>

        <View className="flex-row items-center justify-between mb-4">
          <View className="items-center">
            <Text className="text-xs text-gray-500 mb-1">Selfie</Text>
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                className="w-16 h-16 rounded-2xl border-2 border-gray-100 bg-gray-100"
                resizeMode="cover"
              />
            ) : (
              <View className="w-16 h-16 rounded-2xl border-2 border-gray-100 bg-gray-100 items-center justify-center">
                <Ionicons name="image-outline" size={24} color="gray" />
              </View>
            )}
          </View>

          <View className="items-center">
            <Text className="text-xs text-gray-500 mb-1">Foto Profil</Text>
            {profilePhotoUrl ? (
              <Image
                source={{ uri: profilePhotoUrl }}
                className="w-16 h-16 rounded-2xl border-2 border-gray-100 bg-gray-100"
                resizeMode="cover"
              />
            ) : (
              <View className="w-16 h-16 rounded-2xl border-2 border-gray-100 bg-gray-100 items-center justify-center">
                <Ionicons name="person-outline" size={24} color="gray" />
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setIsFaceConfirmed((value) => !value)}
          disabled={!profilePhotoUrl}
          className={`mb-4 rounded-xl px-4 py-3 border ${
            profilePhotoUrl
              ? isFaceConfirmed
                ? 'border-emerald-300 bg-emerald-50'
                : 'border-gray-200 bg-gray-50'
              : 'border-red-200 bg-red-50'
          }`}
        >
          <Text className={`text-sm font-medium ${profilePhotoUrl ? 'text-gray-700' : 'text-red-500'}`}>
            {profilePhotoUrl
              ? isFaceConfirmed
                ? 'Wajah sudah sesuai dengan foto profil'
                : 'Konfirmasi wajah selfie sesuai foto profil'
              : 'Foto profil belum tersedia. Hubungi admin sebelum presensi.'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
            onPress={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={`w-full py-4 rounded-2xl flex-row items-center justify-center space-x-3 shadow-sm ${
                canSubmit ? 'bg-black active:bg-gray-800' : 'bg-gray-200'
            }`}
        >
            {isSubmitting ? (
                <ActivityIndicator color={canSubmit ? "white" : "gray"} />
            ) : (
                <>
                    <Ionicons name="location" size={20} color={canSubmit ? "white" : "#9ca3af"} />
                    <Text className={`font-bold text-lg ${canSubmit ? 'text-white' : 'text-gray-400'}`}>
                        Submit Attendance
                    </Text>
                </>
            )}
        </TouchableOpacity>
        
        {!isWithinRange && distance !== null && !schedule?.is_wfa && (
             <Text className="text-center text-red-400 text-xs mt-3 font-medium">
                You must be within {schedule?.office.radius}m of the office.
             </Text>
        )}
        {!profilePhotoUrl && (
          <Text className="text-center text-red-400 text-xs mt-3 font-medium">
            Upload foto profil terlebih dahulu untuk verifikasi wajah.
          </Text>
        )}
        {profilePhotoUrl && !isFaceConfirmed && (
          <Text className="text-center text-amber-500 text-xs mt-3 font-medium">
            Konfirmasi kecocokan wajah sebelum submit presensi.
          </Text>
        )}
      </View>
    </View>
  );
}
