-- The autocomplete uses ILIKE directly on nome and always excludes archived rows.
set local search_path = public, extensions, pg_catalog;

create index if not exists idx_funcionarios_nome_ilike_nao_arquivados_trgm
  on public.funcionarios using gin (nome gin_trgm_ops)
  where deleted_at is null;
