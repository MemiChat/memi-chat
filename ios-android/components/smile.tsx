import React, { useRef, useEffect } from "react";
import { Animated } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

// Create animated versions of SVG components
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const SmileAnimation = () => {
  // Initialize animated values for opacity
  const firstDotOpacity = useRef(new Animated.Value(0)).current;
  const secondDotOpacity = useRef(new Animated.Value(0)).current;
  const curveOpacity = useRef(new Animated.Value(0)).current;

  // Function to create the animation sequence
  const runAnimationSequence = () => {
    return Animated.sequence([
      // Instantly reset all opacities to 0 at the start of each loop
      Animated.parallel([
        Animated.timing(firstDotOpacity, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(secondDotOpacity, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(curveOpacity, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
      // Fade in each element in sequence
      Animated.timing(firstDotOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(secondDotOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(curveOpacity, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.delay(900), // Pause to show the smile briefly before restarting
    ]);
  };

  // Set up the looping animation
  useEffect(() => {
    const animation = Animated.loop(runAnimationSequence());
    animation.start();

    // Cleanup: stop the animation when the component unmounts
    return () => animation.stop();
  }, []);

  return (
    <Svg height="50" width="50">
      <AnimatedCircle
        cx="18.75"
        cy="18.75"
        r="2.5"
        fill="white"
        opacity={firstDotOpacity}
      />
      <AnimatedCircle
        cx="30"
        cy="18"
        r="2.5"
        fill="white"
        opacity={secondDotOpacity}
      />
      <AnimatedPath
        d="M12.5 25 Q25 32.5 37.5 25" // Further scaled down smile curve
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        opacity={curveOpacity}
      />
    </Svg>
  );
};

export default SmileAnimation;
