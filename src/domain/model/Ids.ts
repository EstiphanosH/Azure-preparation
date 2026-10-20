import { z } from 'zod';

declare const brand: unique symbol;

export type Brand<T, B extends string> = T & { readonly [brand]: B };

export type UserId = Brand<string, 'UserId'>;
export type QuestionId = Brand<string, 'QuestionId'>;
export type DomainId = Brand<string, 'DomainId'>;
export type SessionId = Brand<string, 'SessionId'>;
export type AttemptId = Brand<string, 'AttemptId'>;

export const UserIdSchema = z
  .string()
  .min(3, 'UserId must be at least 3 characters')
  .transform((val) => val as UserId);

export const QuestionIdSchema = z
  .string()
  .min(3, 'QuestionId must be at least 3 characters')
  .transform((val) => val as QuestionId);

export const DomainIdSchema = z
  .string()
  .min(3, 'DomainId must be at least 3 characters')
  .transform((val) => val as DomainId);

export const SessionIdSchema = z
  .string()
  .min(3, 'SessionId must be at least 3 characters')
  .transform((val) => val as SessionId);

export const AttemptIdSchema = z
  .string()
  .min(3, 'AttemptId must be at least 3 characters')
  .transform((val) => val as AttemptId);

export function makeUserId(raw: string): UserId {
  return UserIdSchema.parse(raw);
}

export function makeQuestionId(raw: string): QuestionId {
  return QuestionIdSchema.parse(raw);
}

export function makeDomainId(raw: string): DomainId {
  return DomainIdSchema.parse(raw);
}

export function makeSessionId(raw: string): SessionId {
  return SessionIdSchema.parse(raw);
}

export function makeAttemptId(raw: string): AttemptId {
  return AttemptIdSchema.parse(raw);
}
