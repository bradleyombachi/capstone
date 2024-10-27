import React, { useState, useRef, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated, TextInput, ActivityIndicator } from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera/legacy';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { HistoryContext } from '../contexts/HistoryContext';
import { useIsFocused } from '@react-navigation/native';
import { useLanguage } from '../contexts/LanguageContext';


type BoundingBox = [number, number, number, number];

export default function CameraViewTest() {
  const [type, setType] = useState(CameraType.back);
  const [torch, setTorch] = useState(FlashMode.off);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const cameraRef = useRef<Camera | null>(null);
  const [guessLabel, setguessLabel] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  

  const wsRef = useRef<WebSocket | null>(null);
  const animatedBoxesRef = useRef<Map<number, any>>(new Map());
  const [yOffsetAdjustment, setYOffsetAdjustment] = useState(-0.055);
  const frameBuffer = useRef<string[]>([]); // Buffer to store frames
  const BATCH_SIZE = 5;
  const { history, addToHistory, clearHistory } = useContext(HistoryContext)
  const isFocused = useIsFocused();
  const { language } = useLanguage();

  const getCurrentTimeInSeconds = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const ws = new WebSocket('ws://192.168.1.152:8000/ws');
    wsRef.current = ws;

    ws.onopen = () => {
        console.log('WebSocket connection opened');
    };

    ws.onmessage = async (e) => {
        const response: any = JSON.parse(e.data);
        console.log(response);
        const boxes:BoundingBox[] = response["contours"];  // Access contours directly
        const color = response["color"]

        console.log('Received boxes:', boxes);
        if (Array.isArray(boxes) && boxes.every(box => Array.isArray(box) && box.length === 4 )) {
            updateAnimatedBoxes(boxes);
            setBoundingBoxes(boxes);
            setguessLabel(response["color"]+ " " + response["brickGuess"]);
            setIsLoading(false);
            if (cameraRef.current && isFocused) {
              try {
                  const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 1.0, exif: false });
                  console.log('Captured photo:', photo.uri); // Log or use the photo (e.g., send via WebSocket)
                  const base64Photo = photo.base64; // Store the base64 of the photo
                  const time = getCurrentTimeInSeconds();
                  // Add base64 photo to history
                  addToHistory({ 
                      guess: response["brickGuess"], 
                      color: response["color"], 
                      photo: base64Photo,
                      time: time
                  });
  
                  if (response["brickGuess"]) {
                      Speech.speak(response["color"], { language });
                  }
  
              } catch (error) {
                  console.error('Error taking picture:', error);
              }
          }
            if (response["brickGuess"]) {
              Speech.speak(response["brickGuess"], { language });
          }

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
            wsRef.current = new WebSocket('ws://10.125.163.1:8000/ws');
          }, 100); // Try to reconnect after 1 second
        }
    };
  

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (permission?.granted && isFocused) {
      const interval = setInterval(() => {
        sendFrameToServer();
      }, 5000); // Send frame every second
      return () => clearInterval(interval);
    }
  }, [permission, isFocused]);

  // useEffect(() => {
  //   if (history && Array.isArray(history)) {
  //     console.log("HISTORY:", history);
  //   } else {
  //     console.error("History is not an array or is undefined");
  //   }
  // }, [history]);

  const sendFrameToServer = async () => {
    if (isFocused && cameraRef.current && wsRef.current) {
      if (!isFocused || !cameraRef.current) return;
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 1.0, exif: false });
      const imageData = photo.base64;
      if (imageData && wsRef.current.readyState === WebSocket.OPEN) {
        
        console.log('Sending image data to server'); // Debug print
        wsRef.current.send(imageData);
      }
    }
  };

  // function to animate bounding boxes 
  const updateAnimatedBoxes = (boxes: BoundingBox[]) => {
    const { width: previewWidth, height: previewHeight } = Dimensions.get('window');

    boxes.forEach((box, index) => {
      const [normX, normY, normW, normH] = box;

      const scaledX = normX * previewWidth;
      const scaledY = normY * previewHeight + (yOffsetAdjustment * previewHeight);
      const scaledW = normW * previewWidth;
      const scaledH = normH * previewHeight;

      if (!animatedBoxesRef.current.has(index)) {
        animatedBoxesRef.current.set(index, {
          left: new Animated.Value(scaledX),
          top: new Animated.Value(scaledY),
          width: new Animated.Value(scaledW),
          height: new Animated.Value(scaledH),
        });
      } else {
        const animBox = animatedBoxesRef.current.get(index);
        Animated.parallel([
          Animated.timing(animBox.left, { toValue: scaledX, duration: 100, useNativeDriver: false }),
          Animated.timing(animBox.top, { toValue: scaledY, duration: 100, useNativeDriver: false }),
          Animated.timing(animBox.width, { toValue: scaledW, duration: 100, useNativeDriver: false }),
          Animated.timing(animBox.height, { toValue: scaledH, duration: 100, useNativeDriver: false }),
        ]).start();
      }
    });

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

  // feature for flash light
  const toggleTorch = () => {
    setTorch(prevTorch => prevTorch === FlashMode.off ? FlashMode.torch : FlashMode.off)
};

  const renderAnimatedBoxes = () => {
    return boundingBoxes.map((_, index) => {
      const animBox = animatedBoxesRef.current.get(index);
      if (!animBox) return null;
      return (
        <React.Fragment key={index}>
        <Animated.Text
          style={{
            position: 'absolute',
            left: animBox.left,
            top: Animated.subtract(animBox.top, 20), 
            color: 'white',
            backgroundColor: 'black',
            paddingHorizontal: 5,
            paddingVertical: 2,
            borderRadius: 5,
            fontSize: 14,
            zIndex: 1,
          }}
        >
          {guessLabel}
        </Animated.Text>
        
        <Animated.View
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
      </React.Fragment>
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
          <TouchableOpacity style={styles.button} onPress={toggleTorch}>
            <MaterialCommunityIcons name={torch === FlashMode.off ? "flash-off": "flash"} size={30} color="white"/>
          </TouchableOpacity>
        </View>
        {renderAnimatedBoxes()}
      </Camera>
      {isLoading && <View style={styles.darkScreen}>
      </View>}
      {isLoading && <View style={styles.loading}>
            <ActivityIndicator size="large" />
          </View>}
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
    justifyContent: 'space-between',
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center horizontally
    position: 'absolute',
    width: '100%',    
    height: '100%',
  },
  darkScreen: {
    backgroundColor: 'black',
    flex: 1,
    width: '100%',
    height: '100%',
    opacity: .4,
    position: 'absolute'
  }
});
