"use client";

import { type MouseEvent, type ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";

type PortalPageTransitionProps = {
  children: ReactNode;
};

const pendingClassName = "portal-route-pending";

export function PortalPageTransition({ children }: PortalPageTransitionProps) {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.remove(pendingClassName);
  }, [pathname]);

  useEffect(() => {
    function clearPendingState() {
      document.documentElement.classList.remove(pendingClassName);
    }

    window.addEventListener("pageshow", clearPendingState);

    return () => window.removeEventListener("pageshow", clearPendingState);
  }, []);

  function handleNavigationCapture(event: MouseEvent<HTMLDivElement>) {
    if (event.defaultPrevented) {
      return;
    }

    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const anchor = target.closest("a");

    if (!anchor) {
      return;
    }

    const href = anchor.getAttribute("href");

    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return;
    }

    const destination = new URL(href, window.location.href);

    if (destination.origin !== window.location.origin || destination.pathname === pathname) {
      return;
    }

    document.documentElement.classList.add(pendingClassName);
  }

  return (
    <div className="portal-page-shell" onClickCapture={handleNavigationCapture}>
      {children}
    </div>
  );
}
