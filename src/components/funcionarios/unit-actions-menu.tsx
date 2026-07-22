"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Eye, MoreVertical, Pencil, Trash2, UsersRound } from "lucide-react";

type UnitActionsMenuProps = {
  unitId: string;
  unitName: string;
  employeeCount: number;
  canManage: boolean;
};

type MenuPosition = {
  top: number;
  left: number;
};

const MENU_WIDTH = 236;
const VIEWPORT_GAP = 12;

export function UnitActionsMenu({
  unitId,
  unitName,
  employeeCount,
  canManage,
}: UnitActionsMenuProps) {
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
      const estimatedHeight = canManage ? 206 : 140;
      const shouldOpenAbove = window.innerHeight - rect.bottom < estimatedHeight;
      const top = shouldOpenAbove
        ? rect.top - estimatedHeight - 8
        : rect.bottom + 8;

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
      className="row-menu-popover unit-row-menu-popover"
      role="menu"
      style={{ top: position.top, left: position.left }}
    >
      <Link
        role="menuitem"
        href={`/funcionarios?view=units&modal=unitDetails&unitId=${unitId}`}
      >
        <Eye size={15} aria-hidden="true" />
        Ver detalhes
      </Link>
      {canManage ? (
        <Link
          role="menuitem"
          href={`/funcionarios?view=units&modal=unit&unitId=${unitId}`}
        >
          <Pencil size={15} aria-hidden="true" />
          Editar unidade
        </Link>
      ) : null}
      <Link role="menuitem" href={`/funcionarios?view=employees&unidade_id=${unitId}`}>
        <UsersRound size={15} aria-hidden="true" />
        {employeeCount > 0 ? "Ver vinculados" : "Ver funcionários"}
      </Link>
      {canManage ? (
        <>
          <span className="row-menu-divider" aria-hidden="true" />
          <Link
            role="menuitem"
            className="danger-action"
            href={`/funcionarios?view=units&modal=deleteUnit&unitId=${unitId}`}
          >
            <Trash2 size={15} aria-hidden="true" />
            Excluir unidade
          </Link>
        </>
      ) : null}
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
        aria-label={`Ações de ${unitName}`}
        onClick={toggleMenu}
      >
        <MoreVertical size={18} aria-hidden="true" />
      </button>

      {typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </div>
  );
}
