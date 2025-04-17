import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { sendCode, verifyCode } from "@/api/auth";
import { GENERIC_SUCCESS_MESSAGE } from "@/lib/helper";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { useAgentsStore, useChatsStore, useUserStore } from "@/lib/store";
import { useNavigation } from "@react-navigation/native";
import CourtyardBackground from "@/components/backgrounds/courtyard";
import { SafeAreaView } from "react-native-safe-area-context";

const CELL_COUNT = 6;

export default function AuthenticationScreen() {
  const navigation = useNavigation<any>();

  const opacity = useSharedValue(0);
  const animatedStyles = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const [verification, setVerification] = useState({
    codeSent: false,
    codeSentLoading: false,
    codeVerificationLoading: false,
  });
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const ref = useBlurOnFulfill({ value: token, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value: token,
    setValue: setToken,
  });

  const userStore = useUserStore();
  const setJwtToken = userStore.setToken;
  const setJwtTokenExpiry = userStore.setJwtTokenExpiry;

  const chatStore = useChatsStore();
  const agentsStore = useAgentsStore();

  async function handleSendCode() {
    if (email === "") {
      Alert.alert("Error", "Please enter an email");
      return;
    }
    setVerification({
      ...verification,
      codeSentLoading: true,
    });
    const resp = await sendCode(email);
    let codeSent = false;
    if (resp === GENERIC_SUCCESS_MESSAGE) {
      opacity.value = withTiming(1, { duration: 500 });
      codeSent = true;
    } else {
      Alert.alert("Error", resp);
    }
    setVerification({
      ...verification,
      codeSent,
      codeSentLoading: false,
    });
  }

  async function handleVerifyCode() {
    setVerification({
      ...verification,
      codeVerificationLoading: true,
    });
    const resp = await verifyCode(email, token);
    if (resp.token) {
      chatStore.reset();
      agentsStore.reset();
      setJwtToken(resp.token);
      setJwtTokenExpiry(resp.expiry);
      userStore.setUser({
        email: resp.email,
        name: resp.name,
      });
      await navigation.reset({
        index: 0,
        routes: [{ name: "index" }],
      });
    } else {
      Alert.alert("Error", resp);
    }
    setVerification({
      ...verification,
      codeVerificationLoading: false,
    });
  }
  return (
    <View style={styles.container}>
      <CourtyardBackground />
      <SafeAreaView
        style={styles.contentContainer}
        edges={["top", "left", "right"]}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.appTitle}>Authenticate</Text>
          <View style={styles.emailContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              placeholder="Enter email"
              placeholderTextColor="rgba(255, 255, 255, 0.69)"
              keyboardType="email-address"
            />
            {verification.codeSent && (
              <Animated.View style={[animatedStyles]}>
                <Text style={styles.codeInstructions}>
                  Enter the code sent to your email
                </Text>
                <CodeField
                  ref={ref}
                  {...props}
                  // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
                  value={token}
                  onChangeText={setToken}
                  cellCount={CELL_COUNT}
                  rootStyle={styles.codeFieldRoot}
                  keyboardType="number-pad"
                  textContentType={
                    Platform.OS === "ios" ? "oneTimeCode" : undefined
                  }
                  autoComplete={
                    Platform.OS === "android" ? "sms-otp" : "one-time-code"
                  }
                  testID="my-code-input"
                  InputComponent={TextInput}
                  renderCell={({ index, symbol, isFocused }) => (
                    <Text
                      key={index}
                      style={[styles.cell, isFocused && styles.focusCell]}
                      onLayout={getCellOnLayoutHandler(index)}
                    >
                      {symbol || (isFocused ? <Cursor /> : null)}
                    </Text>
                  )}
                />
                <TouchableOpacity
                  onPress={handleSendCode}
                  style={{ marginTop: 15 }}
                >
                  <Text style={{ color: "rgba(255, 255, 255, 0.75)" }}>
                    Resend Code
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
            <TouchableOpacity
              disabled={
                verification.codeSentLoading ||
                verification.codeVerificationLoading
              }
              onPress={
                verification.codeSent ? handleVerifyCode : handleSendCode
              }
              style={styles.sendCodeButton}
            >
              {(verification.codeSentLoading ||
                verification.codeVerificationLoading) && (
                <ActivityIndicator size="small" color="white" />
              )}
              <Text style={styles.sendCodeButtonText}>
                {verification.codeSent ? "Verify Code" : "Send Code"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    marginBottom: 135,
  },
  appTitle: {
    fontWeight: "700",
    color: "white",
    fontSize: 36,
    marginBottom: 60,
  },
  sendCodeButton: {
    borderRadius: 12,
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  sendCodeButtonText: {
    color: "white",
  },
  root: { flex: 1, padding: 20 },
  title: { textAlign: "center", fontSize: 30 },
  codeFieldRoot: { marginTop: 20 },
  cell: {
    width: 40,
    height: 40,
    lineHeight: 38,
    fontSize: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    textAlign: "center",
    color: "white",
    borderRadius: 9,
    backgroundColor: "rgba(255, 255, 255, 0.24)",
  },
  focusCell: {
    borderColor: "rgba(255, 255, 255, 0.6)",
  },
  emailContainer: {
    display: "flex",
    flexDirection: "column",
    minWidth: 300,
    gap: 6,
  },
  label: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "400",
  },
  input: {
    borderRadius: 12,
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255, 255, 255, 0.24)",
    color: "white",
  },
  codeInstructions: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
    fontWeight: "400",
  },
});
