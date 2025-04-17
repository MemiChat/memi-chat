import { useThemeColor } from "@/hooks/useThemeColor";
import { Platform, TextInput } from "react-native";

export default function SelectableText({ text }: { text: string }) {
  const color = useThemeColor({}, "text");

  return (
    <TextInput
      value={text}
      editable={Platform.OS === "android"}
      selectTextOnFocus={true}
      multiline={true}
      style={{ color, height: "100%", width: "100%", textAlignVertical: "top" }}
    />
  );
}
