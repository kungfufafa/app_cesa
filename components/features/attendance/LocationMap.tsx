import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';

interface LocationMapProps {
  userLatitude?: number;
  userLongitude?: number;
  officeLatitude: number;
  officeLongitude: number;
  allowedRadius: number;
}

export const LocationMap = ({
  userLatitude,
  userLongitude,
  officeLatitude,
  officeLongitude,
  allowedRadius,
}: LocationMapProps) => {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={{
          latitude: officeLatitude,
          longitude: officeLongitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
      >
        <Marker
          coordinate={{ latitude: officeLatitude, longitude: officeLongitude }}
          title="Office"
          description="Monas, Jakarta"
        />
        <Circle
          center={{ latitude: officeLatitude, longitude: officeLongitude }}
          radius={allowedRadius}
          strokeColor="rgba(0, 150, 255, 0.5)"
          fillColor="rgba(0, 150, 255, 0.2)"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
