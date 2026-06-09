import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useMovieStore } from '../hooks/useMovieStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const theme = useMovieStore((s) => s.theme);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="movie/[id]"
          options={{ headerShown: false, presentation: 'card', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="movie/where-to-watch"
          options={{ headerShown: false, presentation: 'card' }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
