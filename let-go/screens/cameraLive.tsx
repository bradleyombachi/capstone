import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Camera, CameraType } from 'expo-camera/legacy';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type BoundingBox = [number, number, number, number];

export default function CameraViewTest() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const cameraRef = useRef<Camera | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const animatedBoxesRef = useRef<Map<number, any>>(new Map());

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
            updateAnimatedBoxes(boxes);
            setBoundingBoxes(boxes);
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
      }, 1); // Send frame every second
      return () => clearInterval(interval);
    }
  }, [permission]);

  const sendFrameToServer = async () => {
    if (cameraRef.current && wsRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.3, exif: false });
      const imageData = photo.base64;
      if (imageData && wsRef.current.readyState === WebSocket.OPEN) {
        console.log('Sending image data to server'); // Debug print
        wsRef.current.send(imageData);
      }
    }
  };

  //function to animate bounding boxes 
  const updateAnimatedBoxes = (boxes: BoundingBox[]) => {
    boxes.forEach((box, index) => {
      if (!animatedBoxesRef.current.has(index)) {
        animatedBoxesRef.current.set(index, {
          left: new Animated.Value(box[0]),
          top: new Animated.Value(box[1]),
          width: new Animated.Value(box[2]),
          height: new Animated.Value(box[3]),
        });
      } else {
        const animBox = animatedBoxesRef.current.get(index);
        Animated.timing(animBox.left, {
          toValue: box[0],
          duration: 100,
          useNativeDriver: false,
        }).start();
        Animated.timing(animBox.top, {
          toValue: box[1],
          duration: 100,
          useNativeDriver: false,
        }).start();
        Animated.timing(animBox.width, {
          toValue: box[2],
          duration: 100,
          useNativeDriver: false,
        }).start();
        Animated.timing(animBox.height, {
          toValue: box[3],
          duration: 100,
          useNativeDriver: false,
        }).start();
      }
    });

    // Clean up animatedBoxesRef for boxes that no longer exist
    animatedBoxesRef.current.forEach((_, key) => {
      if (!boxes[key]) {
        animatedBoxesRef.current.delete(key);
      }
    });
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

  const renderAnimatedBoxes = () => {
    return boundingBoxes.map((_, index) => {
      const animBox = animatedBoxesRef.current.get(index);
      if (!animBox) return null;
      return (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            borderColor: 'green',
            borderWidth: 2,
            left: animBox.left,
            top: animBox.top,
            width: animBox.width,
            height: animBox.height,
          }}
        />
      );
    });
  };

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
        {renderAnimatedBoxes()}
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
