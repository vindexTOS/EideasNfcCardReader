import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { useColorScheme } from "@/hooks/useColorScheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import { useAuth } from "../hooks/useAuthUser";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const queryClient = new QueryClient();
  const colorScheme = useColorScheme();
  const { userInfo, token } = useAuth();

  useEffect(() => {
    if (userInfo) {
      console.log("User Info:", userInfo.sub);
    }
  }, [userInfo]);

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }
  //    options={{ headerShown: false }}
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme !== "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          {userInfo?.sub ? (
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          ) : (
            <Stack.Screen name="(home)" options={{ headerShown: false }} />
          )}

          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
