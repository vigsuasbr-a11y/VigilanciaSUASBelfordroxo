import { HeroSection } from "@/components/home/hero-section";
import { HomeAboutSection } from "@/components/home/home-about-section";
import { InstitutionalNumbersSection } from "@/components/home/institutional-numbers-section";
import { QuickSystemsSection } from "@/components/home/quick-systems-section";
import { PortalChrome } from "@/components/layout/portal-chrome";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { getSystems } from "@/services/systems";

export default async function Home() {
  const systems = await getSystems();

  return (
    <PortalChrome>
      <main id="conteudo">
        <HeroSection />
        <RevealOnScroll>
          <QuickSystemsSection systems={systems} />
        </RevealOnScroll>
        <RevealOnScroll delay={80}>
          <InstitutionalNumbersSection />
        </RevealOnScroll>
        <RevealOnScroll delay={120}>
          <HomeAboutSection />
        </RevealOnScroll>
      </main>
    </PortalChrome>
  );
}
