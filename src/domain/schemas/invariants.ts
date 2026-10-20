import { z } from 'zod';

export const ScoreInvariantSchema = z
  .number()
  .min(0, 'Score cannot be negative')
  .max(100, 'Score cannot exceed 100');

export const PortNumberInvariantSchema = z
  .number()
  .int('Port must be an integer')
  .min(1, 'Port must be at least 1')
  .max(65535, 'Port cannot exceed 65535');

export const PercentageInvariantSchema = z
  .number()
  .min(0, 'Percentage cannot be negative')
  .max(100, 'Percentage cannot exceed 100');

export const MillisecondsInvariantSchema = z
  .number()
  .int('Milliseconds must be integer')
  .nonnegative('Milliseconds cannot be negative');

export const OptionIndexInvariantSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export function validatePortNumber(port: unknown): { ok: true; value: number } | { ok: false; error: string } {
  const res = PortNumberInvariantSchema.safeParse(port);
  if (!res.success) {
    return { ok: false, error: 'PORT_RANGE_INVALID_1_TO_65535' };
  }
  return { ok: true, value: res.data };
}

export function validateScore(score: unknown): { ok: true; value: number } | { ok: false; error: string } {
  const res = ScoreInvariantSchema.safeParse(score);
  if (!res.success) {
    return { ok: false, error: 'SCORE_OUT_OF_BOUNDS_0_TO_100' };
  }
  return { ok: true, value: res.data };
}
