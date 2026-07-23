"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Archive, Clock3, MoreVertical, Pencil } from "lucide-react";
import { DocumentLink as Link } from "@/components/funcionarios/document-link";

type EmployeeActionsMenuProps = {
  employeeId: string;
  employeeName: string;
};

type MenuPosition = {
  top: number;
  left: number;
};

const MENU_WIDTH = 190;
const VIEWPORT_GAP = 12;

export function EmployeeActionsMenu({
  employeeId,
  employeeName,
}: EmployeeActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function closeMenu(event: MouseEvent) {
      const target = event.target as Node;

      if (
        wrapperRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    }

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    function handleViewportChange() {
      setIsOpen(false);
    }

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen]);

  function toggleMenu() {
    const rect = buttonRef.current?.getBoundingClientRect();

    if (rect) {
      const left = Math.min(
        window.innerWidth - MENU_WIDTH - VIEWPORT_GAP,
        Math.max(VIEWPORT_GAP, rect.right - MENU_WIDTH),
      );
      const shouldOpenAbove = window.innerHeight - rect.bottom < 150;
      const top = shouldOpenAbove ? rect.top - 142 : rect.bottom + 8;

      setPosition({
        left,
        top: Math.max(VIEWPORT_GAP, top),
      });
    }

    setIsOpen((current) => !current);
  }

  const menu = isOpen ? (
    <div
      ref={menuRef}
      className="row-menu-popover"
      role="menu"
      style={{ top: position.top, left: position.left }}
    >
      <Link
        role="menuitem"
        href={`/funcionarios?view=employees&modal=employee&id=${employeeId}`}
      >
        <Pencil size={15} aria-hidden="true" />
        Editar funcionário
      </Link>
      <Link
        role="menuitem"
        href={`/funcionarios?view=employees&modal=history&id=${employeeId}`}
      >
        <Clock3 size={15} aria-hidden="true" />
        Ver histórico
      </Link>
      <span className="row-menu-divider" aria-hidden="true" />
      <Link
        role="menuitem"
        className="danger-action"
        href={`/funcionarios?view=employees&modal=deleteEmployee&id=${employeeId}`}
      >
        <Archive size={15} aria-hidden="true" />
        Arquivar cadastro
      </Link>
    </div>
  ) : null;

  return (
    <div ref={wrapperRef} className="row-menu">
      <button
        ref={buttonRef}
        className="row-menu-trigger"
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Ações de ${employeeName}`}
        onClick={toggleMenu}
      >
        <MoreVertical size={18} aria-hidden="true" />
      </button>

      {typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </div>
  );
}
