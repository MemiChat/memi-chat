import React from "react";
import Svg, { Path } from "react-native-svg";
import { IconProps } from "@/lib/types";

export default function BoltIcon({
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
      <Path d="M13 3v7h6l-8 11v-7H5l8-11" />
    </Svg>
  );
}
