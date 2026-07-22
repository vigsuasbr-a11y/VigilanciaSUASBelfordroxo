"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

export function MobileMenuControls() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("funcionarios-menu-open", isDrawerOpen);

    return () => {
      document.body.classList.remove("funcionarios-menu-open");
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    document.body.classList.toggle(
      "funcionarios-sidebar-collapsed",
      isSidebarCollapsed,
    );

    return () => {
      document.body.classList.remove("funcionarios-sidebar-collapsed");
    };
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1100px)");
    const handleChange = () => {
      setIsNarrowViewport(mediaQuery.matches);

      if (mediaQuery.matches) {
        setIsSidebarCollapsed(false);
      } else {
        setIsDrawerOpen(false);
      }
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  function handleMenuClick() {
    if (window.matchMedia("(max-width: 1100px)").matches) {
      setIsDrawerOpen((current) => !current);
      return;
    }

    setIsSidebarCollapsed((current) => !current);
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
        onClick={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
