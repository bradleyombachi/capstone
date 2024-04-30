import { Camera, CameraType, CameraProps } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, Dimensions } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Octicons } from '@expo/vector-icons';
import RNFS from 'react-native-fs';


async function uploadFileFromUri(fileUri: string): Promise<void> {
  try {
    // Fetch the file from the URI
    const response = await fetch(fileUri);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const blob = await response.blob();
    console.log('File blob created from URI:', blob);

    // Create an instance of FormData
    const formData = new FormData();
    formData.append('file', blob, 'test.png'); // Send only the file

    // Use fetch API to send the POST request to your server endpoint
    const uploadResponse = await fetch('http://18.216.209.57:8000/identify', {
      method: 'POST',
      body: formData, // Send the FormData with the file
      // No headers for 'Content-Type' needed; it's set automatically by FormData
    });

    // Check if the upload was successful
    if (!uploadResponse.ok) {
      throw new Error(`HTTP error! Status: ${uploadResponse.status}`);
    }

    // Handle the response data from the upload
    const result = await uploadResponse.json();
    console.log('File uploaded successfully:', result);
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

  // useEffect(() => {
  //   const uploadImage = async () => {
  //     if (capturedImage) {
  //       // Prepare the FormData object
  //       const formData = new FormData();
  //       formData.append('key' as string, value); // Specify string type for key and value
  //       formData.append('image', {
  //         uri: capturedImage,
  //         name: 'captured_image.jpg', // You can set a custom name here
  //         type: 'image/jpeg', // Assuming captured image is JPEG
  //       });
  
  //       // Add any additional form data if needed
  //       // formData.append('fieldName', 'value');
  
  //       // Send the POST request
  //       try {
  //         const response = await fetch('http://127.0.0.1:8000/identify', {
  //           method: 'POST',
  //           body: formData,
  //         });
  
  //         if (response.ok) {
  //           console.log('Image uploaded successfully:', await response.json());
  //           // Clear captured image and preview after successful upload (optional)
  //           setCapturedImage(null);
  //           setPreviewVisible(false);
  //         } else {
  //           console.error('Upload failed:', response.statusText);
  //         }
  //       } catch (error) {
  //         console.error('Upload error:', error);
  //       }
  //     }
  //   };
  
  //   // Call the upload function only when capturedImage changes
  //   uploadImage();
  // }, [capturedImage]);
  


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
      let prediction = uploadFileFromUri(photo.uri);
      console.log(prediction);
    }
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
    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={cameraRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Feather name="circle" size={100} color="white" />
          </TouchableOpacity>
          
        </View>
        <TouchableOpacity style={styles.toggleButton} onPress={toggleCameraType}>
          <MaterialCommunityIcons name="camera-flip-outline" size={30} color="white" />
          </TouchableOpacity>

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
  }
});
