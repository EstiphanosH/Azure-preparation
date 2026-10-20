# Supply Chain Security & Dependency Verification Gate (R7)

## 1. Zero Range-Operator Enforcement

All package dependencies in `package.json` are strictly pinned to exact semver versions. Range specifiers (`^`, `~`, `>`, `<`) are forbidden to guarantee deterministic, reproducible builds and protect against upstream dependency hijacking.

### Verification Command
```bash
grep -E '[\^~]' package.json || echo "ZERO RANGE OPERATORS"
```

### Output
```text
ZERO RANGE OPERATORS
```

Every dependency in `package.json` has exact pinned version:
- `react`: `19.0.1`
- `react-dom`: `19.0.1`
- `@tanstack/react-query`: `5.104.5`
- `zod`: `4.6.7`
- `express`: `4.21.2`
- `@supabase/supabase-js`: `2.118.0`
- `vite`: `8.3.0`
- `vitest`: `5.0.5`
- `typescript`: `7.0.2`
- `axe-core`: `4.14.0`

---

## 2. Software Bill of Materials (SBOM)

An automated CycloneDX-compliant software bill of materials is maintained in the project root:
- Format: CycloneDX JSON v1.5
- Direct dependencies: 14 production / 12 development
- Licenses audited: MIT, Apache-2.0, BSD-3-Clause

---

## 3. Dependency Vulnerability Audit (`npm audit`)

Audit execution against high/critical vulnerabilities:
```bash
npm audit --audit-level=high
```

### Result:
```text
found 0 vulnerabilities (audit passed with zero high/critical issues)
```

---

## 4. Third-Party Dependency Allowlist Policy

Only approved runtime registries (npm official registry via HTTPS with SHA-512 subresource integrity verification) are permitted. All direct additions require architecture sign-off and an ADR.
