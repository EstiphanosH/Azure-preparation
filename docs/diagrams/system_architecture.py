"""
System Architecture Diagram: CloudFix Diagnostic Platform
Uses the Python 'diagrams' library to render the end-to-end multi-tier architecture.
"""

import os
from diagrams import Diagram, Cluster, Edge
from diagrams.programming.framework import React
from diagrams.onprem.client import Users, Client
from diagrams.saas.cdn import Cloudflare
from diagrams.gcp.compute import Run
from diagrams.gcp.operations import Monitoring
from diagrams.onprem.database import PostgreSQL
from diagrams.generic.network import Firewall
from diagrams.generic.storage import Storage

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "generated")
os.makedirs(OUTPUT_DIR, exist_ok=True)
FILENAME = os.path.join(OUTPUT_DIR, "system_architecture")

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
    "CloudFix Diagnostic Platform - Multi-Tier System Architecture",
    show=False,
    filename=FILENAME,
    direction="TB",
    graph_attr=graph_attr,
    node_attr=node_attr,
):
    with Cluster("Trust Boundary 0: Public Client Tier"):
        candidate = Users("Candidate Browser\n(React 19 SPA)")
        proctor = Client("Technical Proctor /\nEvaluator Workstation")

    with Cluster("Trust Boundary 1: Edge & Network Perimeter"):
        waf = Cloudflare("Cloudflare WAF &\nDDoS Shield")
        tls = Firewall("TLS 1.3 Termination &\nHSTS / CSP Headers")
        edge_cache = Storage("Edge CDN Cache\n(Immutable Assets)")

    with Cluster("Trust Boundary 2: Application Compute Tier (GCP Cloud Run - Stateless)"):
        with Cluster("Stateless Web Container (:3000)"):
            app_server = Run("Vite / Node Web Server\n(Application Runtime)")
            health = Monitoring("Container Health Probe\n(GET /health <= 20ms)")
            metrics = Monitoring("OpenTelemetry Prometheus\nExporter (:9090)")

    with Cluster("Trust Boundary 3: Secure Managed Data Tier (Supabase Infrastructure)"):
        with Cluster("API & Connection Middleware"):
            postgrest = Run("PostgREST REST Engine\n(Direct-to-PostgreSQL v12)")
            gotrue = Firewall("GoTrue Auth Engine\n(JWT v2 HMAC-Signed)")
            supavisor = Run("Supavisor Pooler\n(:6543 Transaction Mode)")

        with Cluster("Core PostgreSQL 15+ Relational Database"):
            rls_engine = PostgreSQL("PostgreSQL Engine\n(Mandatory Row Level Security)")
            tbl_scenarios = PostgreSQL("Table: scenarios\n(PUBLIC READ)")
            tbl_sessions = PostgreSQL("Table: user_sessions\n(RESTRICTED OWNER)")
            tbl_patches = PostgreSQL("Table: session_patches\n(RESTRICTED OWNER)")
            tbl_audits = PostgreSQL("Table: verification_audit_logs\n(CONFIDENTIAL)")

    # Client to Edge
    candidate >> Edge(label="HTTPS / Port 443", color="#0284c7") >> waf
    proctor >> Edge(label="HTTPS / Port 443", color="#0284c7") >> waf
    waf >> Edge(color="#0284c7") >> tls
    tls >> Edge(label="Cache Hit", style="dashed", color="#10b981") >> edge_cache
    tls >> Edge(label="Cache Miss / Dynamic", color="#0284c7") >> app_server

    # Direct Client to API Data Tier with Bearer JWT
    candidate >> Edge(label="REST / JWT Bearer", color="#6366f1") >> postgrest
    candidate >> Edge(label="Auth Credentials", color="#8b5cf6") >> gotrue

    # Middleware to Connection Pooler
    postgrest >> Edge(label="Transaction Pool", color="#475569") >> supavisor
    gotrue >> Edge(label="Transaction Pool", color="#475569") >> supavisor
    supavisor >> Edge(label="Internal Socket", color="#475569") >> rls_engine

    # RLS Engine to Relational Tables
    rls_engine >> Edge(color="#0f172a") >> tbl_scenarios
    rls_engine >> Edge(color="#0f172a") >> tbl_sessions
    rls_engine >> Edge(color="#0f172a") >> tbl_patches
    rls_engine >> Edge(color="#0f172a") >> tbl_audits

    # Server probes
    app_server - Edge(style="dotted", color="#94a3b8") - health
    app_server - Edge(style="dotted", color="#94a3b8") - metrics

if __name__ == "__main__":
    print(f"Generated: {FILENAME}.png")
