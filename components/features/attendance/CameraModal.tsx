import React, { useState, useRef } from "react";
import { View, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { X, SwitchCamera } from "lucide-react-native";
import { Text } from "@/components/ui/text";

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (photo: { uri: string; base64?: string }) => void;
  returnBase64?: boolean;
}

export const CameraModal = ({
  visible,
  onClose,
  onCapture,
  returnBase64 = false,
}: CameraModalProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"front" | "back">("front");
  const cameraRef = useRef<CameraView>(null);
  const [processing, setProcessing] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View className="flex-1 justify-center bg-black p-5">
          <Text className="text-center pb-2.5 text-white">
            We need your permission to show the camera
          </Text>
          <TouchableOpacity
            onPress={requestPermission}
            className="p-2.5 bg-white rounded-md self-center"
          >
            <Text className="text-base text-black">Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-10 right-5 p-2.5"
          >
            <X color="white" size={24} />
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const takePicture = async () => {
    if (cameraRef.current && !processing) {
      setProcessing(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: returnBase64,
          skipProcessing: true,
        });
        if (photo?.uri) {
          onCapture({ uri: photo.uri, base64: photo.base64 });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setProcessing(false);
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View className="flex-1 justify-center bg-black">
        <CameraView className="flex-1" facing={facing} ref={cameraRef}>
          <View className="flex-1 flex-row bg-transparent mb-10 justify-around items-end">
            <TouchableOpacity
              className="p-3 bg-black/50 rounded-full"
              onPress={onClose}
            >
              <X color="white" size={32} />
            </TouchableOpacity>

            <TouchableOpacity
              className={`w-20 h-20 rounded-full bg-white justify-center items-center ${processing ? "opacity-70" : ""}`}
              onPress={takePicture}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="black" />
              ) : (
                <View className="w-[70px] h-[70px] rounded-full border-2 border-black bg-white" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="p-3 bg-black/50 rounded-full"
              onPress={toggleCameraFacing}
            >
              <SwitchCamera color="white" size={32} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
};
