import React from "react";
import Svg, { Path } from "react-native-svg";
import { IconProps } from "@/lib/types";

export default function SendIcon({
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
    >
      <Path stroke="none" d="M0 0h24v24H0z" />
      <Path d="M4.698 4.034 21 12 4.698 19.966a.503.503 0 0 1-.546-.124.555.555 0 0 1-.12-.568L6.5 12 4.032 4.726a.555.555 0 0 1 .12-.568.503.503 0 0 1 .546-.124zM6.5 12H21" />
    </Svg>
  );
}
