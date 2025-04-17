import { CTA } from "@/components/sections/cta";
import { Footer } from "@/components/sections/footer";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";

export default function Home() {
  return (
    <main className="relative">
      <Header />
      <Hero />
      <CTA />
      <Footer />
    </main>
  );
}
