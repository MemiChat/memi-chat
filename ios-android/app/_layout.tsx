import React, { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ThemeProvider } from "@react-navigation/native";
import { DarkTheme } from "@react-navigation/native";
import { DefaultTheme } from "@react-navigation/native";
import { Drawer } from "expo-router/drawer";
import CustomDrawerContent from "@/components/drawer-content";
import * as Sentry from "@sentry/react-native";

if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    sendDefaultPii: true,
    tracesSampleRate: 1.0,
    profilesSampleRate: 1.0,
  });
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default Sentry.wrap(function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    Inter: require("../assets/fonts/Inter.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <SafeAreaProvider>
            <Drawer
              drawerContent={(props) => <CustomDrawerContent {...props} />}
              screenOptions={{
                overlayColor: "rgba(20, 20, 20, 0.81)",
              }}
            >
              <Drawer.Screen
                name="index"
                options={{
                  headerShown: false,
                }}
              />
              <Drawer.Screen
                name="chat/[id]"
                options={{
                  headerShown: false,
                }}
              />
              <Drawer.Screen
                name="authentication"
                options={{
                  headerShown: false,
                  drawerItemStyle: { display: "none" },
                  swipeEnabled: false,
                }}
              />
              <Drawer.Screen
                name="after-install"
                options={{
                  headerShown: false,
                  drawerItemStyle: { display: "none" },
                  swipeEnabled: false,
                }}
              />
              <Drawer.Screen
                name="settings"
                options={{
                  headerShown: false,
                  drawerItemStyle: { display: "none" },
                }}
              />
              <Drawer.Screen
                name="+not-found"
                options={{
                  headerShown: false,
                  drawerItemStyle: { display: "none" },
                }}
              />
            </Drawer>
            <StatusBar style="light" animated />
          </SafeAreaProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
});
