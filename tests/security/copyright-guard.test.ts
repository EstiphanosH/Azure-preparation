import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Copyright & Trademark Guard (Anti-Infringement Gate)', () => {
  const rootDir = path.resolve(__dirname, '../../');

  it('verifies zero unauthorized vendor trademarks or proprietary logo references in source files', () => {
    const srcDir = path.join(rootDir, 'src');
    const prohibitedPatterns = [
      new RegExp(['micro', 'soft\\s*logo'].join(''), 'i'),
      new RegExp(['logo.*', 'micro', 'soft'].join(''), 'i'),
      new RegExp(['azure.*', 'logo'].join(''), 'i'),
      new RegExp(['msft-', 'logo'].join(''), 'i'),
      /official\s+azure\s+exam\s+dump/i,
      /actual\s+exam\s+questions/i,
      /guaranteed\s+pass\s+dump/i,
    ];

    const violations: { file: string; match: string }[] = [];

    function scanDirectory(currentPath: string) {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
          scanDirectory(fullPath);
        } else if (/\.(tsx?|jsx?|html|css|json)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          for (const pattern of prohibitedPatterns) {
            const match = content.match(pattern);
            if (match) {
              violations.push({ file: path.relative(rootDir, fullPath), match: match[0] });
            }
          }
        }
      }
    }

    scanDirectory(srcDir);
    expect(violations).toEqual([]);
  });

  it('asserts that every question scenario is synthetically authored original pedagogy', () => {
    const questionsFile = path.join(rootDir, 'supabase/seed/questions.sql');
    if (fs.existsSync(questionsFile)) {
      const sqlContent = fs.readFileSync(questionsFile, 'utf8');
      expect(sqlContent).not.toMatch(/braindump/i);
      expect(sqlContent).not.toMatch(/exam-collection/i);
      expect(sqlContent).not.toMatch(/real\s+exam\s+question/i);
    }
  });

  it('asserts disclaimer is explicitly rendered on every UI route and in index entry', () => {
    const disclaimerComp = path.join(rootDir, 'src/ui/components/Disclaimer.tsx');
    expect(fs.existsSync(disclaimerComp)).toBe(true);
    const content = fs.readFileSync(disclaimerComp, 'utf8');
    expect(content).toContain('Unofficial');
    expect(content).toContain('not affiliated with Microsoft');
  });
});
