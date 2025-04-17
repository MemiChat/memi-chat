import { View, StyleSheet } from "react-native";
import { Image } from "expo-image";

export default function OvercoatBackground() {
  return (
    <View style={styles.absoluteFill}>
      <Image
        source={require("@/assets/images/overcoat.png")}
        style={styles.backgroundImage}
        contentFit="cover"
      />
      <View style={styles.overlay} />
    </View>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: -1,
  },
  absoluteFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    zIndex: -1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    zIndex: 0,
  },
});
