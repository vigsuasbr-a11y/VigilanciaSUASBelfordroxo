export type MaskKind =
  | "cep"
  | "cnpj"
  | "cpf"
  | "date"
  | "email"
  | "nis"
  | "percentage"
  | "phone"
  | "pisPasep"
  | "rg"
  | "text"
  | "time";

export type FieldValidationOptions = {
  label?: string;
  minLength?: number;
  noFuture?: boolean;
  required?: boolean;
};

export type FieldValidationResult = {
  isValid: boolean;
  message: string | null;
};

const importedSpreadsheetNote = "Importado da planilha FUNCIONARIOS ATIVOS";

export function onlyDigits(value: string | null | undefined, maxLength?: number) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return typeof maxLength === "number" ? digits.slice(0, maxLength) : digits;
}

export function normalizeWhitespace(value: string | null | undefined) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function cleanObservationText(value: string | null | undefined) {
  const cleaned = normalizeWhitespace(value).replaceAll(importedSpreadsheetNote, "").trim();
  return cleaned || null;
}

export function looksLikeImportedDateText(value: string | null | undefined) {
  return /\b(GMT|Hor[aá]rio|Standard Time|Daylight Time|Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b/i.test(
    String(value ?? ""),
  );
}

export function maskCpf(value: string | null | undefined) {
  const digits = onlyDigits(value, 11);
  return applyPattern(digits, [3, 3, 3, 2], [".", ".", "-"]);
}

export function maskRg(value: string | null | undefined) {
  const digits = onlyDigits(value, 9);
  return applyPattern(digits, [2, 3, 3, 1], [".", ".", "-"]);
}

export function maskPhone(value: string | null | undefined) {
  const digits = onlyDigits(value, 11);

  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;

  const ddd = digits.slice(0, 2);
  const number = digits.slice(2);
  const firstPartLength = digits.length <= 10 ? 4 : 5;
  const firstPart = number.slice(0, firstPartLength);
  const secondPart = number.slice(firstPartLength, firstPartLength + 4);

  return `(${ddd}) ${firstPart}${secondPart ? `-${secondPart}` : ""}`;
}

export function maskCep(value: string | null | undefined) {
  const digits = onlyDigits(value, 8);
  return applyPattern(digits, [5, 3], ["-"]);
}

export function maskDate(value: string | null | undefined) {
  const isoDate = parseIsoDate(String(value ?? ""));

  if (isoDate) {
    return `${pad2(isoDate.day)}/${pad2(isoDate.month)}/${isoDate.year}`;
  }

  const digits = onlyDigits(value, 8);
  return applyPattern(digits, [2, 2, 4], ["/", "/"]);
}

export function maskTime(value: string | null | undefined) {
  const digits = onlyDigits(value, 4);
  return applyPattern(digits, [2, 2], [":"]);
}

export function maskPercentage(value: string | null | undefined) {
  const digits = onlyDigits(value, 4);
  if (!digits) return "";
  const padded = digits.padStart(3, "0");
  const integer = padded.slice(0, -2).replace(/^0+(?=\d)/, "");
  const decimals = padded.slice(-2);
  return `${integer || "0"},${decimals}%`;
}

export function maskNis(value: string | null | undefined) {
  const digits = onlyDigits(value, 11);
  return applyPattern(digits, [3, 5, 2, 1], [".", ".", "-"]);
}

export const maskPisPasep = maskNis;

export function maskCnpj(value: string | null | undefined) {
  const digits = onlyDigits(value, 14);
  return applyPattern(digits, [2, 3, 3, 4, 2], [".", ".", "/", "-"]);
}

export function maskEmail(value: string | null | undefined) {
  return String(value ?? "").replace(/\s/g, "").toLowerCase();
}

export function maskValue(kind: MaskKind | undefined, value: string | null | undefined) {
  switch (kind) {
    case "cep":
      return maskCep(value);
    case "cnpj":
      return maskCnpj(value);
    case "cpf":
      return maskCpf(value);
    case "date":
      return maskDate(value);
    case "email":
      return maskEmail(value);
    case "nis":
      return maskNis(value);
    case "percentage":
      return maskPercentage(value);
    case "phone":
      return maskPhone(value);
    case "pisPasep":
      return maskPisPasep(value);
    case "rg":
      return maskRg(value);
    case "time":
      return maskTime(value);
    case "text":
    default:
      return String(value ?? "");
  }
}

export function validateFieldValue(
  kind: MaskKind | undefined,
  value: string,
  options: FieldValidationOptions = {},
): FieldValidationResult {
  const label = options.label ?? "Campo";
  const trimmed = value.trim();

  if (!trimmed) {
    return options.required
      ? { isValid: false, message: `${label} é obrigatório.` }
      : { isValid: true, message: null };
  }

  if (options.minLength && trimmed.length < options.minLength) {
    return {
      isValid: false,
      message: `${label} deve ter pelo menos ${options.minLength} caracteres.`,
    };
  }

  switch (kind) {
    case "cep":
      return validateDigitsLength(value, 8, "CEP");
    case "cnpj":
      return validateCnpj(value)
        ? ok()
        : fail("Informe um CNPJ válido.");
    case "cpf":
      return validateCpf(value)
        ? ok()
        : fail("Informe um CPF válido.");
    case "date":
      return validateDate(value, options.noFuture);
    case "email":
      return isValidEmail(value)
        ? ok()
        : fail("Informe um e-mail válido.");
    case "nis":
      return validateDigitsLength(value, 11, "NIS");
    case "phone":
      return validatePhone(value);
    case "pisPasep":
      return validateDigitsLength(value, 11, "PIS/PASEP");
    case "rg":
      return validateDigitsLength(value, 9, "RG");
    case "time":
      return validateTime(value);
    case "percentage":
    case "text":
    default:
      return ok();
  }
}

export function sanitizeCpfForDatabase(value: string | null | undefined) {
  const digits = onlyDigits(value, 11);
  return digits && validateCpf(digits) ? digits : null;
}

export function sanitizeCnpjForDatabase(value: string | null | undefined) {
  const digits = onlyDigits(value, 14);
  return digits && validateCnpj(digits) ? digits : null;
}

export function sanitizePhoneForDatabase(value: string | null | undefined) {
  if (looksLikeImportedDateText(value)) return null;
  const digits = onlyDigits(value, 11);
  return digits.length === 10 || digits.length === 11 ? digits : null;
}

export function sanitizeNumericDocument(value: string | null | undefined, length: number) {
  const digits = onlyDigits(value, length);
  return digits.length === length ? digits : null;
}

export function sanitizeEmailForDatabase(value: string | null | undefined) {
  const email = maskEmail(value).trim();
  return email && isValidEmail(email) ? email : null;
}

export function dateToDatabase(value: string | null | undefined, options: { noFuture?: boolean } = {}) {
  const parsed = parseDateInput(value);
  if (!parsed) return null;

  if (options.noFuture && isFutureDate(parsed)) {
    return null;
  }

  return `${parsed.year}-${pad2(parsed.month)}-${pad2(parsed.day)}`;
}

export function formatCpfForDisplay(value: string | null | undefined) {
  const digits = onlyDigits(value, 11);
  return digits.length === 11 ? maskCpf(digits) : "";
}

export function formatPhoneForDisplay(value: string | null | undefined) {
  if (looksLikeImportedDateText(value)) return "";
  const digits = onlyDigits(value, 11);
  return digits.length === 10 || digits.length === 11 ? maskPhone(digits) : "";
}

export function formatDateForInput(value: string | null | undefined) {
  return maskDate(value);
}

export function validateCpf(value: string | null | undefined) {
  const digits = onlyDigits(value, 11);
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;

  const firstCheck = calculateCpfCheckDigit(digits.slice(0, 9), 10);
  const secondCheck = calculateCpfCheckDigit(`${digits.slice(0, 9)}${firstCheck}`, 11);

  return digits.endsWith(`${firstCheck}${secondCheck}`);
}

export function validateCnpj(value: string | null | undefined) {
  const digits = onlyDigits(value, 14);
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false;

  const firstCheck = calculateCnpjCheckDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondCheck = calculateCnpjCheckDigit(`${digits.slice(0, 12)}${firstCheck}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return digits.endsWith(`${firstCheck}${secondCheck}`);
}

export function isValidEmail(value: string | null | undefined) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? "").trim());
}

function validateDigitsLength(value: string, length: number, label: string) {
  const digits = onlyDigits(value);
  return digits.length === length
    ? ok()
    : fail(`${label} deve conter ${length} dígitos.`);
}

function validatePhone(value: string) {
  const digits = onlyDigits(value, 11);

  if (digits.length !== 10 && digits.length !== 11) {
    return fail("Telefone deve conter DDD e 8 ou 9 dígitos.");
  }

  return ok();
}

function validateDate(value: string, noFuture = false) {
  const parsed = parseDateInput(value);

  if (!parsed) {
    return fail("Informe uma data válida no formato dd/mm/aaaa.");
  }

  if (noFuture && isFutureDate(parsed)) {
    return fail("A data de nascimento não pode ser futura.");
  }

  return ok();
}

function validateTime(value: string) {
  const digits = onlyDigits(value, 4);
  if (digits.length !== 4) return fail("Informe a hora no formato HH:mm.");

  const hours = Number(digits.slice(0, 2));
  const minutes = Number(digits.slice(2, 4));

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return fail("Informe uma hora entre 00:00 e 23:59.");
  }

  return ok();
}

function parseDateInput(value: string | null | undefined) {
  const raw = String(value ?? "").trim();
  const isoDate = parseIsoDate(raw);
  if (isoDate) return isoDate;

  const match = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  return isExistingDate(day, month, year) ? { day, month, year } : null;
}

function parseIsoDate(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return isExistingDate(day, month, year) ? { day, month, year } : null;
}

function isExistingDate(day: number, month: number, year: number) {
  if (year < 1900 || year > 2200 || month < 1 || month > 12 || day < 1) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isFutureDate(date: { day: number; month: number; year: number }) {
  const input = new Date(date.year, date.month - 1, date.day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return input > today;
}

function calculateCpfCheckDigit(base: string, weight: number) {
  const total = base
    .split("")
    .reduce((sum, digit, index) => sum + Number(digit) * (weight - index), 0);
  const check = 11 - (total % 11);
  return check >= 10 ? 0 : check;
}

function calculateCnpjCheckDigit(base: string, weights: number[]) {
  const total = base
    .split("")
    .reduce((sum, digit, index) => sum + Number(digit) * weights[index], 0);
  const check = total % 11;
  return check < 2 ? 0 : 11 - check;
}

function applyPattern(digits: string, groups: number[], separators: string[]) {
  let output = "";
  let cursor = 0;

  groups.forEach((groupLength, index) => {
    const part = digits.slice(cursor, cursor + groupLength);
    if (!part) return;

    if (output && separators[index - 1]) {
      output += separators[index - 1];
    }

    output += part;
    cursor += groupLength;
  });

  return output;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function ok(): FieldValidationResult {
  return { isValid: true, message: null };
}

function fail(message: string): FieldValidationResult {
  return { isValid: false, message };
}
