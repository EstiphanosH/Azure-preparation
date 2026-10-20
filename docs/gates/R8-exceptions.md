# Codebase File-Size Exceptions Document (R8 Gate)

## Architectural Principle
The primary codebase constraint specifies file sizes $\le 200$ Lines of Code (LOC) for single-responsibility modularity. Any file exceeding 200 LOC must be audited and registered with justification.

---

## Approved File-Size Exceptions Register

| File Path | LOC | Category | Architectural Justification |
| :--- | :--- | :--- | :--- |
| `src/components/TopologySandbox.tsx` | 694 | UI Presentation | Interactive 3D/canvas multi-tier architecture diagram and cloud topology visualizer. Contains state, rendering nodes, links, and inspector sidebars. |
| `src/components/ArchitectureSection.tsx` | 600 | UI Presentation | Comprehensive ADR reference documentation tab with interactive decision matrices and trade-off tables. |
| `src/api/endpoints.test.ts` | 597 | Integration Test | Single contiguous suite validating all 10 endpoints end-to-end, including error translation, payload tampering, and p95 latency. |
| `src/components/ApiInspectorSection.tsx` | 460 | UI Presentation | Interactive OpenAPI/REST playground allowing judges and developers to test all endpoints live with arbitrary payloads. |
| `src/components/PrdSection.tsx` | 400 | UI Documentation | In-app Product Requirement Document viewer presenting full FR and NFR specifications. |
| `src/components/DemoPathRunner.tsx` | 366 | UI Automation | Timed demo script runner controlling step-by-step presentation beats with live assertion badges. |
| `src/api/useCases/quizUseCase.ts` | 356 | API Application | High-cohesion application orchestrator managing the 3-step quiz lifecycle (StartSession, RecordAttempt, FinalizeSession) with typed responses. |
| `src/components/StoriesSection.tsx` | 323 | UI Documentation | User story acceptance criteria viewer with automated criteria traceability matrix. |
| `src/App.tsx` | 276 | UI Core | Root application container wiring layout header, banner disclaimer, navigation tabs, and keyboard shortcuts. |
| `src/api/repositories/quizRepository.ts` | 245 | Data Access | In-memory data store including default 5-domain scenario seed questions and atomic transaction emulation. |
| `src/api/router.ts` | 236 | API Dispatcher | HTTP request router mapping 10 endpoints, measuring execution latency, extracting correlation IDs, and sanitizing errors. |
| `src/components/AcceptanceGateRunner.tsx` | 225 | Verification Tool | Interactive UI component executing terminal commands and verifying gates R1–R8 directly in the browser. |
| `src/api/schemas/index.ts` | 214 | Type Contract | Complete typed Zod `.strict()` schema definitions for 10 API request and response boundaries. |
| `tests/e2e/e2eFlow.test.tsx` | 206 | E2E Test | Complete end-to-end user journey test: registration, quiz completion, finalization, reload persistence, and RLS negative isolation. |
| `src/engine/diagnosticEngine.ts` | 205 | Domain Engine | Legacy diagnostic scoring engine kept intact for simulator backward compatibility. |
| `src/api/auth/service.ts` | 202 | Security / Auth | Cryptographic authentication manager maintaining session lifecycles, single-flight token refresh mutex, and blacklist set. |

All other source files in `src/domain/**`, `src/ui/components/**`, `src/ui/hooks/**`, and `src/observability/**` strictly adhere to the $\le 200$ LOC limit.
