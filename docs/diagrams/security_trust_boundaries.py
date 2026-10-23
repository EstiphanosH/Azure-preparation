"""
Security Trust Boundaries Diagram: CloudFix Diagnostic Platform
Uses the Python 'diagrams' library to render the STRIDE security architecture.
"""

import os
from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import Users
from diagrams.saas.cdn import Cloudflare
from diagrams.gcp.compute import Run
from diagrams.onprem.database import PostgreSQL
from diagrams.generic.network import Firewall
from diagrams.generic.storage import Storage

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "generated")
os.makedirs(OUTPUT_DIR, exist_ok=True)
FILENAME = os.path.join(OUTPUT_DIR, "security_trust_boundaries")

graph_attr = {
    "fontsize": "14",
    "fontname": "Helvetica",
    "bgcolor": "#ffffff",
    "pad": "0.5",
    "splines": "ortho",
}

node_attr = {
    "fontsize": "11",
    "fontname": "Helvetica",
}

with Diagram(
    "CloudFix Security & STRIDE Trust Boundaries",
    show=False,
    filename=FILENAME,
    direction="LR",
    graph_attr=graph_attr,
    node_attr=node_attr,
):
    with Cluster("Trust Boundary 0: Public / Untrusted Client"):
        browser = Users("Browser Client\n- Zod .strict() input sanitization\n- No sensitive tokens in localStorage\n- Memory-only state cache")

    with Cluster("Trust Boundary 1: Edge & Network Security Perimeter"):
        waf = Cloudflare("Cloudflare Edge\n- DDoS scrubbing\n- Rate limit: 100 req/min per IP\n- TLS 1.3 Strict Mode\n- Geo-distributed perimeter")
        headers = Firewall("HTTP Response Headers\n- CSP: frame-ancestors 'none'\n- Zero unsafe-eval in prod\n- X-Content-Type-Options: nosniff\n- Strict-Transport-Security HSTS")

    with Cluster("Trust Boundary 2: Application Compute Tier (Stateless Cloud Run)"):
        api = Run("Stateless Node Runtime\n- JWT Claims & Signature Verification\n- Server-side Token Revocation Set\n- Safe Error Masking (Zero SQL leaks)\n- Centralized PII Redaction Filter")

    with Cluster("Trust Boundary 3: Database Isolation & Storage Tier (Supabase PostgreSQL)"):
        with Cluster("Row Level Security (RLS) Engine"):
            rls = PostgreSQL("PostgreSQL 15+\n- FORCE ROW LEVEL SECURITY\n- Condition: auth.uid() = user_id\n- Zero anonymous writes\n- Atomic PL/pgSQL transaction procedures")
            storage = Storage("Encrypted Storage\n- Transparent Data Encryption (AES-256)\n- Automated Nightly pg_dump export\n- 90-day retention hard-purge (pg_cron)")

    # Data Flow connections with security labels
    browser >> Edge(label="1. HTTPS / TLS 1.3\nStrict Request Payload", color="#0284c7") >> waf
    waf >> Edge(label="2. Filtered & Sanitized Traffic", color="#0284c7") >> headers
    headers >> Edge(label="3. Validated Bearer JWT\n(Signed HMAC / Ed25519)", color="#6366f1") >> api
    api >> Edge(label="4. Authenticated DB Session\n(SET LOCAL request.jwt.claim.sub)", color="#0f766e") >> rls
    rls >> Edge(label="5. AES-256 Storage &\nAudit Commits", color="#0f172a") >> storage

if __name__ == "__main__":
    print(f"Generated: {FILENAME}.png")
