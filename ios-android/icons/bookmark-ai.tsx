import React from "react";
import Svg, { Path } from "react-native-svg";
import { IconProps } from "@/lib/types";

export default function BookmarkAIIcon({
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
      <Path d="M10.02 18.32 6 21V7a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v4.5M14 21v-4a2 2 0 1 1 4 0v4M14 19h4M21 15v6" />
    </Svg>
  );
}
