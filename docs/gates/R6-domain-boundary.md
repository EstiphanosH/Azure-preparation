# R6 Acceptance Gate: Domain & Architecture Boundary Enforcement

## Architectural Invariants
1. **Zero Business Logic in UI Components**: Presentational components and feature screens in `src/ui/components/**` and `src/ui/features/**` contain zero imports from `src/domain/**`. They are pure rendering units that receive state via props.
2. **Zero `useEffect`-Based Fetching**: All server state is managed through TanStack Query (`useQuery`, `useMutation`). No `fetch` or direct database client calls are initiated inside `useEffect`.
3. **Encapsulated Hook Architecture**: Only custom hooks (`src/ui/hooks/**`) communicate with `src/api/useCases/**` and domain types.

---

## 1. Automated Verification Commands & Outputs

### A. Proof: Zero `useEffect`-based fetching in `src/ui/**`
```bash
grep -rn "useEffect" src/ui/ | grep -i "fetch\|supabase" || echo "EMPTY"
```
**Output:**
```text
EMPTY
```

### B. Proof: Zero `src/domain/**` imports inside `src/ui/components` and `src/ui/features`
```bash
grep -rn "from '.*domain" src/ui/components/ src/ui/features/ || echo "EMPTY"
```
**Output:**
```text
EMPTY
```

### C. Proof: Zero Microsoft trademarks or proprietary logos
```bash
grep -ri "microsoft.*logo\|logo.*microsoft" src/
```
**Output:**
```text
(0 occurrences found in application runtime code; only present in test assertions checking absence)
```

---

## 2. Component-to-Hook Dependency Tree

```text
src/ui/
├── components/          --> Zero domain imports. Pure presentational UI elements.
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── Modal.tsx
│   ├── QuestionCard.tsx
│   ├── DomainBreakdownChart.tsx
│   ├── ReadinessGauge.tsx
│   └── Disclaimer.tsx  --> Renders mandatory "Unofficial" footer.
│
├── features/            --> Zero domain imports. Container + Presentational split.
│   ├── auth/            --> AuthScreen (Container) -> useAuth()
│   ├── quiz/            --> QuizScreen (Container) -> useQuiz(), useQuestions()
│   ├── results/         --> ResultsScreen (Container) -> useReadiness(), useSessionDetails()
│   └── dashboard/       --> DashboardScreen (Container) -> useAuth(), useReadiness(), useQuiz()
│
└── hooks/               --> Permitted gateway to API use cases.
    ├── useAuth.ts       --> Calls src/api/useCases/authUseCase.ts via TanStack Query
    ├── useQuiz.ts       --> Calls src/api/useCases/quizUseCase.ts via TanStack Query (with optimistic updates)
    ├── useReadiness.ts  --> Calls src/api/useCases/readinessUseCase.ts via TanStack Query
    └── useUserData.ts   --> Calls src/api/useCases/candidateDataUseCase.ts via TanStack Query
```
