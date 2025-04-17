import React from "react";
import Svg, { Path } from "react-native-svg";
import { IconProps } from "@/lib/types";

export default function ArrowRightIcon({
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
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <Path stroke="none" d="M0 0h24v24H0z" />
      <Path d="M5 12h14M15 16l4-4M15 8l4 4" />
    </Svg>
  );
}
