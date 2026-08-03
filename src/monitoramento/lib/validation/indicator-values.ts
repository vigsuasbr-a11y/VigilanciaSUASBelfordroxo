import { z } from "zod";

import type { IndicatorDataType, ValueStatus } from "@/monitoramento/types/domain";

export const indicatorValueInputSchema = z.object({
  dataType: z.enum(["integer", "decimal", "percentage", "short_text", "long_text", "boolean"]),
  numericValue: z.number().finite().nullable(),
  textValue: z.string().nullable(),
  valueStatus: z.enum(["informed", "not_informed", "not_applicable"]),
  acceptsNegative: z.boolean().default(false),
});

export type IndicatorValueInput = {
  dataType: IndicatorDataType;
  numericValue: number | null;
  textValue: string | null;
  valueStatus: ValueStatus;
  acceptsNegative?: boolean;
};

export type IndicatorValueValidation = {
  valid: boolean;
  errors: string[];
};

export function validateIndicatorValueInput(input: IndicatorValueInput): IndicatorValueValidation {
  const parsed = indicatorValueInputSchema.safeParse(input);

  if (!parsed.success) {
    return { valid: false, errors: parsed.error.issues.map((issue) => issue.message) };
  }

  const { dataType, numericValue, textValue, valueStatus, acceptsNegative } = parsed.data;
  const errors: string[] = [];

  if (valueStatus === "not_informed" || valueStatus === "not_applicable") {
    if (numericValue !== null || textValue !== null) {
      errors.push("Valores não informados ou não aplicáveis não devem armazenar número nem texto.");
    }
    return { valid: errors.length === 0, errors };
  }

  if (numericValue !== null && textValue !== null) {
    errors.push("Informe valor numérico ou textual, nunca ambos ao mesmo tempo.");
  }

  if (["integer", "decimal", "percentage", "boolean"].includes(dataType) && numericValue === null) {
    errors.push("Indicador numérico precisa de numeric_value quando estiver informado.");
  }

  if (["short_text", "long_text"].includes(dataType) && !textValue) {
    errors.push("Indicador textual precisa de text_value quando estiver informado.");
  }

  if (dataType === "integer" && numericValue !== null && !Number.isInteger(numericValue)) {
    errors.push("Indicador inteiro não aceita casas decimais.");
  }

  if (!acceptsNegative && numericValue !== null && numericValue < 0) {
    errors.push("Valor numérico negativo não é permitido para este indicador.");
  }

  return { valid: errors.length === 0, errors };
}

