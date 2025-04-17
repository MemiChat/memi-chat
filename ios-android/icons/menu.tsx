import React from "react";
import Svg, { Path } from "react-native-svg";
import { TouchableOpacity } from "react-native";
import { IconProps } from "@/lib/types";

export default function MenuIcon({
  onPress,
  onPressIn,
  color = "currentColor",
  size = 24,
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
      <Svg
        width={size}
        height={size}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      >
        <Path d="M4 8h16M4 16h16" />
      </Svg>
    </TouchableOpacity>
  );
}
