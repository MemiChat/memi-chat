export const BLUR_FADE_DELAY = 0.15;

export const siteConfig = {
  name: "Memi Chat",
  description: "Use AI completely for free.",
  cta: "Download Now",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: [
    "AI Chat",
    "AI Image Editor",
    "AI Group Chat",
    "AI Image Generator",
  ],
};

export type SiteConfig = typeof siteConfig;
