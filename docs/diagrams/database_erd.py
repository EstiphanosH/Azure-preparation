"""
Database Architecture & Entity-Relationship Diagram: CloudFix Diagnostic Platform
Uses the Python 'diagrams' library to render the relational schema, foreign keys, and audit attributes.
"""

import os
from diagrams import Diagram, Cluster, Edge
from diagrams.onprem.database import PostgreSQL
from diagrams.generic.database import SQL

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "generated")
os.makedirs(OUTPUT_DIR, exist_ok=True)
FILENAME = os.path.join(OUTPUT_DIR, "database_erd")

graph_attr = {
    "fontsize": "14",
    "fontname": "Helvetica",
    "bgcolor": "#ffffff",
    "pad": "0.5",
    "splines": "ortho",
}

node_attr = {
    "fontsize": "10",
    "fontname": "Helvetica",
}

with Diagram(
    "CloudFix Relational Database Schema & Foreign Key Topologies",
    show=False,
    filename=FILENAME,
    direction="TB",
    graph_attr=graph_attr,
    node_attr=node_attr,
):
    with Cluster("User Profiles & Authentication Identity"):
        profiles = PostgreSQL("PROFILES\nPK: id (UUID -> auth.users)\n- username: VARCHAR UNIQUE\n- full_name: TEXT\n- created_at: TIMESTAMPTZ\n- updated_at: TIMESTAMPTZ")

    with Cluster("Taxonomy & Diagnostic Question Bank"):
        domains = SQL("QUESTION_DOMAINS\nPK: id (VARCHAR 32)\n- title: TEXT\n- description: TEXT\n- display_order: INT\n- created_at: TIMESTAMPTZ")
        questions = SQL("QUESTIONS\nPK: id (UUID)\nFK: domain_id -> QUESTION_DOMAINS\n- prompt: TEXT\n- options: JSONB\n- correct_answer_index: INT (0-3)\n- explanation: TEXT\n- difficulty: VARCHAR")

    with Cluster("Assessment Sessions & Attempt Stream"):
        sessions = PostgreSQL("QUIZ_SESSIONS\nPK: id (UUID)\nFK: user_id -> PROFILES\nFK: domain_id -> QUESTION_DOMAINS\n- status: IN_PROGRESS | RESOLVED\n- score: INT (0-100)\n- total_questions: INT\n- started_at: TIMESTAMPTZ\n- completed_at: TIMESTAMPTZ")
        attempts = PostgreSQL("QUIZ_ATTEMPTS\nPK: id (UUID)\nFK: session_id -> QUIZ_SESSIONS\nFK: user_id -> PROFILES\nFK: question_id -> QUESTIONS\n- selected_index: INT (0-3)\n- is_correct: BOOLEAN\n- time_taken_ms: INT\n- created_at: TIMESTAMPTZ")

    with Cluster("Readiness Benchmarking & Operational Controls"):
        snapshots = PostgreSQL("READINESS_SNAPSHOTS\nPK: id (UUID)\nFK: user_id -> PROFILES\n- overall_score: INT (0-100)\n- domain_scores: JSONB\n- evaluation_grade: READY | REVIEW\n- created_at: TIMESTAMPTZ")
        flags = SQL("FEATURE_FLAGS\nPK: flag_name (VARCHAR 64)\n- is_enabled: BOOLEAN\n- owner_role: VARCHAR 32\n- kill_switch_behavior: TEXT\n- updated_at: TIMESTAMPTZ")

    # Cardinality & Foreign Key Edges
    profiles >> Edge(label="1 : N\n(initiates session)", color="#0284c7") >> sessions
    profiles >> Edge(label="1 : N\n(owns snapshot)", color="#0284c7") >> snapshots
    profiles >> Edge(label="1 : N\n(submits attempt)", color="#0284c7") >> attempts

    domains >> Edge(label="1 : N\n(categorizes)", color="#0f766e") >> questions
    domains >> Edge(label="1 : N\n(scopes session)", style="dashed", color="#0f766e") >> sessions

    sessions >> Edge(label="1 : N\n(records attempts)", color="#6366f1") >> attempts
    questions >> Edge(label="1 : N\n(targeted by)", color="#8b5cf6") >> attempts

if __name__ == "__main__":
    print(f"Generated: {FILENAME}.png")
