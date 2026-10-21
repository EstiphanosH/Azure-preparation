import { runAllTests as executeAllChecks } from '../src/engine/acceptanceChecks.ts';

export async function runAllTests() {
  console.log('===========================================================');
  console.log('   RUNNING DOWNSTREAM ACCEPTANCE TEST SUITE (AC-01..07)   ');
  console.log('===========================================================');

  const { passedTotal, total, results } = await executeAllChecks();

  for (const res of results) {
    if (res.passed) {
      console.log(`[PASS] ${res.message}`);
    } else {
      console.error(`[FAIL] ${res.message}`);
    }
  }

  console.log('-----------------------------------------------------------');
  console.log(`SUMMARY: ${passedTotal}/${total} tests passed.`);
  console.log('===========================================================');

  if (passedTotal !== total) {
    throw new Error(`Acceptance gate failed: ${total - passedTotal} tests failed.`);
  }

  return { passedTotal, total, results };
}

// Run immediately if executed directly via CLI
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('runAllAcTests')) {
  runAllTests().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
