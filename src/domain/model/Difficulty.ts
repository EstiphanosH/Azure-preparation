import { z } from 'zod';

export const DifficultyValues = ['Novice', 'Associate', 'Advanced'] as const;
export type Difficulty = (typeof DifficultyValues)[number];

export const DifficultySchema = z.enum(DifficultyValues);

export function isDifficulty(val: unknown): val is Difficulty {
  return DifficultySchema.safeParse(val).success;
}
