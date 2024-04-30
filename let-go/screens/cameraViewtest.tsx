import { Camera, CameraType, CameraProps, AutoFocus } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, Dimensions, Modal, Alert } from 'react-native';  // Added Slider
import { Feather, Ionicons, MaterialIcons, MaterialCommunityIcons, Octicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';





export default function CameraView() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null); // Corrected type here
  const [soundOn, setSoundOn] = useState(false);
  const [zoom, setZoom] = useState(0); // State for zoom level
  const [focusDepth, setFocusDepth] = useState(1); // State for focus depth
  const cameraRef = useRef<Camera>(null);  // Typed as Camera


  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      console.log(photo);
      setCapturedImage(photo.uri); 
      setPreviewVisible(true);
      // Handle file upload and prediction here
    }
  };

  if (previewVisible && capturedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage }} style={styles.preview} />
        <TouchableOpacity style={styles.cancelButton} onPress={() => setPreviewVisible(false)} >
          <MaterialIcons name="cancel" size={40} color="white" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera 
        style={styles.camera} 
        type={type} 
        ref={cameraRef} 
        autoFocus={AutoFocus.on}
        focusDepth={focusDepth} // Now controlled by state
        zoom={zoom}  // Now controlled by state
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Feather name="circle" size={100} color="white" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.toggleButton} onPress={() => setType(prevType => prevType === CameraType.back ? CameraType.front : CameraType.back)}>
          <MaterialCommunityIcons name="camera-flip-outline" size={30} color="white" />
        </TouchableOpacity>
        <Slider 
          style={styles.zoomSlider} 
          minimumValue={0} 
          maximumValue={1} 
          minimumTrackTintColor="#FFFFFF" 
          maximumTrackTintColor="#000000" 
          onValueChange={setZoom}
        />
        <Slider 
          style={styles.focusSlider} 
          minimumValue={0} 
          maximumValue={1} 
          minimumTrackTintColor="#FFFFFF" 
          maximumTrackTintColor="#000000" 
          onValueChange={setFocusDepth}
        />
        <TouchableOpacity style={styles.soundToggle} onPress={() => setSoundOn(!soundOn)}>
          {soundOn ? <Octicons name="unmute" size={35} color="white" /> : <Octicons name="mute" size={35} color="white" />}
        </TouchableOpacity>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  zoomSlider: {
    position: 'absolute',
    width: '100%',
    bottom: 80,
  },
  focusSlider: {
    position: 'absolute',
    width: '100%',
    bottom: 120,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 20,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  preview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  cancelButton: {
    position: 'absolute',
    left: 20,
    top: 60
  },
  toggleButton: {
    position: 'absolute',
    right: 20,
    top: 60
  },
  soundToggle: {
    position: 'absolute',
    bottom: 50,
    left: 50,
  },
  popup: {
    flex: 1,
    position: 'absolute',
    //alignSelf: 'center',
    top: 27,
    left: 18,
    
  }
});