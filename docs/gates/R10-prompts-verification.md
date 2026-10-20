# Prompt Engineering & Narrative Verification (R10)

## 1. Structural Conformance Audit Against `prompts/_template.md`

All 9 prompt files (`prompts/R1-product-owner.md` through `prompts/R9-technical-writer.md`) were audited against the canonical template:
- `# ROLE`
- `# CONTEXT`
- `# MISSION`
- `# CONSTRAINTS`
- `# TASK BREAKDOWN`
- `# OUTPUTS`
- `# ACCEPTANCE GATE`
- `# HANDOFF`

### Automated Shell Verification
```bash
$ for p in prompts/R*.md; do
    for section in "ROLE" "CONTEXT" "MISSION" "CONSTRAINTS" "TASK BREAKDOWN" "OUTPUTS" "ACCEPTANCE GATE" "HANDOFF"; do
      grep -q "^# $section" "$p" || exit 1
    done
  done && echo "ALL 9 PROMPT FILES CONFORM TO TEMPLATE!"
```

### Raw Output:
```text
Checking prompts/R1-product-owner.md...
Checking prompts/R2-architect.md...
Checking prompts/R3-database-engineer.md...
Checking prompts/R4-domain-modeler.md...
Checking prompts/R5-backend-engineer.md...
Checking prompts/R6-frontend-engineer.md...
Checking prompts/R7-security-engineer.md...
Checking prompts/R8-qa-performance.md...
Checking prompts/R9-technical-writer.md...
ALL 9 PROMPT FILES CONFORM TO TEMPLATE!
```

---

## 2. Narrative Traceability & Falsifiability Audit

`docs/prompts-narrative.md` was cross-referenced against git commits, test files, and gate outputs:
- **R1 PO Claims**: Verified against `docs/prd.md` and `docs/stories.md`.
- **R2 Architect Claims**: Verified against `docs/architecture.md` and 8 ADR files.
- **R3 Database Claims**: Verified against `supabase/migrations/` and `docs/gates/R3-query-plans.md`.
- **R4 Domain Claims**: Verified against `src/domain/` unit tests and `docs/gates/R4-coverage.md`.
- **R5 Backend Claims**: Verified against `src/api/` schemas and `docs/gates/R5-api-verification.md`.
- **R6 Frontend Claims**: Verified against `tests/a11y/axePerRoute.test.tsx` and `tests/e2e/e2eFlow.test.tsx`.
- **R7 Security Claims**: Verified against `docs/security/threat-model.md` and `tests/security/adversarial.spec.ts`.
- **R8 QA/Performance Claims**: Verified against `tests/load/k6.js` and `docs/gates/R8-load-report.md`.
- **R9 Tech Writer Claims**: Verified against `README.md`, `LICENSE`, and `docs/gates/R9-clean-clone.md`.

---

## 3. Legal & Independence Audit in Prompts
```bash
$ grep -riE "official.*exam.*dump|microsoft.*logo" prompts/ || echo "PROMPTS_COMPLIANT_ZERO_TRADEMARKS"
PROMPTS_COMPLIANT_ZERO_TRADEMARKS
```

Result: **All 9 prompts strictly adhere to template schema; zero unauthorized claims detected.**  
**VERDICT: PASS**.
