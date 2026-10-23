"""
Diagnostic Attempt Data Flow & Lifecycle: CloudFix Diagnostic Platform
Uses the Python 'diagrams' library to render the end-to-end request, evaluation, mutation, and audit lifecycle.
"""

import os
from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.client import Users
from diagrams.saas.cdn import Cloudflare
from diagrams.gcp.compute import Run
from diagrams.onprem.database import PostgreSQL
from diagrams.generic.storage import Storage

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "generated")
os.makedirs(OUTPUT_DIR, exist_ok=True)
FILENAME = os.path.join(OUTPUT_DIR, "data_flow_lifecycle")

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
    "CloudFix Diagnostic Attempt Lifecycle & Data Flow",
    show=False,
    filename=FILENAME,
    direction="TB",
    graph_attr=graph_attr,
    node_attr=node_attr,
):
    with Cluster("Step 1: Scenario Catalog Retrieval"):
        client_init = Users("Candidate Browser\n(React Query Init)")
        cdn_edge = Cloudflare("Edge CDN / Cache\n(Public Max-Age: 3600s)")
        db_catalog = PostgreSQL("Table: scenarios\n(JSONB Topology Schemas)")

    with Cluster("Step 2: In-Memory Client Diagnostics & Remediation"):
        eval_engine = Run("Pure Client Rule Engine\n- Synchronous predicates (<= 50ms)\n- Zero network latency for inspector\n- Red/Green link status updates")

    with Cluster("Step 3: State Mutation & Atomic Patch Recording"):
        patch_call = Run("PostgREST REST API\nPOST /rest/v1/session_patches\n(Bearer JWT Token)")
        pooler = Run("Supavisor Pooler\n(Checked out in <= 2ms)")
        db_patches = PostgreSQL("Table: session_patches\n(RLS Check: auth.uid() == user_id)")

    with Cluster("Step 4: Verification Finalization & Audit Commit"):
        finalize_rpc = Run("Stored Procedure RPC\nfinalize_diagnostic_session()\n(Atomic lock & score calculation)")
        db_audit = PostgreSQL("Table: verification_audit_logs\n(Immutable ISO Timestamped Record)")

    with Cluster("Step 5: Cache Invalidation & Telemetry Output"):
        cache_refresh = Storage("TanStack Query Cache\n(Session key invalidated)\nPrometheus duration histogram updated")

    # Step 1 flows
    client_init >> Edge(label="GET /scenarios/SCN-01", color="#0284c7") >> cdn_edge
    cdn_edge >> Edge(label="Cache Miss -> Query", style="dashed", color="#0284c7") >> db_catalog
    cdn_edge >> Edge(label="200 OK + JSON Schema", color="#10b981") >> client_init

    # Step 2 flows
    client_init >> Edge(label="Load scenario into memory", color="#6366f1") >> eval_engine

    # Step 3 flows
    eval_engine >> Edge(label="Candidate applies patch", color="#f59e0b") >> patch_call
    patch_call >> Edge(label="Acquire pooled conn", color="#475569") >> pooler
    pooler >> Edge(label="INSERT patch record", color="#0f766e") >> db_patches
    db_patches >> Edge(label="201 Created (Patch ID)", color="#10b981") >> client_init

    # Step 4 flows
    client_init >> Edge(label="All rules pass -> POST /rpc/finalize", color="#0284c7") >> finalize_rpc
    finalize_rpc >> Edge(label="Atomic commit", color="#0f172a") >> db_audit
    db_audit >> Edge(label="200 OK {status: 'RESOLVED'}", color="#10b981") >> client_init

    # Step 5 flows
    client_init >> Edge(label="Local cache refresh", style="dotted", color="#64748b") >> cache_refresh

if __name__ == "__main__":
    print(f"Generated: {FILENAME}.png")
