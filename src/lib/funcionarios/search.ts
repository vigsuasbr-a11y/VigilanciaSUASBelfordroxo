export const employeeSearchMaxLength = 80;

export type EmployeeSuggestion = {
  id: string;
  name: string;
  role: string | null;
  unit: string | null;
};

export function getEmployeeSearchTerm(value: string) {
  return value.normalize("NFC").replace(/[\\%_*\s]+/gu, " ").trim().slice(0, employeeSearchMaxLength);
}
