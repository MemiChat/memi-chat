import { StyleProp, ViewProps, ViewStyle } from "react-native";

export interface IconProps extends ViewProps {
  onPress?: () => void;
  onPressIn?: () => void;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export interface Chat {
  id: string;
  title: string;
  createdAt?: string;
}

export interface Message {
  id: string;
  chatId?: string | null;
  role: string;
  createdAt?: string;
  text: string;
}

export interface Agent {
  id: number | null;
  name: string;
  description: string;
  prompt: string;
  deleted: boolean;
  consecutiveReply?: boolean;
}

export interface User {
  name: string;
  email: string;
}
