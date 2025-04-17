import React from "react";
import Svg, { Path } from "react-native-svg";
import { IconProps } from "@/lib/types";

export default function VideoIcon({
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
      <Path d="m15 10 4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14v-4zM3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </Svg>
  );
}
