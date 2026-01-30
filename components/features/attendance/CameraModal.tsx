import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, SwitchCamera } from 'lucide-react-native';

interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (base64: string) => void;
}

export const CameraModal = ({ visible, onClose, onCapture }: CameraModalProps) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'front' | 'back'>('front');
  const cameraRef = useRef<CameraView>(null);
  const [processing, setProcessing] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.container}>
          <Text style={styles.message}>We need your permission to show the camera</Text>
          <TouchableOpacity onPress={requestPermission} style={styles.button}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
             <X color="white" size={24} />
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current && !processing) {
        setProcessing(true);
        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.5,
                base64: true,
                skipProcessing: true,
            });
            if (photo?.base64) {
                onCapture(photo.base64);
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
      <View style={styles.container}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.controlButton} onPress={onClose}>
                <X color="white" size={32} />
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[styles.captureButton, processing && styles.disabledButton]} 
                onPress={takePicture}
                disabled={processing}
            >
               {processing ? <ActivityIndicator color="black" /> : <View style={styles.captureInner} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlButton} onPress={toggleCameraFacing}>
                <SwitchCamera color="white" size={32} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    marginBottom: 40,
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  button: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
    color: 'black',
  },
  controlButton: {
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'black',
    backgroundColor: 'white',
  },
  disabledButton: {
    opacity: 0.7,
  },
  closeButton: {
      position: 'absolute',
      top: 40,
      right: 20,
      padding: 10,
  }
});
