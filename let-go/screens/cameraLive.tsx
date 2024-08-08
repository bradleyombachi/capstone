import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Camera, CameraType } from 'expo-camera/legacy';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type BoundingBox = [number, number, number, number];

export default function CameraViewTest() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const cameraRef = useRef<Camera | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://192.168.254.61:8000/ws');
    wsRef.current = ws;

    ws.onopen = () => {
        console.log('WebSocket connection opened');
    };

    ws.onmessage = (e) => {
        const boxes: BoundingBox[] = JSON.parse(e.data);
        console.log('Received boxes:', boxes);
        if (Array.isArray(boxes) && boxes.every(box => Array.isArray(box) && box.length === 4 )) {
            setBoundingBoxes(boxes)
        }else {
            console.error("Invalid bounding box format received: ", boxes)
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
  
    ws.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code}`);
        if (event.code !== 1000) { // Reconnect if the close code is not normal
          setTimeout(() => {
            wsRef.current = new WebSocket('ws://192.168.254.61:8000/ws');
          }, 0.0000005); // Try to reconnect after 1 second
        }
    };
  

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (permission?.granted) {
      const interval = setInterval(() => {
        sendFrameToServer();
      }, 1000); // Send frame every second
      return () => clearInterval(interval);
    }
  }, [permission]);

  const sendFrameToServer = async () => {
    if (cameraRef.current && wsRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      const imageData = photo.base64;
      if (imageData && wsRef.current.readyState === WebSocket.OPEN) {
        console.log('Sending image data to server'); // Debug print
        wsRef.current.send(imageData);
      }
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.text}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  //scaling the the bounding box size relative to the window
  const windowDimensions = Dimensions.get('window');
  const scaleX = 1;
  const scaleY = 1;

  return (
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setType(type === CameraType.back ? CameraType.front : CameraType.back)}>
            <MaterialCommunityIcons name="camera-flip-outline" size={30} color="white" />
          </TouchableOpacity>
        </View>
        {boundingBoxes.map((box, index) => (
          <View
            key={index}
            style={{
                position: 'absolute',
                borderColor: 'green',
                borderWidth: 2,
                left: box[0] * scaleX,
                top: box[1] * scaleY,
                width: box[2] * scaleX,
                height: box[3] * scaleY,
            }}
          />
        ))}
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    margin: 20,
  },
  button: {
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
    color: 'white',
  },
});
