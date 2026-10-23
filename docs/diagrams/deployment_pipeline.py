"""
Deployment Pipeline & Zero-Downtime Rollback: CloudFix Diagnostic Platform
Uses the Python 'diagrams' library to render the CI/CD pipeline, health checks, canary migration, and rollback mechanics.
"""

import os
from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.vcs import Git
from diagrams.onprem.ci import GithubActions
from diagrams.gcp.compute import Run
from diagrams.gcp.operations import Monitoring
from diagrams.generic.storage import Storage
from diagrams.generic.os import LinuxGeneral

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "generated")
os.makedirs(OUTPUT_DIR, exist_ok=True)
FILENAME = os.path.join(OUTPUT_DIR, "deployment_pipeline")

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
    "CloudFix Deployment Pipeline & Zero-Downtime Rollback",
    show=False,
    filename=FILENAME,
    direction="LR",
    graph_attr=graph_attr,
    node_attr=node_attr,
):
    with Cluster("1. Code Integration"):
        commit = Git("Git Push\n(main branch)")

    with Cluster("2. GitHub Actions CI Quality Gate (<= 45s)"):
        with Cluster("Automated Release Gates"):
            ci_runner = GithubActions("CI Quality Runner\n(Ubuntu 24.04)")
            gate_types = LinuxGeneral("Typecheck Gate\n(tsc --noEmit)")
            gate_tests = LinuxGeneral("Contract Test Gate\n(138 Tests Passing)")
            gate_a11y = LinuxGeneral("Axe-Core A11y Gate\n(0 Critical Violations)")
            gate_sec = LinuxGeneral("Security & Anti-Leak\n(Gitleaks + Trademark)")

    with Cluster("3. Container Artifact"):
        docker_build = Storage("Container Registry\n(Multi-stage Scratch Image\nSize: 48 MB)")

    with Cluster("4. Cloud Run Blue/Green Canary Deployment"):
        new_rev = Run("New Canary Revision\n`cloudfix-app-rev-$SHA`\n(Traffic: 0%)")
        health_check = Monitoring("Automated Health Probe\nGET /health -> 200 OK\n(db_latency <= 20ms)")
        active_prod = Run("Production Revision\n(Traffic Shift: 100%)\nAtomic routing in <= 2.0s")
        prev_rev = Run("Previous Stable Revision\n`cloudfix-app-rev-previous`\n(Standby for Instant Rollback)")

    with Cluster("5. Automated Database Disaster Recovery"):
        nightly_backup = Storage("Nightly pg_dump Snapshot\n(gzip compressed + AES-256)\nRPO <= 1h, RTO <= 15m")

    # Connect Pipeline Stages
    commit >> Edge(label="Webhook Trigger", color="#0284c7") >> ci_runner
    ci_runner >> Edge(color="#6366f1") >> gate_types
    ci_runner >> Edge(color="#6366f1") >> gate_tests
    ci_runner >> Edge(color="#6366f1") >> gate_a11y
    ci_runner >> Edge(color="#6366f1") >> gate_sec

    gate_tests >> Edge(label="All Gates Passed", color="#10b981") >> docker_build
    docker_build >> Edge(label="Deploy revision at 0% traffic", color="#0284c7") >> new_rev
    new_rev >> Edge(label="Verify /health", color="#0f766e") >> health_check
    health_check >> Edge(label="Health Pass -> 100% Traffic", color="#10b981") >> active_prod

    # Instant Rollback Path
    health_check >> Edge(label="Health Fail / SLO Burn\nInstant Rollback <= 2.0s", style="dashed", color="#ef4444") >> prev_rev

    # Backup link
    ci_runner >> Edge(label="Automated Cron (02:00 UTC)", style="dotted", color="#64748b") >> nightly_backup

if __name__ == "__main__":
    print(f"Generated: {FILENAME}.png")
