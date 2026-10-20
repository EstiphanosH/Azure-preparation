# Domain Coverage Verification Report (R8)

## 1. Domain Coverage Gate Requirement
- **Statement Coverage Threshold**: $\ge 80.0\%$
- **Branch Coverage Threshold**: $\ge 80.0\%$
- **Function Coverage Threshold**: $\ge 80.0\%$

---

## 2. Vitest V8 Coverage Report Output

```bash
$ npx vitest run --coverage src/domain
```

```text
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   96.70 |    89.36 |  100.00 |   98.86 |                   
 model             |  100.00 |   100.00 |  100.00 |  100.00 |                   
  Ids.ts           |  100.00 |   100.00 |  100.00 |  100.00 |                   
 quiz              |   97.05 |    92.59 |  100.00 |   97.05 |                   
  lifecycle.ts     |   94.11 |    94.11 |  100.00 |   94.11 | 166               
  scoreSession.ts  |  100.00 |    90.00 |  100.00 |  100.00 | 61                
 readiness         |   95.23 |    85.00 |  100.00 |  100.00 |                   
  computeReadiness |   95.23 |    85.00 |  100.00 |  100.00 | 86-89,128         
-------------------|---------|----------|---------|---------|-------------------
Test Files  3 passed (3)
Tests       23 passed (23)
```

## 3. Compliance Determination
- Statements: **96.70%** ($\ge 80\%$) ➔ **PASS**
- Branch: **89.36%** ($\ge 80\%$) ➔ **PASS**
- Functions: **100.00%** ($\ge 80\%$) ➔ **PASS**
- Lines: **98.86%** ($\ge 80\%$) ➔ **PASS**
