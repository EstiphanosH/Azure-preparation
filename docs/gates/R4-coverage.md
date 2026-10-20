# Vitest Coverage Report (R4 Domain Gate)

## Gate Criteria
- Statement Coverage in `src/domain/**`: **≥ 80%**
- Branch Coverage in `src/domain/**`: **≥ 80%**
- Function Coverage in `src/domain/**`: **100%**
- Status: **PASSED (ALL THRESHOLDS EXCEEDED)**

---

## Verifiable Coverage Report Output (vitest --coverage)

```
 % Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s 
-------------------|---------|----------|---------|---------|-------------------
All files          |   95.85 |    87.23 |     100 |   98.12 |                   
 domain/model      |     100 |      100 |     100 |     100 |                   
  Ids.ts           |     100 |      100 |     100 |     100 |                   
 domain/quiz       |   97.05 |    92.59 |     100 |   97.05 |                   
  lifecycle.ts     |   94.11 |    94.11 |     100 |   94.11 | 166               
  scoreSession.ts  |     100 |       90 |     100 |     100 | 61                
 domain/readiness  |   95.23 |       85 |     100 |     100 |                   
  ...eReadiness.ts |   95.23 |       85 |     100 |     100 | 86-89,128         
 engine            |   94.87 |     85.1 |     100 |   97.22 |                   
  ...sticEngine.ts |   96.77 |    89.18 |     100 |   96.55 | 83,101             
  scenarioData.ts  |    87.5 |       70 |     100 |     100 | 105,124,146      
-------------------|---------|----------|---------|---------|-------------------

Test Files  10 passed (10)
     Tests  37 passed (37)
  Duration  3.96s
```

## Attestation
All statement and branch coverage metrics within `src/domain/**` strictly surpass the 80% gate threshold, achieving **94.1% - 100% statement coverage** and **85% - 100% branch coverage**.
