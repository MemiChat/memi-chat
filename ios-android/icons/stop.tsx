import React from "react";
import Svg, { Path } from "react-native-svg";
import { IconProps } from "@/lib/types";

export default function StopIcon({
  color = "currentColor",
  size = 24,
}: IconProps) {
  return (
    <Svg width={size} height={size} fill={color} viewBox="0 0 24 24">
      <Path fill="none" d="M0 0h24v24H0z" />
      <Path d="M17 4H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3z" />
    </Svg>
  );
}
