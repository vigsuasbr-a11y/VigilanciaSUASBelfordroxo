"use client";

import { useEffect, useRef } from "react";
import { Search } from "lucide-react";

export function WorkspaceSearch({ dashboard }: { dashboard: boolean }) {
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k" &&
          !document.querySelector("dialog[open]")) {
        event.preventDefault();
        input.current?.focus();
      }
    }

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  return (
    <form className="workspace-search" action="/funcionarios" role="search">
      <input type="hidden" name="view" value="employees" />
      <Search size={22} aria-hidden="true" />
      <input
        ref={input}
        type="search"
        name="search"
        aria-label="Pesquisar funcionários no sistema"
        placeholder={dashboard ? "Pesquisar funcionário ou unidade..." : "Pesquisar no sistema..."}
      />
      <kbd>Ctrl + K</kbd>
    </form>
  );
}
