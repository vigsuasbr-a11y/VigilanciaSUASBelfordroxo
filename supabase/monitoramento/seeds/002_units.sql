-- Fase 2 - seed idempotente das 15 unidades CRAS.

insert into public.units (code, roman_number, name, full_name, acronym, unit_type, display_order, active)
values
  ('cras-01-xavantes', 'I', 'Xavantes', 'CRAS I - Xavantes', 'CRAS-I', 'cras', 1, true),
  ('cras-02-santa-marta', 'II', 'Santa Marta', 'CRAS II - Santa Marta', 'CRAS-II', 'cras', 2, true),
  ('cras-03-nova-aurora', 'III', 'Nova Aurora', 'CRAS III - Nova Aurora', 'CRAS-III', 'cras', 3, true),
  ('cras-04-lote-xv', 'IV', 'Lote XV', 'CRAS IV - Lote XV', 'CRAS-IV', 'cras', 4, true),
  ('cras-05-shangrila', 'V', 'Shangrilá', 'CRAS V - Shangrilá', 'CRAS-V', 'cras', 5, true),
  ('cras-06-bom-pastor', 'VI', 'Bom Pastor', 'CRAS VI - Bom Pastor', 'CRAS-VI', 'cras', 6, true),
  ('cras-07-sargento-roncalli', 'VII', 'Sargento Roncalli', 'CRAS VII - Sargento Roncalli', 'CRAS-VII', 'cras', 7, true),
  ('cras-08-parque-suecia', 'VIII', 'Parque Suécia', 'CRAS VIII - Parque Suécia', 'CRAS-VIII', 'cras', 8, true),
  ('cras-09-jardim-do-ipe', 'IX', 'Jardim do Ipê', 'CRAS IX - Jardim do Ipê', 'CRAS-IX', 'cras', 9, true),
  ('cras-10-centro', 'X', 'Centro', 'CRAS X - Centro', 'CRAS-X', 'cras', 10, true),
  ('cras-11-wona', 'XI', 'Wona', 'CRAS XI - Wona', 'CRAS-XI', 'cras', 11, true),
  ('cras-12-babi', 'XII', 'Babi', 'CRAS XII - Babi', 'CRAS-XII', 'cras', 12, true),
  ('cras-13-santa-tereza', 'XIII', 'Santa Tereza', 'CRAS XIII - Santa Tereza', 'CRAS-XIII', 'cras', 13, true),
  ('cras-14-jardim-redentor', 'XIV', 'Jardim Redentor', 'CRAS XIV - Jardim Redentor', 'CRAS-XIV', 'cras', 14, true),
  ('cras-15-parque-sao-jose', 'XV', 'Parque São José', 'CRAS XV - Parque São José', 'CRAS-XV', 'cras', 15, true)
on conflict (code) do update
set roman_number = excluded.roman_number,
    name = excluded.name,
    full_name = excluded.full_name,
    acronym = excluded.acronym,
    unit_type = excluded.unit_type,
    display_order = excluded.display_order,
    active = excluded.active,
    updated_at = now();
