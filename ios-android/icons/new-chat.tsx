import React from "react";
import { TouchableOpacity } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { IconProps } from "@/lib/types";

export default function NewChatIcon({
  onPress,
  onPressIn,
  color = "currentColor",
  size = 18,
  style,
  ...props
}: IconProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      style={[
        {
          width: size * 2,
          height: size * 2,
          justifyContent: "center",
          alignItems: "center",
        },
        style,
      ]}
      {...props}
    >
      <FontAwesome6 name="edit" size={size} color={color} />
    </TouchableOpacity>
  );
}
