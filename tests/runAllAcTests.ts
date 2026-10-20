import { testAC01_1, testAC01_2 } from './ac/AC-01.test.ts';
import { testAC02_1, testAC02_2 } from './ac/AC-02.test.ts';
import { testAC03_1, testAC03_2 } from './ac/AC-03.test.ts';
import { testAC04_1, testAC04_2 } from './ac/AC-04.test.ts';
import { testAC05_1, testAC05_2 } from './ac/AC-05.test.ts';
import { testAC06_1, testAC06_2 } from './ac/AC-06.test.ts';
import { testAC07_1, testAC07_2 } from './ac/AC-07.test.ts';

export async function runAllTests() {
  console.log('===========================================================');
  console.log('   RUNNING DOWNSTREAM ACCEPTANCE TEST SUITE (AC-01..07)   ');
  console.log('===========================================================');

  const tests = [
    { id: 'AC-01-1', fn: testAC01_1 },
    { id: 'AC-01-2', fn: testAC01_2 },
    { id: 'AC-02-1', fn: testAC02_1 },
    { id: 'AC-02-2', fn: testAC02_2 },
    { id: 'AC-03-1', fn: testAC03_1 },
    { id: 'AC-03-2', fn: testAC03_2 },
    { id: 'AC-04-1', fn: testAC04_1 },
    { id: 'AC-04-2', fn: testAC04_2 },
    { id: 'AC-05-1', fn: testAC05_1 },
    { id: 'AC-05-2', fn: testAC05_2 },
    { id: 'AC-06-1', fn: testAC06_1 },
    { id: 'AC-06-2', fn: testAC06_2 },
    { id: 'AC-07-1', fn: testAC07_1 },
    { id: 'AC-07-2', fn: testAC07_2 },
  ];

  let passedTotal = 0;
  const results = [];

  for (const test of tests) {
    const res = await test.fn();
    results.push({ id: test.id, ...res });
    if (res.passed) {
      passedTotal++;
      console.log(`[PASS] ${res.message}`);
    } else {
      console.error(`[FAIL] ${res.message}`);
    }
  }

  console.log('-----------------------------------------------------------');
  console.log(`SUMMARY: ${passedTotal}/${tests.length} tests passed.`);
  console.log('===========================================================');

  if (passedTotal !== tests.length) {
    throw new Error(`Acceptance gate failed: ${tests.length - passedTotal} tests failed.`);
  }

  return { passedTotal, total: tests.length, results };
}

// Run immediately if executed directly via CLI
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('runAllAcTests')) {
  runAllTests().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
