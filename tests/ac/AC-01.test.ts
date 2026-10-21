/**
 * Downstream Test Contract: AC-01
 * Story: US-01 - Synthetic Scenario Ingestion & State Initialization
 */

import { describe, it, expect } from 'vitest';
import { testAC01_1, testAC01_2 } from '../../src/engine/acceptanceChecks.ts';

export { testAC01_1, testAC01_2 };

describe('AC-01 Tests', () => {
  it('AC-01-1 executes and passes', async () => {
    const res = await testAC01_1();
    expect(res.passed).toBe(true);
  });
  it('AC-01-2 executes and passes', async () => {
    const res = await testAC01_2();
    expect(res.passed).toBe(true);
  });
});
