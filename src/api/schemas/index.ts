import { z } from 'zod';

// =========================================================================
// AUTH SCHEMAS (Strict Boundaries)
// =========================================================================

export const PasswordPolicySchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one digit')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special symbol');

export const RegisterRequestSchema = z
  .object({
    email: z.string().trim().email('Invalid email address format'),
    password: PasswordPolicySchema,
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(30, 'Username cannot exceed 30 characters')
      .transform((val) => val.replace(/\s+/g, '_'))
      .refine((val) => /^[a-zA-Z0-9_-]+$/.test(val), {
        message: 'Username must be alphanumeric (letters, numbers, underscores, or hyphens)',
      }),
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  })
  .strict();

export const LoginRequestSchema = z
  .object({
    email: z.string().trim().email('Invalid email address format'),
    password: z.string().min(1, 'Password is required'),
  })
  .strict();

export const RefreshRequestSchema = z
  .object({
    refreshToken: z.string().min(10, 'Refresh token required'),
  })
  .strict();

export const LogoutRequestSchema = z
  .object({
    refreshToken: z.string().min(10),
  })
  .strict();

// =========================================================================
// QUIZ & ATTEMPT SCHEMAS (Strict Boundaries)
// =========================================================================

export const StartSessionInputSchema = z
  .object({
    domainId: z.string().min(3).max(32).nullable().optional(),
    totalQuestions: z.number().int().min(1).max(50).default(10),
  })
  .strict();

export const SubmitAttemptInputSchema = z
  .object({
    sessionId: z.string().min(3),
    questionId: z.string().min(3),
    selectedIndex: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
    timeTakenMs: z.number().int().min(0).max(600000), // Max 10 minutes per question
  })
  .strict();

export const FinalizeSessionInputSchema = z
  .object({
    sessionId: z.string().min(3),
  })
  .strict();

// =========================================================================
// READINESS & EXPORT SCHEMAS (Strict Boundaries)
// =========================================================================

export const GetReadinessQuerySchema = z
  .object({
    halfLifeDays: z.number().positive().max(90).optional(),
  })
  .strict();

export const ExportDataQuerySchema = z
  .object({
    includeAttempts: z.boolean().default(true),
  })
  .strict();

export const DeleteAccountInputSchema = z
  .object({
    confirmation: z.literal('DELETE_MY_ACCOUNT_PERMANENTLY'),
  })
  .strict();

// Output Response Validation Schemas
export const AuthSessionResponseSchema = z
  .object({
    accessToken: z.string().min(1),
    refreshToken: z.string().min(1),
    expiresIn: z.number().positive(),
    user: z
      .object({
        id: z.string().min(1),
        email: z.string().email(),
        username: z.string().min(1),
      })
      .strict(),
  })
  .strict();

export const QuizSessionResponseSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    domainId: z.string().nullable(),
    status: z.string(),
    score: z.number(),
    totalQuestions: z.number(),
    startedAt: z.string(),
  })
  .strict();

export const AttemptResponseSchema = z
  .object({
    id: z.string(),
    sessionId: z.string(),
    questionId: z.string(),
    selectedIndex: z.number(),
    isCorrect: z.boolean(),
    timeTakenMs: z.number(),
  })
  .strict();

export const FinalizeSessionResponseSchema = z
  .object({
    sessionId: z.string(),
    userId: z.string(),
    status: z.literal('RESOLVED'),
    score: z.number().min(0).max(100),
    correctCount: z.number().int().nonnegative(),
    totalQuestions: z.number().int().positive(),
    percentage: z.number().min(0).max(100),
    completedAt: z.string(),
  })
  .strict();

export const ReadinessScoreResponseSchema = z
  .object({
    userId: z.string(),
    overallScore: z.number().min(0).max(100),
    evaluationGrade: z.enum(['READY', 'REVIEW_REQUIRED', 'NOT_READY']),
    domainBreakdown: z.array(
      z
        .object({
          domainId: z.string(),
          domainTitle: z.string(),
          weightPct: z.number(),
          accuracyPct: z.number(),
          weightedScore: z.number(),
          attemptsCount: z.number(),
        })
        .strict()
    ),
    totalAttemptsEvaluated: z.number().int().nonnegative(),
    calculatedAt: z.string(),
  })
  .strict();

export const ExportDataResponseSchema = z
  .object({
    candidate: z
      .object({
        userId: z.string(),
        email: z.string().email(),
        username: z.string(),
      })
      .strict(),
    sessionsCount: z.number().int().nonnegative(),
    attemptsCount: z.number().int().nonnegative(),
    exportedAt: z.string(),
    sessions: z.array(
      z
        .object({
          sessionId: z.string(),
          domainId: z.string().nullable(),
          status: z.string(),
          score: z.number(),
        })
        .strict()
    ),
    attempts: z.array(
      z
        .object({
          attemptId: z.string(),
          sessionId: z.string(),
          questionId: z.string(),
          selectedIndex: z.number(),
          isCorrect: z.boolean(),
          timeTakenMs: z.number(),
        })
        .strict()
    ),
  })
  .strict();

export const DeleteAccountResponseSchema = z
  .object({
    deleted: z.literal(true),
    count: z.number().int().nonnegative(),
  })
  .strict();

export const LogoutResponseSchema = z
  .object({
    success: z.literal(true),
  })
  .strict();

