import { Stack, SplashScreen } from 'expo-router';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import "../global.css"; 
import { AuthProvider } from '../app/Context/AuthContext';

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, error] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  useEffect(() => {
    if (error) {
      console.error("Error loading fonts:", error);
      return;
    }
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, error]);

  if (!fontsLoaded && !error) return null;

  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen 
          name="main" 
          options={{ 
            headerShown: false,
            title: 'Botibot Dashboard',
            headerStyle: {
              backgroundColor: '#4a6fa5',
            },
            headerTintColor: '#f5f1e8',
            headerTitleStyle: {
              fontFamily: 'Poppins-Bold',
            },
          }} 
        />
        <Stack.Screen 
          name="register" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="Screen/Dashboard" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="Screen/AddSchedule" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="Screen/ScheduleList" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="Screen/Auth/Login" 
          options={{ 
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="Screen/Auth/Register" 
          options={{ 
            headerShown: false 
          }} 
        />
      </Stack>
    </AuthProvider>
  );
};

export default RootLayout;