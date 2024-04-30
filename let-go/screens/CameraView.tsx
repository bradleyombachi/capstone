import { Camera, CameraType, CameraProps, AutoFocus } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, Dimensions, Modal, Alert } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
//import RNFS from 'react-native-fs';



async function uploadFileFromBase64Uri(fileUri: string): Promise<void> {
  try {
    // Fetch the file from the URI
    const response = await fetch(fileUri);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const blob = await response.blob();

    // Convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = async () => {
      const base64data = reader.result;  // this now includes the base64 data URI prefix
      //console.log('Base64 version of the file:', base64data);

      // Extract filename from URI or define a default
      const filename = fileUri.split('/').pop() || 'default_filename.png';

      // Define the JSON payload to send
      const jsonPayload = {
        filename: filename,
        data: base64data  // Include both filename and base64 encoded data
      };

      // Use fetch API to send the POST request to your server endpoint
      const uploadResponse = await fetch('http://3.144.149.173:8000/identify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonPayload),  // Send the JSON payload
      });

      // Check if the upload was successful
      if (!uploadResponse.ok) {
        throw new Error(`HTTP error! Status: ${uploadResponse.status}`);
      }

      // Handle the response data from the upload
      const result = await uploadResponse.json();
      console.log('File uploaded successfully:', result);
    };
  } catch (error) {
    console.error('Failed to upload the file:', error);
  }
}





export default function CameraView() {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [previewVisible, setPreviewVisible] = useState(false)
  const [capturedImage, setCapturedImage] = useState<any>(null)
  const [soundOn, setSoundOn] = useState(false)
  const cameraRef = useRef<any>(null);
  const width = Dimensions.get('window').width;
  const [modalVisible, setModalVisible] = useState(false);
  const [showPopup, setShowPopup] = useState(false);



  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }
  

  if (!permission.granted) {
    // Camera permissions are not granted yet
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
      let prediction = uploadFileFromBase64Uri(photo.uri);
      console.log(prediction);
    }
  };

  const displayPopup = () => {
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false); // Hide the popup after 5 seconds
    }, 5000); // 5000 milliseconds = 5 seconds
  };
 
  const toggleSound = () => {
    setSoundOn(prevState => !prevState);
  }

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  if (previewVisible && capturedImage) 
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage }} style={styles.preview} />
        <TouchableOpacity style={styles.cancelButton} onPress={() => setPreviewVisible(false)} > 
          <MaterialIcons name="cancel" size={40} color="white" />
        </TouchableOpacity>
      </View>
    );
  


  return (
    <View 
    style={styles.container}
    >
      <Camera 
        style={styles.camera} 
        type={type} 
        ref={cameraRef} 
        autoFocus={AutoFocus.on}
        focusDepth={1}
        >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Feather name="circle" size={100} color="white" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleCameraType}>
          <MaterialCommunityIcons name="camera-flip-outline" size={30} color="white" />
          </TouchableOpacity>
          <View style={styles.popup}>
      {showPopup && (
        <View style={styles.popup}>
          <Text style={{color: 'white', fontSize: 30}}>ur mom</Text>
        </View>
      )}
    </View>
        <TouchableOpacity style={styles.soundToggle} onPress={toggleSound}>
        {soundOn ? (
        <Octicons name="unmute" size={35} color="white" />) : (
          <Octicons name="mute" size={35} color="white" />
        )}
        </TouchableOpacity>
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
