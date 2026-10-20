import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Anti-Duplication Architecture Gate (Zero Business Logic in API)', () => {
  const apiDir = path.resolve(__dirname, '../../src/api');

  function getAllFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let files: string[] = [];
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(getAllFiles(fullPath));
      } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) {
        files.push(fullPath);
      }
    }
    return files;
  }

  it('scans all src/api/**/*.ts files to prove zero business logic duplication', () => {
    const apiFiles = getAllFiles(apiDir);
    expect(apiFiles.length).toBeGreaterThan(0);

    const forbiddenPatterns = [
      { pattern: /Math\.pow\(0\.5/, description: 'Readiness decay formula must not be re-implemented in API' },
      { pattern: /halfLifeDays\s*=\s*14/, description: 'Domain half-life default must not be hardcoded in API' },
      { pattern: /totalQuestions\s*<=\s*0/, description: 'Domain scoring validation rules must not be re-implemented in API' },
      { pattern: /rawPercentage\s*=\s*\(correctCount/, description: 'Scoring percentage formula must not be re-implemented in API' },
      { pattern: /clampedScore\s*=/, description: 'Score clamping arithmetic must not be re-implemented in API' },
    ];

    for (const file of apiFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const check of forbiddenPatterns) {
        const matches = check.pattern.test(content);
        expect(
          matches,
          `Forbidden business logic found in ${path.relative(process.cwd(), file)}: ${check.description}`
        ).toBe(false);
      }
    }
  });

  it('verifies that use cases import and delegate directly to domain functions', () => {
    const quizUseCaseContent = fs.readFileSync(path.join(apiDir, 'useCases/quizUseCase.ts'), 'utf-8');
    expect(quizUseCaseContent).toContain("import { scoreSession } from '../../domain/quiz/scoreSession.ts'");
    expect(quizUseCaseContent).toContain("import {\n  startSession,\n  recordAttempt,\n  submitSession,\n  applyScore,\n  resetSession,\n} from '../../domain/quiz/lifecycle.ts'");

    const readinessUseCaseContent = fs.readFileSync(path.join(apiDir, 'useCases/readinessUseCase.ts'), 'utf-8');
    expect(readinessUseCaseContent).toContain("import { computeReadiness, QuestionDomainLookup } from '../../domain/readiness/computeReadiness.ts'");
  });
});
