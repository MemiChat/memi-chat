import React from "react";
import Svg, { Path } from "react-native-svg";
import { TouchableOpacity } from "react-native";
import { IconProps } from "@/lib/types";

export default function CloseIcon({
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
          width: size * 1.8,
          height: size * 1.8,
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
        viewBox="0 0 24 24"
      >
        <Path stroke="none" d="M0 0h24v24H0z" />
        <Path d="M18 6 6 18M6 6l12 12" />
      </Svg>
    </TouchableOpacity>
  );
}
