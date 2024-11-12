import React, { useState, useRef, useEffect, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Animated, TextInput, ActivityIndicator } from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera/legacy';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { HistoryContext } from '../contexts/HistoryContext';
import { useIsFocused } from '@react-navigation/native';
import { useLanguage } from '../contexts/LanguageContext';
import { useFontSize } from '../contexts/FontContext';


type BoundingBox = [number, number, number, number];

const fontSizes = {
  sm: 12,
  md: 16,
  lg: 20
}

export default function CameraViewTest() {
  const [type, setType] = useState(CameraType.back);
  const [torch, setTorch] = useState(FlashMode.off);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  const cameraRef = useRef<Camera | null>(null);
  const [guessLabel, setGuessLabel] = useState<string[]>([]);   
  const [isLoading, setIsLoading] = useState(true);
  const { customFontSize } = useFontSize()
  
  const getFontSize = (size: string) => fontSizes[size as keyof typeof fontSizes];

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

  const addNewLabel = (newLabel: string) => {
    setGuessLabel((prevLabels) => [...prevLabels, newLabel]);
  };

  useEffect(() => {
    const ws = new WebSocket('ws://10.4.148.9:8000/ws');
    wsRef.current = ws;

    ws.onopen = () => {
        console.log('WebSocket connection opened');
    };

    ws.onmessage = async (e) => {
        const response: any = JSON.parse(e.data);
        console.log(response);
        const boxes:BoundingBox[] = response["full_contours"];  // Access contours directly
        setGuessLabel([]);
        console.log('Received boxes:', boxes);
        updateAnimatedBoxes(boxes);
        //if ( boxes.every(box => box.length === 4 )) {
          for (let i = 0; i < response.blocks.length; i++) {
            const block = response.blocks[i];
            console.log("test");
            // Set variables for each part
            const color = block.average_color;
            const position = block.position;
            const predictionLabel = block.prediction_label;
            setBoundingBoxes(position);

            const label = color+" "+predictionLabel;
            addNewLabel(label);


            Speech.speak(label, {language: language});
            setIsLoading(false);

          if (cameraRef.current && isFocused) {
            try {
                  const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 1.0, exif: false });
                  console.log('Captured photo:', photo.uri); // Log or use the photo (e.g., send via WebSocket)
                  const base64Photo = photo.base64; // Store the base64 of the photo
                  const time = getCurrentTimeInSeconds();
                  // Add base64 photo to history
                  addToHistory({ 
                      guess: label, 
                      color: color, 
                      photo: base64Photo,
                      time: time
                  });
  
              } catch (error) {
                  console.error('Error taking picture:', error);
              }
            }
            else {
              console.error("Invalid bounding box format received: ", boxes)
          }
          //}
  
          }
          // updateAnimatedBoxes(boxes);
          // setBoundingBoxes(boxes);
          // setguessLabel(response["color"]+ " " + response["brickGuess"]);
          
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
  
    ws.onclose = (event) => {
        console.log(`WebSocket connection closed: ${event.code}`);
        if (event.code !== 1000) { // Reconnect if the close code is not normal
          setTimeout(() => {
            wsRef.current = new WebSocket('ws://10.4.148.9:8000/ws');
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
    if (!isFocused || !permission?.granted) return;
  
    const interval = setInterval(() => {
      sendFrameToServer();
    }, 5000);
  
    return () => clearInterval(interval);
  }, [isFocused, permission?.granted]);

  // useEffect(() => {
  //   if (history && Array.isArray(history)) {
  //     console.log("HISTORY:", history);
  //   } else {
  //     console.error("History is not an array or is undefined");
  //   }
  // }, [history]);

  const sendFrameToServer = async () => {
    if (cameraRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 1.0, exif: false });
      const imageData = photo.base64 as string; 
      console.log('Sending image data to server');
      wsRef.current.send(imageData);
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
      console.log(`BOX INDEX: ${index}`)
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
            fontSize: getFontSize(customFontSize),
            zIndex: 1,
          }}
        >
          {guessLabel[index]}
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
