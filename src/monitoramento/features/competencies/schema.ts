import { z } from "zod";

export const createCompetencySchema = z.object({
  unit_id: z.string().uuid("Selecione uma unidade válida."),
  form_version_id: z.string().uuid("Selecione uma versão de formulário válida."),
  reference_year: z.coerce.number().int().min(2000).max(2100),
  reference_month: z.coerce.number().int().min(1).max(12),
});

export type CreateCompetencyInput = z.infer<typeof createCompetencySchema>;

export const saveFieldDraftSchema = z.object({
  competencyId: z.string().uuid(),
  valueStatus: z.enum(["informed", "not_informed", "not_applicable"]),
  numericValue: z.number().finite().nullable(),
  textValue: z.string().max(10000).nullable(),
  notes: z.string().max(5000).nullable().optional(),
});

export const saveIndicatorValueSchema = saveFieldDraftSchema.extend({
  indicatorId: z.string().uuid(),
});

export const saveSpecialFieldValueSchema = saveFieldDraftSchema.extend({
  specialFieldDefinitionId: z.string().uuid(),
});

export const saveGroupObservationSchema = z.object({
  competencyId: z.string().uuid(),
  groupId: z.string().uuid(),
  text: z.string().max(8000),
});

export const submitCompetencyReviewSchema = z.object({
  competencyId: z.string().uuid(),
  comment: z.string().max(4000).optional(),
  warningJustification: z.string().max(4000).optional(),
});

export type SaveIndicatorValueInput = z.infer<typeof saveIndicatorValueSchema>;
export type SaveSpecialFieldValueInput = z.infer<typeof saveSpecialFieldValueSchema>;
export type SaveGroupObservationInput = z.infer<typeof saveGroupObservationSchema>;
export type SubmitCompetencyReviewInput = z.infer<typeof submitCompetencyReviewSchema>;
