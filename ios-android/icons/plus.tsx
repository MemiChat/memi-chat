import React from "react";
import Svg, { Path } from "react-native-svg";
import { IconProps } from "@/lib/types";

export default function PlusIcon({
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
      <Path d="M12 5v14M5 12h14" />
    </Svg>
  );
}
