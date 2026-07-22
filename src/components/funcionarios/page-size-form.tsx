"use client";

type PageSizeFormProps = {
  search: string;
  unidadeId: string;
  cargo: string;
  status: string;
  pageSize: number;
};

export function PageSizeForm({
  search,
  unidadeId,
  cargo,
  status,
  pageSize,
}: PageSizeFormProps) {
  return (
    <form className="page-size-control" action="/funcionarios">
      <input type="hidden" name="view" value="employees" />
      <input type="hidden" name="search" value={search} />
      <input type="hidden" name="unidade_id" value={unidadeId} />
      <input type="hidden" name="cargo" value={cargo} />
      <input type="hidden" name="status" value={status} />
      <span>Itens por página</span>
      <select
        id="employeePageSize"
        name="pageSize"
        aria-label="Registros por página"
        defaultValue={pageSize}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
      >
        <option value="25">25</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </form>
  );
}
