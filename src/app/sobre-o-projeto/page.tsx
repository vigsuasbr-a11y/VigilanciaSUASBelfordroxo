import type { Metadata } from "next";
import { PortalChrome } from "@/components/layout/portal-chrome";
import { ProjectAboutHero } from "@/components/project/project-about-hero";
import { ProjectAuthorSection } from "@/components/project/project-author-section";
import { ProjectCallToAction } from "@/components/project/project-call-to-action";
import { ProjectObjectives } from "@/components/project/project-objectives";
import { ProjectOriginSection } from "@/components/project/project-origin-section";
import { ProjectPrinciples } from "@/components/project/project-principles";
import { ProjectResources } from "@/components/project/project-resources";
import { ProjectTimeline } from "@/components/project/project-timeline";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

export const metadata: Metadata = {
  title: "Sobre o projeto",
  description:
    "Conheça a origem, os objetivos e a autoria do Portal da Vigilância Socioassistencial.",
};

export default function SobreOProjetoPage() {
  return (
    <PortalChrome>
      <main id="conteudo">
        <ProjectAboutHero />
        <RevealOnScroll>
          <ProjectOriginSection />
        </RevealOnScroll>
        <RevealOnScroll delay={60}>
          <ProjectObjectives />
        </RevealOnScroll>
        <RevealOnScroll delay={80}>
          <ProjectAuthorSection />
        </RevealOnScroll>
        <RevealOnScroll delay={100}>
          <ProjectResources />
        </RevealOnScroll>
        <RevealOnScroll delay={120}>
          <ProjectTimeline />
        </RevealOnScroll>
        <RevealOnScroll delay={140}>
          <ProjectPrinciples />
        </RevealOnScroll>
        <ProjectCallToAction />
      </main>
    </PortalChrome>
  );
}
