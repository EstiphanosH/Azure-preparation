# User Stories & Acceptance Criteria

## Compliance Disclaimer
This specification is an independent engineering tool. It contains zero vendor trademarks, zero proprietary vendor brand marks, and zero real certification test items or proprietary dumps. All scenarios and topologies are synthetic.

---

### Story US-01: Synthetic Scenario Ingestion & State Initialization
- **Persona**: Cloud Architecture Student
- **Narrative**: As a candidate preparing for cloud architecture assessments, I want to load a synthetic diagnostic scenario from a declarative JSON definition so that I can inspect the broken cloud state without connecting to live cloud accounts.
- **MoSCoW**: MUST
- **Mapped Test**: `tests/ac/AC-01.test.ts`
- **Acceptance Criteria**:
  - **AC-01-1**: Given a valid scenario definition `SCN-01` with 4 nodes and 3 edges, When the user selects `SCN-01` from the scenario catalog, Then the state machine initializes with status `LOADED` in ≤ 200 ms and populates the active node repository with exactly 4 nodes.
  - **AC-01-2**: Given an invalid or malformed scenario schema missing required field `topology.nodes`, When the loader executes parsing, Then the system rejects the input with error code `ERR_MALFORMED_TOPOLOGY` within 50 ms and preserves the default empty workspace.

---

### Story US-02: Interactive Topology Graph Inspector
- **Persona**: Diagnostic Candidate
- **Narrative**: As a diagnostic candidate, I want to view an interactive visual graph of the synthetic cloud topology and select individual nodes so that I can review resource configurations, security rules, and network properties.
- **MoSCoW**: MUST
- **Mapped Test**: `tests/ac/AC-02.test.ts`
- **Acceptance Criteria**:
  - **AC-02-1**: Given a rendered topology containing node `alb-public-01`, When the user emits a click event on `alb-public-01`, Then the inspection drawer opens in ≤ 100 ms displaying attribute `listener_port` equal to `8080` and attribute `ingress_security_group` equal to `sg-web-public`.
  - **AC-02-2**: Given 4 topology nodes rendered on the canvas, When the canvas renders initially, Then each node contains a distinct SVG bounding rect and coordinates matching the scenario layout object within ±1 pixel tolerance.

---

### Story US-03: Configuration Patch Application & Immutability
- **Persona**: Cloud Remediation Engineer
- **Narrative**: As a cloud remediation engineer, I want to submit key-value configuration overrides to a selected node so that I can fix security group misconfigurations and routing errors.
- **MoSCoW**: MUST
- **Mapped Test**: `tests/ac/AC-03.test.ts`
- **Acceptance Criteria**:
  - **AC-03-1**: Given node `alb-public-01` with `listener_port: 8080`, When the user dispatches a patch payload `{ listener_port: 443 }`, Then the active state updates `listener_port` to `443` in ≤ 30 ms and records 1 revision entry in the local history array.
  - **AC-03-2**: Given an existing node configuration, When the user dispatches an invalid port value `-1` or `99999`, Then the patch validator rejects the change with validation message `PORT_RANGE_INVALID_1_TO_65535` and leaves node state unchanged.

---

### Story US-04: Deterministic Diagnostic Verification Engine
- **Persona**: Automated Assessment Evaluator
- **Narrative**: As an assessment evaluator, I want an automated rule evaluation engine to execute against the current topology configuration so that misconfigurations are detected with deterministic pass/fail results.
- **MoSCoW**: MUST
- **Mapped Test**: `tests/ac/AC-04.test.ts`
- **Acceptance Criteria**:
  - **AC-04-1**: Given an unpatched `SCN-01` topology state with 3 verification rules, When the diagnostic evaluator runs, Then exactly 2 rules evaluate to `FAILED` and 1 rule evaluates to `PASSED` within ≤ 50 ms total runtime.
  - **AC-04-2**: Given patched node states where `listener_port == 443` and `route_target == nat-gateway-01`, When the diagnostic evaluator runs, Then 3 of 3 rules evaluate to `PASSED` within ≤ 50 ms and the overall topology health flag transitions to `HEALTHY`.

---

### Story US-05: Objective Completion & Score Calculation
- **Persona**: Hackathon Judge
- **Narrative**: As a hackathon judge, I want to see an automated diagnostic score and completion summary so that the candidate's remediation accuracy and time-to-fix can be verified objectively.
- **MoSCoW**: MUST
- **Mapped Test**: `tests/ac/AC-05.test.ts`
- **Acceptance Criteria**:
  - **AC-05-1**: Given a scenario solved with 0 hints used and all 3 verification rules passing, When completion is recorded, Then the calculated score equals `100/100` and the completion state transitions to `RESOLVED` in ≤ 50 ms.
  - **AC-05-2**: Given a scenario where 1 or more verification rules remain in `FAILED` status, When completion check executes, Then the completion status evaluates to `UNRESOLVED` and the submission button remains disabled.

---

### Story US-06: 3-Tier Progressive Hint Ladder
- **Persona**: Learning Candidate
- **Narrative**: As a candidate troubleshooting a difficult configuration defect, I want to request tiered hints so that I can unblock my diagnostic analysis with an explicit 10-point score penalty per hint.
- **MoSCoW**: SHOULD
- **Mapped Test**: `tests/ac/AC-06.test.ts`
- **Acceptance Criteria**:
  - **AC-06-1**: Given an active scenario with hint tier 0 and base score 100, When the user triggers `Request Hint Tier 1`, Then the system reveals hint text for tier 1 in ≤ 20 ms and deducts 10 points from the potential score, setting the maximum obtainable score to 90.
  - **AC-06-2**: Given hint tier 3 is already active, When the user attempts to request an additional hint, Then the hint request control disables and the hint counter remains clamped at 3 with cumulative deduction of 30 points.

---

### Story US-07: Exportable Diagnostic Audit Log
- **Persona**: Technical Proctor
- **Narrative**: As a technical proctor, I want to export a structured JSON audit record of all applied patches and rule execution logs so that candidate actions can be audited offline.
- **MoSCoW**: SHOULD
- **Mapped Test**: `tests/ac/AC-07.test.ts`
- **Acceptance Criteria**:
  - **AC-07-1**: Given a completed scenario session with 2 applied patches, When the proctor clicks `Export Audit Log`, Then a downloadable JSON document containing timestamp, 2 patch records, and final verification outcome is generated within ≤ 100 ms.
  - **AC-07-2**: Given an exported audit log payload, When schema validation executes against the exported string, Then the output contains valid JSON with non-null properties `scenario_id`, `total_elapsed_seconds`, `score`, and `applied_patches`.

---

<a id="traceability"></a>
## Traceability Matrix

Every MUST story maps to at least one downstream programmatic acceptance test contract.

| Story ID | MoSCoW Priority | Feature ID | Downstream Test File | Acceptance Criteria IDs | Pass Verification Target |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **US-01** | MUST | MUST-01 | `tests/ac/AC-01.test.ts` | AC-01-1, AC-01-2 | Scenario loads 4 nodes in ≤ 200 ms; rejects malformed schema in ≤ 50 ms |
| **US-02** | MUST | MUST-02 | `tests/ac/AC-02.test.ts` | AC-02-1, AC-02-2 | Node click reveals drawer in ≤ 100 ms; coordinates render within ±1px |
| **US-03** | MUST | MUST-03 | `tests/ac/AC-03.test.ts` | AC-03-1, AC-03-2 | Value patch applies in ≤ 30 ms; out-of-range port rejected |
| **US-04** | MUST | MUST-04 | `tests/ac/AC-04.test.ts` | AC-04-1, AC-04-2 | Initial state fails 2 rules in ≤ 50 ms; remediated state passes 3 rules in ≤ 50 ms |
| **US-05** | MUST | MUST-05 | `tests/ac/AC-05.test.ts` | AC-05-1, AC-05-2 | 100/100 score awarded for zero hints; completion disabled while rules fail |
| **US-06** | SHOULD | SHOULD-01 | `tests/ac/AC-06.test.ts` | AC-06-1, AC-06-2 | Deducts 10 points per hint in ≤ 20 ms; clamps at tier 3 (-30 points) |
| **US-07** | SHOULD | SHOULD-02 | `tests/ac/AC-07.test.ts` | AC-07-1, AC-07-2 | Audit JSON exported in ≤ 100 ms; contains non-null audit schema properties |
