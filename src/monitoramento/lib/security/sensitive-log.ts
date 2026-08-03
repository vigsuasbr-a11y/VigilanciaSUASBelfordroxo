const SENSITIVE_PATTERN = /(password|senha|token|secret|service_role|authorization|cookie)/i;

export function containsSensitiveLogText(value: unknown): boolean {
  return SENSITIVE_PATTERN.test(JSON.stringify(value));
}

