export const escolaridadeOptions = [
  "Analfabeto",
  "Alfabetizado (sem escolarização formal)",
  "Ensino Fundamental incompleto",
  "Ensino Fundamental completo",
  "Ensino Médio incompleto",
  "Ensino Médio completo",
  "Ensino Superior incompleto",
  "Ensino Superior completo",
  "Especialização (Pós-graduação)",
  "Mestrado",
  "Doutorado",
] as const;

export function normalizeEscolaridadeOption(value: string | null | undefined) {
  const normalized = normalizeForComparison(value);

  return (
    escolaridadeOptions.find((option) => normalizeForComparison(option) === normalized) ??
    null
  );
}

export function normalizeEscolaridadeForFilter(value: string | null | undefined) {
  return normalizeForComparison(value);
}

function normalizeForComparison(value: string | null | undefined) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
