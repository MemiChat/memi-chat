import React, { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { useUserStore } from "@/lib/store";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const navigation = useNavigation<any>();
  const userStore = useUserStore();
  const jwtToken = userStore.jwtToken;
  const jwtTokenExpiry = userStore.jwtTokenExpiry;
  const firstTimeInstall = userStore.firstTimeInstall;

  useEffect(() => {
    const handleNavigation = async () => {
      if (firstTimeInstall) {
        await navigation.reset({
          index: 0,
          routes: [{ name: "after-install" }],
        });
      } else if (!jwtToken || !jwtTokenExpiry) {
        await navigation.reset({
          index: 0,
          routes: [{ name: "authentication" }],
        });
      }
    };

    // Use setTimeout to ensure navigation is ready
    setTimeout(() => {
      handleNavigation();
    }, 0);
  }, [jwtToken, firstTimeInstall, navigation]);

  useEffect(() => {
    if (jwtToken && jwtTokenExpiry && jwtTokenExpiry < Date.now()) {
      userStore.logout();
    }
  }, []);

  if (!jwtToken || !jwtTokenExpiry) return null;

  return <>{children}</>;
};
