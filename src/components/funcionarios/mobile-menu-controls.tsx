"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Menu } from "lucide-react";

const desktopSidebarKey = "funcionarios-sidebar-collapsed";

export function MobileMenuControls() {
  const toggle = useRef<HTMLButtonElement>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);
  const [hasToggledSidebar, setHasToggledSidebar] = useState(false);
  const [tooltip, setTooltip] = useState<{ label: string; top: number } | null>(null);

  useEffect(() => {
    document.body.classList.toggle("funcionarios-menu-open", isDrawerOpen);

    return () => {
      document.body.classList.remove("funcionarios-menu-open");
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    document.body.classList.toggle(desktopSidebarKey, isSidebarCollapsed && !isNarrowViewport);
    document.body.classList.toggle("funcionarios-sidebar-interacted", hasToggledSidebar);

    return () => {
      document.body.classList.remove(desktopSidebarKey, "funcionarios-sidebar-interacted");
    };
  }, [hasToggledSidebar, isNarrowViewport, isSidebarCollapsed]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1100px)");
    const restoreSidebar = () => {
      try {
        setIsSidebarCollapsed(sessionStorage.getItem(desktopSidebarKey) === "true");
      } catch {
        // The sidebar still works when session storage is unavailable.
      }
    };
    const handleChange = () => {
      setIsNarrowViewport(mediaQuery.matches);
      setTooltip(null);
      if (!mediaQuery.matches) setIsDrawerOpen(false);
    };

    restoreSidebar();
    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const sidebar = document.getElementById("appSidebar");
    const links = sidebar?.querySelectorAll<HTMLAnchorElement>("a[href]");
    if (!links?.length) return;
    const firstLink = links[0];
    const lastLink = links[links.length - 1];
    firstLink.focus();

    function handleDrawerKeys(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
        toggle.current?.focus();
      }
      if (event.key === "Tab" && event.shiftKey && document.activeElement === firstLink) {
        event.preventDefault();
        lastLink.focus();
      } else if (event.key === "Tab" && !event.shiftKey && document.activeElement === lastLink) {
        event.preventDefault();
        firstLink.focus();
      }
    }
    window.addEventListener("keydown", handleDrawerKeys);
    return () => window.removeEventListener("keydown", handleDrawerKeys);
  }, [isDrawerOpen]);

  useEffect(() => {
    if (!isSidebarCollapsed || isNarrowViewport) return;
    const sidebar = document.getElementById("appSidebar");
    if (!sidebar) return;

    function findTarget(event: Event) {
      return event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-sidebar-tooltip]")
        : null;
    }

    function positionTooltip(target: HTMLElement) {
      const label = target.dataset.sidebarTooltip;
      if (!label) return;
      const bounds = target.getBoundingClientRect();
      setTooltip({ label, top: bounds.top + bounds.height / 2 });
    }

    function showTooltip(event: PointerEvent | FocusEvent) {
      const target = findTarget(event);
      if (!target || ("pointerType" in event && event.pointerType === "touch")) return;
      if (event.type === "focusin" && !target.matches(":focus-visible")) return;
      positionTooltip(target);
    }

    function hideTooltip(event: PointerEvent | FocusEvent) {
      const target = findTarget(event);
      if (target && event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return;
      setTooltip(null);
    }

    const trackScroll = () => {
      const target = sidebar.querySelector<HTMLElement>("[data-sidebar-tooltip]:focus-visible");
      if (target) positionTooltip(target);
      else setTooltip(null);
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setTooltip(null);
    };
    sidebar.addEventListener("pointerover", showTooltip);
    sidebar.addEventListener("pointerout", hideTooltip);
    sidebar.addEventListener("focusin", showTooltip);
    sidebar.addEventListener("focusout", hideTooltip);
    sidebar.addEventListener("scroll", trackScroll, true);
    window.addEventListener("keydown", dismissOnEscape);
    return () => {
      sidebar.removeEventListener("pointerover", showTooltip);
      sidebar.removeEventListener("pointerout", hideTooltip);
      sidebar.removeEventListener("focusin", showTooltip);
      sidebar.removeEventListener("focusout", hideTooltip);
      sidebar.removeEventListener("scroll", trackScroll, true);
      window.removeEventListener("keydown", dismissOnEscape);
    };
  }, [isNarrowViewport, isSidebarCollapsed]);

  function handleMenuClick() {
    if (window.matchMedia("(max-width: 1100px)").matches) {
      setIsDrawerOpen((current) => !current);
      return;
    }

    const next = !isSidebarCollapsed;
    setIsSidebarCollapsed(next);
    setHasToggledSidebar(true);
    setTooltip(null);
    try {
      sessionStorage.setItem(desktopSidebarKey, String(next));
    } catch {
      // The current state still applies without storage.
    }
  }

  const menuLabel = isNarrowViewport
    ? isDrawerOpen
      ? "Fechar menu"
      : "Abrir menu"
    : isSidebarCollapsed
      ? "Expandir menu"
      : "Recolher menu";
  const isMenuExpanded = isNarrowViewport ? isDrawerOpen : !isSidebarCollapsed;

  return (
    <>
      <button
        ref={toggle}
        className="icon-button menu-toggle"
        type="button"
        aria-label={menuLabel}
        aria-controls="appSidebar"
        aria-expanded={isMenuExpanded}
        onClick={handleMenuClick}
      >
        <Menu size={20} aria-hidden="true" />
      </button>
      <button
        className="sidebar-backdrop"
        type="button"
        aria-label="Fechar menu"
        tabIndex={-1}
        onClick={() => {
          setIsDrawerOpen(false);
          toggle.current?.focus();
        }}
      />
      {tooltip && isSidebarCollapsed && !isNarrowViewport
        ? createPortal(
            <div className="workspace-sidebar-tooltip" style={{ top: tooltip.top }} aria-hidden="true">
              {tooltip.label}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
