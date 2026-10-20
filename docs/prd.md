# Product Requirements Document: CloudFix Unofficial Sandbox

## Disclaimer
This project is an independent educational tool. It is unofficial, unaffiliated with any cloud certification vendor, and contains zero vendor trademarks, zero proprietary vendor brand marks, and zero real certification test items or proprietary dumps. All scenarios are synthetic diagnostic simulations.

---

<a id="challenge-selection"></a>
## Challenge Selection

### Decision Matrix
Scored on a scale of 1 to 5 points. Every score includes a verifiable one-sentence rationale.

| Challenge Candidate | Learning Value (25%) | Feasibility (25%) | Demo Impact (20%) | Extensibility (15%) | Originality (15%) | Total Weighted Score | Decision Outcome & Trade-Off |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Interactive Architecture Sandbox & Misconfiguration Debugger** | **5** - Candidates solve synthetic broken infrastructure topologies by inspecting configuration parameters directly. | **5** - Deterministic JSON topology state machine runs in-browser without external cloud account dependencies. | **5** - Live side-by-side visualization shows immediate visual topology recovery when misconfigurations are corrected. | **4** - Additional scenarios require only new declarative JSON schema entries without code modifications. | **4** - Replaces rote flashcards with interactive state inspection that mirrors production root-cause analysis. | **4.70** | **WINNER**: We chose Interactive Architecture Sandbox & Misconfiguration Debugger because it proves diagnostic competency via synthetic state inspection rather than passive memorization; we lose the broader passive audience of flashcard generation. |
| **2. Voice Oral Examiner** | **3** - Audio interaction tests conversational recall but cannot evaluate visual topology relationships. | **2** - Audio stream parsing and transcription introduce latency exceeding 4000 ms and speech recognition errors. | **4** - Voice conversation sounds engaging during presentations but introduces high audio feedback risk in noisy rooms. | **3** - Extending evaluation rubrics requires custom linguistic prompting for each syllabus objective. | **4** - Spoken evaluation is rare in technical certification preparation tools. | **3.05** | **REJECTED**: Speech recognition latency over 4000 ms and room acoustic noise introduce non-deterministic grading failures. |
| **3. Diagram Whiteboard Vision Evaluator** | **4** - Freehand diagramming tests architectural design memory and component placement. | **2** - Freehand strokes produce ambiguous bounding boxes that fail deterministic optical parsing tests. | **4** - Canvas diagramming looks visually appealing on projector displays during presentations. | **3** - Supporting new cloud components requires updating computer vision stroke-classification datasets. | **4** - Freehand drawing grading is unique among automated assessment utilities. | **3.30** | **REJECTED**: Canvas geometry variations and image recognition errors prevent reproducible pass-or-fail grading verification within the hackathon time limit. |
| **4. Multiplayer Exam Lobby** | **2** - Competitive speed quiz rooms prioritize response velocity over structural debugging skill. | **2** - Distributed room synchronization requires stateful WebSocket infrastructure and distributed session locks. | **3** - Multi-user leaderboards demonstrate real-time data streaming across concurrent browser windows. | **3** - Additional game modes require persistent database migrations and custom socket event handlers. | **3** - Live multiplayer buzzer rooms replicate common trivia game formats. | **2.50** | **REJECTED**: Distributed synchronization and session negotiation introduce networking failure points without improving diagnostic assessment rigor. |
| **5. Syllabus Flashcard Ingestion Engine** | **2** - Spaced-repetition flashcards evaluate factual term retention instead of operational system debugging. | **5** - Ingesting markdown documents into key-value cards executes in sub-100 ms client-side runtime. | **2** - Flipping digital cards on screen offers low visual demonstration impact to a judging panel. | **4** - Adding card decks requires only uploading structured markdown or CSV documents. | **1** - Basic flashcard applications are standard homework projects with minimal novel engineering value. | **2.85** | **REJECTED**: Passive memorization produces low learning value and fails to test applied cloud problem-solving capability. |

---

<a id="mvp-cut"></a>
## MVP Cut

### MUST (Mandatory for Demonstration)
Every MUST feature maps directly to one or more user stories and automated verification tests.

| Feature ID | Feature Name | Mapped Story IDs | Engineering & Pedagogical Rationale |
| :--- | :--- | :--- | :--- |
| **MUST-01** | Synthetic Scenario Loader | US-01 | Loads declarative JSON topologies without network calls, eliminating external cloud dependency risks during judging. |
| **MUST-02** | Interactive Topology Graph Inspector | US-02 | Renders nodes, subnet boundaries, and link states in a 2D canvas with node inspection drawer showing configuration attributes. |
| **MUST-03** | Configuration Patch Editor | US-03 | Enables direct remediation of invalid security groups, ports, and route parameters with typed inputs. |
| **MUST-04** | Deterministic Diagnostic Verification Engine | US-04 | Runs rule-based validation against current topology state in ≤ 50 ms and produces structured failure diagnostics. |
| **MUST-05** | Diagnostic Scoring & Objective Completion Report | US-05 | Computes completion score (0-100), execution duration in seconds, and objective validation badges upon successful patch application. |

### SHOULD (Planned Subsequent Iteration)
| Feature ID | Feature Name | Mapped Story IDs | Engineering & Pedagogical Rationale |
| :--- | :--- | :--- | :--- |
| **SHOULD-01** | Hint Ladder System | US-06 | Provides progressive 3-tier clues with incremental 10-point score penalties to prevent user blockage. |
| **SHOULD-02** | Exportable Diagnostic Audit Log | US-07 | Generates downloadable JSON session audit record containing applied patches, timestamps, and final test matrix. |

### WON'T (Explicitly Cut Scope and Disqualified Challenges)
All 4 unchosen challenges and non-essential enhancements are explicitly rejected for MVP:

| Disqualified Scope Item | Category | Explicit Rejection Rationale |
| :--- | :--- | :--- |
| **Voice Oral Examiner** | Unchosen Challenge 2 | High inference latency exceeding 4000 ms breaks the 3-minute demo constraint and introduces non-deterministic speech recognition grading failures. |
| **Diagram Whiteboard Vision Evaluator** | Unchosen Challenge 3 | Canvas geometry edge-cases and vision model hallucination risk deterministic pass-or-fail grading within hackathon time limits. |
| **Multiplayer Exam Lobby** | Unchosen Challenge 4 | Distributed synchronization and room coordination introduce operational networking complexity without improving core diagnostic assessment rigor. |
| **Syllabus Flashcard Ingestion Engine** | Unchosen Challenge 5 | Passive rote memorization produces low learning value and fails to test applied cloud problem-solving capability. |
| **Real Cloud Provider Provisioning** | Out of Scope | Spin-up times of 180 to 600 seconds per cloud resource violate the 3-minute demonstration time budget and require live credit card credentials. |
| **User Authentication & Cloud Database** | Out of Scope | Local state persistence via browser memory eliminates login delays, third-party auth outages, and database cold starts during presentation. |
| **Proprietary Vendor Logos & Real Exam Dumps** | Policy Rejection | Strictly prohibited by hackathon guidelines; all topology configurations and objective descriptions are synthetic. |

---

<a id="demo-path"></a>
## Demo Path

The following numbered sequence defines the exact 12-step path executed during evaluation.
**Read-aloud Word Count**: 164 words.
**Read-aloud Duration**: 76 seconds at standard 130 words-per-minute presentation cadence.
**Interactive UI Action Duration**: 54 seconds.
**Total End-to-End Elapsed Time**: 130 seconds (2 minutes 10 seconds), well within the ≤ 180 seconds (3:00) limit.

1. **Step 1 [00:00 - 00:10]**: Open application root URL `http://localhost:3000/`. Confirm that the scenario list loads in ≤ 200 ms showing Scenario `SCN-01: Broken Private Ingress Route`.
2. **Step 2 [00:10 - 00:20]**: Click scenario `SCN-01`. Confirm topology canvas renders 4 nodes (Internet Gateway, Public Load Balancer, Private App Subnet, Database Cluster) and 3 interconnecting edges within 100 ms.
3. **Step 3 [00:20 - 00:30]**: Observe the automated diagnostic banner displaying status `FAILED: 2 of 3 verification rules failing`.
4. **Step 4 [00:30 - 00:40]**: Click node `Public Load Balancer`. Confirm inspection drawer opens displaying listener port configuration set to `8080` instead of target port `443`.
5. **Step 5 [00:40 - 00:50]**: Click rule failure item `RULE-ERR-01: Ingress security group blocks port 443`. Notice node highlight pulses red on `Public Load Balancer`.
6. **Step 6 [00:50 - 01:05]**: In the configuration patch panel, select property `security_group.ingress_port`, change value from `8080` to `443`, and click `Apply Patch`.
7. **Step 7 [01:05 - 01:15]**: Observe validation re-run in ≤ 50 ms: status updates to `FAILED: 1 of 3 verification rules failing` (50% diagnostic progress).
8. **Step 8 [01:15 - 01:30]**: Click node `Private App Subnet`. Inspect routing table and locate route target misconfigured as `0.0.0.0/0 -> blackhole`.
9. **Step 9 [01:30 - 01:45]**: Change route target from `blackhole` to `nat-gateway-01` in the patch panel and click `Apply Patch`.
10. **Step 10 [01:45 - 01:55]**: Verification engine triggers automatically: all 3 rules evaluate to `PASSED` in ≤ 40 ms. Topology edges shift from dashed red to solid emerald green.
11. **Step 11 [01:55 - 02:05]**: Objective completion modal pops up displaying: Final Score `100/100`, Total Elapsed Time `115s`, and Zero Invalidation Flags.
12. **Step 12 [02:05 - 02:10]**: Click `Verify Test Contract Suite` button to demonstrate all 14 programmatic acceptance tests passing green in real-time.

---

<a id="risks"></a>
## Risks

| Risk ID | Risk Description | Likelihood | Impact | Mitigation Strategy | Quantitative Trigger to Cut Scope |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | Canvas rendering stutter or coordinate overflow on low-DPI displays. | Low | High | Use SVG-based deterministic grid layout with preset node coordinates instead of heavy physics engines. | If frame rate drops below 55 FPS during node drag on reference browser, lock node positions to static coordinates. |
| **RSK-02** | Rule validation execution time exceeds UI budget. | Low | High | Precompile verification rules to synchronous pure JavaScript predicates executing over an in-memory JSON state tree. | If diagnostic evaluation duration exceeds 100 ms on test fixture, disable asynchronous worker dispatch and evaluate synchronously on main thread. |
| **RSK-03** | User gets stuck on topology patch values during the live 3-minute presentation. | Med | High | Embed 1-click `Apply Reference Patch` debug button accessible via developer shortcut `Ctrl+Shift+D`. | If judge interaction pauses without an edit for > 45 seconds, reveal recommended patch prompt banner. |
| **RSK-04** | Accidental reference to copyrighted vendor certifications or test trademarks. | Low | High | Automated CI grep check verifying zero instances of trademarked certification codes or proprietary vendor test items. | If any vendor trademark or certification test identifier is discovered in fixtures, immediately replace scenario text with synthetic generic cloud terminology. |
| **RSK-05** | Browser window viewport resize clips patch controls. | Med | Med | Fixed flexbox column layout with min-width 1024px and responsive scrollable side drawer. | If window width < 1024px causes horizontal scrollbars, collapse inspection drawer into floating overlay modal. |
