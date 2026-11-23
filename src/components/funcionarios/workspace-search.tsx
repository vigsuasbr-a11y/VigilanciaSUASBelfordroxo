"use client";

import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ChevronRight, Search, X } from "lucide-react";
import { employeeSearchMaxLength, getEmployeeSearchTerm, type EmployeeSuggestion } from "@/lib/funcionarios/search";

type SearchResponse =
  | { term: string; results: EmployeeSuggestion[] }
  | { term: string; error: true };

export function WorkspaceSearch({ canEdit }: { canEdit: boolean }) {
  const form = useRef<HTMLFormElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const term = getEmployeeSearchTerm(query);
  const showPanel = open && term.length >= 2;
  const currentResponse = response?.term === term ? response : null;
  const results = currentResponse && "results" in currentResponse ? currentResponse.results : [];
  const active = showPanel ? results[activeIndex] : undefined;
  const loading = showPanel && !currentResponse;
  const allResultsUrl = `/funcionarios?${new URLSearchParams({ view: "employees", search: query.trim() })}`;

  useEffect(() => {
    if (!showPanel) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      try {
        const search = new URLSearchParams({ q: term });
        const result = await fetch(`/api/funcionarios/busca?${search}`, { signal: controller.signal, cache: "no-store" });
        if (!result.ok) throw new Error("Falha na pesquisa");
        const { results } = await result.json() as { results: EmployeeSuggestion[] };
        if (!controller.signal.aborted) setResponse({ term, results });
      } catch {
        if (!controller.signal.aborted) setResponse({ term, error: true });
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [showPanel, term]);

  useEffect(() => {
    if (!showPanel) return;
    function handleOutside(event: PointerEvent) {
      if (event.target instanceof Node && !form.current?.contains(event.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [showPanel]);

  function openEmployee(employee: EmployeeSuggestion) {
    const params = new URLSearchParams({ view: "employees", modal: canEdit ? "employee" : "history", id: employee.id });
    window.location.assign(`/funcionarios?${params}`);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Enter" && active) {
      event.preventDefault();
      openEmployee(active);
    }
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && term.length >= 2) {
      event.preventDefault();
      setOpen(true);
      if (!results.length) return;
      const next = event.key === "ArrowDown"
        ? (activeIndex + 1) % results.length
        : activeIndex <= 0 ? results.length - 1 : activeIndex - 1;
      setActiveIndex(next);
      document.getElementById(`${listId}-${next}`)?.scrollIntoView({ block: "nearest" });
    }
  }

  return (
    <form
      ref={form}
      className="workspace-search"
      action="/funcionarios"
      role="search"
      onKeyDown={(event) => {
        if (event.key === "Escape" && showPanel && !event.nativeEvent.isComposing) {
          event.preventDefault();
          if (event.target !== input.current) input.current?.focus();
          setOpen(false);
          setActiveIndex(-1);
        }
      }}
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
          setOpen(false);
          setActiveIndex(-1);
        }
      }}
    >
      <input type="hidden" name="view" value="employees" />
      <Search className="workspace-search-icon" size={20} aria-hidden="true" />
      <input
        ref={input}
        type="text"
        inputMode="search"
        name="search"
        value={query}
        maxLength={employeeSearchMaxLength}
        autoComplete="off"
        role="combobox"
        aria-label="Pesquisar funcionários no sistema"
        aria-autocomplete="list"
        aria-expanded={showPanel}
        aria-controls={listId}
        aria-activedescendant={active ? `${listId}-${activeIndex}` : undefined}
        placeholder="Pesquisar funcionário pelo nome..."
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onChange={(event) => {
          if (getEmployeeSearchTerm(event.target.value) !== term) setResponse(null);
          setQuery(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
      />
      {query ? (
        <button
          className="workspace-search-clear"
          type="button"
          aria-label="Limpar pesquisa"
          onClick={() => {
            setQuery("");
            setResponse(null);
            setActiveIndex(-1);
            input.current?.focus();
          }}
        >
          <X size={16} aria-hidden="true" />
        </button>
      ) : null}
      <div className="workspace-search-dropdown" hidden={!showPanel}>
        {results.length ? (
          <div className="workspace-search-meta" aria-hidden="true">
            <span>Funcionários encontrados</span>
            <span>{results.length} {results.length === 1 ? "sugestão" : "sugestões"}</span>
          </div>
        ) : null}
        <div className="workspace-search-status" role="status">
          {loading ? <span>Buscando funcionários…</span>
            : currentResponse && "error" in currentResponse ? <span>Não foi possível pesquisar. Tente novamente.</span>
            : !results.length && showPanel ? <span>Nenhum funcionário encontrado</span>
            : results.length ? <span className="sr-only">{results.length} {results.length === 1 ? "funcionário encontrado" : "funcionários encontrados"}</span>
            : null}
        </div>
        <ul className="workspace-search-results" id={listId} role="listbox" aria-label="Sugestões de funcionários" aria-busy={loading}>
          {results.map((employee, index) => (
            <li
              key={employee.id}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => openEmployee(employee)}
            >
              <span className="workspace-search-avatar" aria-hidden="true">
                {employee.name.trim().split(/\s+/u).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}
              </span>
              <span className="workspace-search-copy">
                <strong>{employee.name}</strong>
                <span>{employee.role ?? "Cargo não informado"}</span>
                <small>{employee.unit ?? "Sem unidade vinculada"}</small>
              </span>
              <ChevronRight size={17} aria-hidden="true" />
            </li>
          ))}
        </ul>
        <a className="workspace-search-all" href={allResultsUrl}>
          Ver todos os resultados <ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>
    </form>
  );
}
