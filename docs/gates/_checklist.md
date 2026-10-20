# Global Gate Evidence Standard & Verification Checklist

Every quality gate in the 9-role engineering pipeline must strictly satisfy all 5 criteria to achieve verified sign-off status:

1. **Command-Based**:
   Every assertion must specify the exact command line or test invocation used to evaluate the gate. Pure prose claims without an invocation command are invalid.

2. **Raw Output**:
   The complete verbatim stdout/stderr output (or raw machine-readable JSON) must be captured directly from the test runner or profiling tool. Paraphrased summaries without raw logs are rejected.

3. **Reproducible**:
   The evaluation must be deterministic and runnable by an independent third party on a clean clone without requiring hidden, uncommitted, or developer-specific machine state.

4. **Linked**:
   All cited files, ADRs, test suites, and schema definitions must link directly to relative paths within the repository.

5. **Dated & Attributed**:
   Every sign-off must record the ISO timestamp, execution duration, and Git commit hash or revision identifier certifying when the evidence was captured.
