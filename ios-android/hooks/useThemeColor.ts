import { Colors } from "@/lib/colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  //const theme = useColorScheme() ?? "light";
  // @TODO dont force dark - settings page status bar is wrong color on light mode
  // and settings page sheet content is wrong color on light mode
  const theme = "dark";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
