import { SafeAreaView, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CameraView from './screens/CameraView';
import CameraViewTest from './screens/cameraViewtest';
import History from './screens/History';
import Settings from './screens/Settings';
import { FontAwesome6, Feather, FontAwesome } from '@expo/vector-icons';
import { ThemeProvider } from './contexts/ThemeContext';


const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <ThemeProvider>
      <Tab.Navigator  
      initialRouteName="Camera"
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          height: 100,
          borderTopWidth: 0,
        },
        tabBarInactiveTintColor: 'white',
        tabBarActiveTintColor: '#1abc9c', 
        tabBarIconStyle: {
          marginTop: 15
        },
        headerShown: false,
        
        }}>

        <Tab.Screen 
          name="History" 
          component={History} 
          options={{
            tabBarIcon: ({ color, size }) => ( 
        <FontAwesome6 name="clock-rotate-left" size={size} color={color} />
            )
          }}/>
        <Tab.Screen 
          name="Camera" 
          component={CameraViewTest} 
          options={{
            tabBarIcon: ({ color, size }) => ( 
              <FontAwesome name="camera" size={size} color={color} />
            ),
          }}/>
        <Tab.Screen 
          name="Settings" 
          component={Settings} 
          options={{
            tabBarIcon: ({ color, size }) => ( 
              <FontAwesome6 name="gear" size={size} color={color} />
            )
          }}/>
      </Tab.Navigator>
      </ThemeProvider>
    </NavigationContainer>
  );
}
