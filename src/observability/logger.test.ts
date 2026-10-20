import { describe, it, expect } from 'vitest';
import { StructuredLogger } from './logger.ts';

describe('StructuredLogger Redaction Standards', () => {
  it('strictly redacts emails, tokens, and candidate answers from emitted log JSON', () => {
    const emittedLogs: string[] = [];
    const testLogger = new StructuredLogger((line) => emittedLogs.push(line));

    const rawEmail = 'sensitive_candidate_42@secret-domain.edu';
    const rawToken = 'tok-access-secret998877665544';
    const rawAnswer = 'selected_index_option_3_correct';

    testLogger.info(
      `Candidate logged in with email ${rawEmail} and token ${rawToken}`,
      'corr-test-123',
      {
        email: rawEmail,
        token: rawToken,
        selectedIndex: 3,
        userAnswer: rawAnswer,
        safeMetadata: 'Diagnostic session started',
      }
    );

    expect(emittedLogs).toHaveLength(1);
    const logOutput = emittedLogs[0] ?? '';

    // Verify unredacted strings are NEVER present
    expect(logOutput).not.toContain(rawEmail);
    expect(logOutput).not.toContain(rawToken);
    expect(logOutput).not.toContain(rawAnswer);

    // Verify redaction markers are present
    expect(logOutput).toContain('[REDACTED_EMAIL]');
    expect(logOutput).toContain('[REDACTED_TOKEN]');
    expect(logOutput).toContain('[REDACTED_SENSITIVE]');
    expect(logOutput).toContain('Diagnostic session started');
  });
});
