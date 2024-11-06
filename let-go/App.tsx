import { SafeAreaView, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CameraView from './screens/CameraView';
import CameraViewTest from './screens/cameraViewtest';
import CameraViewLive from './screens/cameraLive';
import History from './screens/History';
import Settings from './screens/Settings';
import { FontAwesome6, Feather, FontAwesome } from '@expo/vector-icons';
import { ThemeProvider } from './contexts/ThemeContext';
import { HistoryProvider } from './contexts/HistoryContext'
import { FontSizeProvider } from './contexts/FontContext';
import { MenuProvider } from 'react-native-popup-menu';
import { LanguageProvider } from './contexts/LanguageContext'
import {ColorProvider, useColor } from './contexts/ColorContext'
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <ThemeProvider>
        <HistoryProvider>
          <FontSizeProvider>
            <LanguageProvider>
              <MenuProvider>
                <ColorProvider>
                  <MainTabNavigator />
                </ColorProvider>
              </MenuProvider>
            </LanguageProvider>
          </FontSizeProvider>
        </HistoryProvider>
      </ThemeProvider>
    </NavigationContainer>
  );
}

function MainTabNavigator() {
  const { colorHex } = useColor(); // Access colorHex from ColorContext

  return (
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
        tabBarActiveTintColor: colorHex || '#1abc9c', // Apply colorHex here
        tabBarIconStyle: {
          marginTop: 15,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="History"
        component={History}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="clock-rotate-left" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraViewLive}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="gear" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}