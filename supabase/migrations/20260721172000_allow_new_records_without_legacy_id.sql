alter table public.funcionarios
  alter column legacy_id drop not null;

alter table public.historico_movimentacoes
  alter column legacy_id drop not null,
  alter column funcionario_legacy_id drop not null;
