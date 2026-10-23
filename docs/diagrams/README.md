# System Design & Architecture Diagrams (Python as Code)

All diagrams for the CloudFix Diagnostic Platform are authored declaratively using the Python [Diagrams](https://diagrams.mingrammer.com/) library (`diagrams`). This ensures all architectural visualizations are version-controlled, reproducible, and verifiable in CI pipelines.

---

## 1. Catalog of System Diagrams

| Diagram Identifier | Description | Python Source Script | Generated High-Res Artifact |
| :--- | :--- | :--- | :--- |
| **SYS-01: Multi-Tier System Architecture** | End-to-end multi-tier architecture spanning untrusted clients, Cloudflare edge, Cloud Run stateless web containers, Supabase PostgREST/GoTrue middleware, and PostgreSQL 15+ RLS database. | `system_architecture.py` | `generated/system_architecture.png` |
| **SEC-01: Security & STRIDE Trust Boundaries** | Trust boundary partitions (TB 0 to TB 3) with WAF, rate limits, CSP headers, JWT HMAC signatures, and PostgreSQL Row Level Security. | `security_trust_boundaries.py` | `generated/security_trust_boundaries.py` |
| **FLO-01: Diagnostic Attempt Lifecycle** | 5-stage data flow: Scenario catalog load, client synchronous rule evaluation (<= 50ms), state mutation patch, atomic verification score commit, and cache invalidation. | `data_flow_lifecycle.py` | `generated/data_flow_lifecycle.png` |
| **DEP-01: CI/CD Pipeline & Instant Rollback** | GitHub Actions quality gates (138 tests, a11y, gitleaks, typecheck), Docker scratch container, Cloud Run canary traffic migration, and instantaneous automated rollback (<= 2s). | `deployment_pipeline.py` | `generated/deployment_pipeline.png` |
| **DAT-01: Relational Schema & ERD** | Relational tables (`profiles`, `question_domains`, `questions`, `quiz_sessions`, `quiz_attempts`, `readiness_snapshots`, `feature_flags`) with foreign keys and cardinality. | `database_erd.py` | `generated/database_erd.png` |

---

## 2. Generating All Diagrams

### Prerequisites
- Python 3.10+
- Graphviz (`dot` engine) installed via package manager (`apt-get install -y graphviz`)
- Python packages specified in `requirements.txt`:
  ```bash
  pip install -r docs/diagrams/requirements.txt
  ```

### One-Click Execution
Run the master generator script:
```bash
python3 docs/diagrams/generate_all.py
```
This executes all 5 diagram generators in parallel/sequential order, validates non-empty outputs, and writes the output PNGs to `docs/diagrams/generated/`.

---

## 3. Embedding in Architecture & Design Documentation
The generated diagrams are integrated into the core engineering documentation:
- **`docs/architecture.md`**: Section 2 (Component Diagram & System Architecture) and Section 3 (Data Flow Diagram).
- **`docs/security/threat-model.md`**: Section 2 (STRIDE Trust Boundaries & Architectural Diagram).
- **`docs/deployment.md`**: Section 1 (Deployment Pipeline & Zero-Downtime Rollback Architecture).
- **`docs/data-model.md`**: Section 2 (Entity-Relationship Diagram & Schema).
