import { StyleSheet, TouchableOpacity, Text } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { lightHapticFeedbackPress } from "@/lib/utils";

export default function PromptHelp({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={lightHapticFeedbackPress}
      style={[styles.container]}
    >
      <Text
        style={{
          fontWeight: "bold",
          color: "white",
          fontSize: 14,
        }}
      >
        {title}
      </Text>
      <Text
        numberOfLines={1}
        style={{
          fontSize: 13.5,
          color: "rgba(255, 255, 255, 0.75)",
          marginTop: -3,
        }}
      >
        {description}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    maxWidth: 180,
    minWidth: 150,
    width: "auto",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
});
