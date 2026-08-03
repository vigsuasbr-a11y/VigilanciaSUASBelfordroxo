import { z } from "zod";

const roleIdsSchema = z
  .array(z.string().uuid())
  .min(1, "Selecione ao menos um papel de acesso.")
  .max(4, "Selecione apenas os papéis disponíveis.");

export const createManagedUserSchema = z.object({
  active: z.boolean().default(true),
  displayName: z.string().trim().max(120).optional(),
  email: z.string().trim().toLowerCase().email().max(254),
  fullName: z.string().trim().min(3).max(180),
  password: z.string().min(8).max(128),
  roleIds: roleIdsSchema,
});

export const updateManagedUserSchema = z.object({
  active: z.boolean(),
  displayName: z.string().trim().max(120).optional(),
  fullName: z.string().trim().min(3).max(180),
  roleIds: roleIdsSchema,
  userId: z.string().uuid(),
});

export type CreateManagedUserInput = z.infer<typeof createManagedUserSchema>;
export type UpdateManagedUserInput = z.infer<typeof updateManagedUserSchema>;
