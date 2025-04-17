import AstronautBackground from "@/components/backgrounds/astronaut";
import { useUserStore } from "@/lib/store";
import { useEffect } from "react";
import OvercoatBackground from "./overcoat";
import RedheadBackground from "./redhead";

const backgrounds = [
  AstronautBackground,
  OvercoatBackground,
  RedheadBackground,
];
const randomBgIndex = Math.floor(Math.random() * backgrounds.length);

export default function Background() {
  const userStore = useUserStore();

  const RandomBackground = backgrounds[randomBgIndex];

  useEffect(() => {
    if (randomBgIndex === 0) {
      userStore.setChatBackground("astronaut");
    } else if (randomBgIndex === 1) {
      userStore.setChatBackground("overcoat");
    } else if (randomBgIndex === 2) {
      userStore.setChatBackground("redhead");
    }
  }, []);

  return <RandomBackground />;
}
