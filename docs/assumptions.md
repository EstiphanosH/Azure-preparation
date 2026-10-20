# Declared Assumptions

## 1. Hackathon Brief and Constraints Context
- **Theme**: Cloud Certification Diagnostic Readiness and Practical Architecture Validation.
- **Official Status**: This product is 100% unofficial, community-driven, and independent. It contains zero proprietary vendor brand marks, zero vendor trademarks, and zero proprietary or retired vendor test items. All assessment items are synthetic, first-principles diagnostic scenarios.
- **Five Competed Challenges from the Brief**:
  1. *Challenge 1 (Chosen Winner)*: Interactive Architecture Sandbox & Misconfiguration Debugger — hands-on topology inspection and synthetic parameter remediation.
  2. *Challenge 2 (Disqualified)*: Voice Oral Examiner — simulated audio Q&A testing cloud concepts verbally.
  3. *Challenge 3 (Disqualified)*: Diagram Whiteboard Vision Evaluator — multimodal assessment of student-drawn cloud architecture sketches.
  4. *Challenge 4 (Disqualified)*: Multiplayer Exam Lobby — real-time synchronized competitive quiz room with live player matchmaking.
  5. *Challenge 5 (Disqualified)*: Syllabus Flashcard Ingestion Engine — automated PDF document parser generating spaced-repetition memory cards.
- **Judging Criteria Weights**:
  - Learning Value: 25%
  - Feasibility: 25%
  - Demo Impact: 20%
  - Extensibility: 15%
  - Originality: 15%

## 2. Technical and Operational Assumptions
- **Runtime Environment**: Standard evergreen web browser (Chromium ≥118, Firefox ≥120, WebKit ≥17) running at 1920×1080 resolution without browser extensions.
- **Network & Mock Latency**: Evaluation runs in-process or over simulated local RPC with synthetic response delays bounded strictly to ≤150 ms to prevent demo flakiness.
- **Test Harness**: Downstream test suite executed by Vitest/Jest via TypeScript contracts in `tests/ac/AC-<id>.test.ts`.
- **Demo Cadence**: Normal speaking rate is assumed at 130 words per minute. A 12-step demo script with 180 spoken words takes 83 seconds of speech plus 70 seconds of UI manipulation, totalling 153 seconds (≤ 180 seconds / 3:00 max threshold).
- **Compliance Policy**: Zero copyrighted material, zero proprietary test dumps, zero brand iconography. All visual icons are generic geometric representations and Lucide interface symbols.
