import React from "react";
import Svg, { Path } from "react-native-svg";
import { IconProps } from "@/lib/types";

export default function DocumentIcon({
  color = "currentColor",
  size = 24,
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
    >
      <Path stroke="none" d="M0 0h24v24H0z" />
      <Path d="M15 3v4a1 1 0 0 0 1 1h4" />
      <Path d="M18 17h-7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4l5 5v7a2 2 0 0 1-2 2z" />
      <Path d="M16 17v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h2" />
    </Svg>
  );
}
