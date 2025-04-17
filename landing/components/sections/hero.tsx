"use client";

import { Icons } from "@/components/icons";
import { Section } from "@/components/section";
import { easeInOutCubic } from "@/lib/animation";
import { siteConfig } from "@/lib/config";
import { motion, useScroll, useTransform } from "framer-motion";

export function Hero() {
  const { scrollY } = useScroll({
    offset: ["start start", "end start"],
  });
  const y2 = useTransform(scrollY, [0, 300], [50, 0]);
  const y3 = useTransform(scrollY, [0, 300], [0, 0]);
  const y4 = useTransform(scrollY, [0, 300], [50, 0]);

  return (
    <Section id="hero" className="min-h-[100vh] w-full overflow-hidden">
      <main className="mx-auto pt-6 text-center relative px-4">
        <div className="relative">
          <motion.div
            initial={{ scale: 4.5, height: "80vh" }}
            animate={{ scale: 1, height: "10vh" }}
            transition={{
              scale: { delay: 0, duration: 1.8, ease: easeInOutCubic },
              height: { delay: 0, duration: 1.8, ease: easeInOutCubic },
            }}
            className="mb-16 relative z-20"
            style={{ transformOrigin: "top" }}
          >
            <div className="bg-gradient-to-r from-blue-300 to-blue-500 text-white text-xl font-bold pt-2 h-20 w-20 flex items-center justify-center rounded-3xl mx-auto shadow-md">
              <Icons.logo className="w-full h-full" color="white" />
            </div>
          </motion.div>
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="absolute inset-0 top-20 z-10"
          >
            {siteConfig.name}
          </motion.div>
        </div>

        <div className="max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: easeInOutCubic }}
            className="text-5xl font-bold mb-4 tracking-tighter"
          >
            {siteConfig.description}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: easeInOutCubic }}
            className="max-w-2xl mx-auto text-xl mb-8 font-medium text-balance"
          >
            Edit images, talk about Youtube videos and have group chats with AI.
          </motion.p>
          <div className="flex flex-col gap-4 justify-center items-center mb-16">
            <div className="flex justify-center gap-2">
              <motion.img
                src="/download-black.svg"
                alt="Download"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="w-40 flex-shrink-0 dark:hidden block"
              />
              <motion.img
                src="/download-google-black.webp"
                alt="Download"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="w-[176px] flex-shrink-0 dark:hidden block"
              />
              <motion.img
                src="/download-white.svg"
                alt="Download"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="w-40 flex-shrink-0 hidden dark:block"
              />
              <motion.img
                src="/download-google-white.png"
                alt="Download"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="w-[174px] flex-shrink-0 hidden dark:block"
              />
            </div>
            <span className="text-sm text-muted-foreground">
              Coming soon to iOS and Android
            </span>
          </div>
        </div>
        <div className="flex flex-nowrap items-center justify-center gap-4 sm:gap-8 h-auto sm:h-[500px] select-none">
          <motion.img
            src="/Device-1.png"
            alt="iPhone"
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ y: y2 }}
            transition={{ duration: 1, delay: 1 }}
            className="w-40 sm:w-64 h-[333px] sm:h-[500px] flex-shrink-0"
          />
          <motion.img
            src="/Device-2.png"
            alt="iPhone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ y: y3 }}
            transition={{ duration: 1, delay: 1 }}
            className="w-40 sm:w-64 h-[333px] sm:h-[500px] flex-shrink-0"
          />
          <motion.img
            src="/Device-3.png"
            alt="iPhone"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            style={{ y: y4 }}
            transition={{ duration: 1, delay: 1 }}
            className="w-40 sm:w-64 h-[333px] sm:h-[500px] flex-shrink-0"
          />
        </div>
      </main>
    </Section>
  );
}
