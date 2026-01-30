import React from "react";
import { View } from "react-native";
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from "react-native-maps";

interface LocationMapProps {
  officeLatitude: number;
  officeLongitude: number;
  allowedRadius: number;
}

export const LocationMap = ({
  officeLatitude,
  officeLongitude,
  allowedRadius,
}: LocationMapProps) => {
  return (
    <View className="h-48 w-full rounded-xl overflow-hidden my-3 border border-gray-200 dark:border-gray-800">
      <MapView
        className="w-full h-full"
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
