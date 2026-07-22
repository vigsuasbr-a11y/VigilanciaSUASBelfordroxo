"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Eye,
  KeyRound,
  MoreVertical,
  Pencil,
  Shield,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";

type UserActionsMenuProps = {
  userId: string;
  userName: string;
  isActive: boolean;
  canManageAccess: boolean;
  disableAccessToggle?: boolean;
};

type MenuPosition = {
  top: number;
  left: number;
};

const MENU_WIDTH = 240;
const VIEWPORT_GAP = 12;

export function UserActionsMenu({
  userId,
  userName,
  isActive,
  canManageAccess,
  disableAccessToggle = false,
}: UserActionsMenuProps) {
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
      const estimatedHeight = canManageAccess ? 268 : 136;
      const left = Math.min(
        window.innerWidth - MENU_WIDTH - VIEWPORT_GAP,
        Math.max(VIEWPORT_GAP, rect.right - MENU_WIDTH),
      );
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
      className="row-menu-popover user-row-menu-popover"
      role="menu"
      style={{ top: position.top, left: position.left }}
    >
      <Link
        role="menuitem"
        href={`/funcionarios?view=users&modal=userDetails&userId=${userId}`}
      >
        <Eye size={15} aria-hidden="true" />
        Visualizar perfil
      </Link>
      {canManageAccess ? (
        <>
          <Link
            role="menuitem"
            href={`/funcionarios?view=users&modal=user&userId=${userId}`}
          >
            <Pencil size={15} aria-hidden="true" />
            Editar usuário
          </Link>
          <Link
            role="menuitem"
            href={`/funcionarios?view=users&modal=changeUserRole&userId=${userId}`}
          >
            <Shield size={15} aria-hidden="true" />
            Alterar perfil
          </Link>
          <Link
            role="menuitem"
            href={`/funcionarios?view=users&modal=changePassword&userId=${userId}`}
          >
            <KeyRound size={15} aria-hidden="true" />
            Alterar senha
          </Link>
          <span className="row-menu-divider" aria-hidden="true" />
          {disableAccessToggle ? (
            <span className="row-menu-disabled" role="menuitem" aria-disabled="true">
              <Shield size={15} aria-hidden="true" />
              Último admin protegido
            </span>
          ) : (
            <Link
              role="menuitem"
              className={isActive ? "danger-action" : undefined}
              href={`/funcionarios?view=users&modal=${
                isActive ? "deactivateUser" : "reactivateUser"
              }&userId=${userId}`}
            >
              {isActive ? (
                <UserRoundX size={15} aria-hidden="true" />
              ) : (
                <UserRoundCheck size={15} aria-hidden="true" />
              )}
              {isActive ? "Desativar acesso" : "Reativar acesso"}
            </Link>
          )}
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
        aria-label={`Abrir ações do usuário ${userName}`}
        onClick={toggleMenu}
      >
        <MoreVertical size={18} aria-hidden="true" />
      </button>

      {typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </div>
  );
}
