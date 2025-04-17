import React from "react";
import Svg, { Path } from "react-native-svg";
import { IconProps } from "@/lib/types";

export default function BrainIcon({
  color = "currentColor",
  size = 24,
  style = {},
}: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      style={style}
    >
      <Path stroke="none" d="M0 0h24v24H0z" />
      <Path d="M15.5 13a3.5 3.5 0 0 0-3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1-7 0v-1.8" />
      <Path d="M17.5 16a3.5 3.5 0 0 0 0-7H17" />
      <Path d="M19 9.3V6.5a3.5 3.5 0 0 0-7 0M6.5 16a3.5 3.5 0 0 1 0-7H7" />
      <Path d="M5 9.3V6.5a3.5 3.5 0 0 1 7 0v10" />
    </Svg>
  );
}
