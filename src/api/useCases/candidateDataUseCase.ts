import { z } from 'zod';
import {
  ExportDataQuerySchema,
  ExportDataResponseSchema,
  DeleteAccountInputSchema,
  DeleteAccountResponseSchema,
} from '../schemas/index.ts';
import { ApiError } from '../errors.ts';
import { IQuizRepository, quizRepository } from '../repositories/quizRepository.ts';
import { makeUserId } from '../../domain/model/Ids.ts';

export class CandidateDataUseCase {
  constructor(private repo: IQuizRepository = quizRepository) {}

  public async exportData(
    rawQuery: unknown,
    userIdStr: string
  ): Promise<{ ok: true; data: z.infer<typeof ExportDataResponseSchema> } | { ok: false; error: ApiError }> {
    const parsed = ExportDataQuerySchema.safeParse(rawQuery ?? {});
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          kind: 'ValidationError',
          statusCode: 400,
          message: 'Invalid export query parameters.',
          issues: parsed.error.issues.map((i) => i.message),
        },
      };
    }

    const userId = makeUserId(userIdStr);
    const exportResult = await this.repo.exportUserData(userId, parsed.data.includeAttempts);

    const response = ExportDataResponseSchema.parse(exportResult);
    return { ok: true, data: response };
  }

  public async deleteAccount(
    rawInput: unknown,
    userIdStr: string
  ): Promise<{ ok: true; data: z.infer<typeof DeleteAccountResponseSchema> } | { ok: false; error: ApiError }> {
    const parsed = DeleteAccountInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          kind: 'ValidationError',
          statusCode: 400,
          message: 'Invalid account deletion confirmation payload.',
          issues: parsed.error.issues.map((i) => i.message),
        },
      };
    }

    const userId = makeUserId(userIdStr);
    const deleteResult = await this.repo.deleteUserCascade(userId);

    const response = DeleteAccountResponseSchema.parse(deleteResult);
    return { ok: true, data: response };
  }
}

export const candidateDataUseCase = new CandidateDataUseCase();
