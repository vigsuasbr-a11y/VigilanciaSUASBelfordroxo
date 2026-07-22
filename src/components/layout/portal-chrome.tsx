import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProjectIntroductionNotice } from "@/components/project/project-introduction-notice";

type PortalChromeProps = {
  children: ReactNode;
};

export function PortalChrome({ children }: PortalChromeProps) {
  return (
    <>
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
      <ProjectIntroductionNotice />
    </>
  );
}
