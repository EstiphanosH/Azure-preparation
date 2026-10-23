#!/usr/bin/env python3
"""
Master Diagram Generation Script: CloudFix Diagnostic Platform
Executes all Python diagram scripts and verifies generated assets.
"""

import os
import sys
import subprocess

DIAGRAM_SCRIPTS = [
    "system_architecture.py",
    "security_trust_boundaries.py",
    "data_flow_lifecycle.py",
    "deployment_pipeline.py",
    "database_erd.py",
]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
GENERATED_DIR = os.path.join(BASE_DIR, "generated")

def main():
    print("=" * 70)
    print("CloudFix System Design: Python Diagram Generation Suite")
    print("=" * 70)
    os.makedirs(GENERATED_DIR, exist_ok=True)

    success_count = 0
    generated_files = []

    for script_name in DIAGRAM_SCRIPTS:
        script_path = os.path.join(BASE_DIR, script_name)
        print(f"\n[+] Executing diagram generator: {script_name}...")
        try:
            result = subprocess.run(
                [sys.executable, script_path],
                cwd=BASE_DIR,
                capture_output=True,
                text=True,
                check=True,
            )
            print(f"    STDOUT: {result.stdout.strip()}")
            success_count += 1
            
            # Expected png name
            base_name = os.path.splitext(script_name)[0]
            png_path = os.path.join(GENERATED_DIR, f"{base_name}.png")
            if os.path.exists(png_path):
                size_kb = os.path.getsize(png_path) / 1024.0
                print(f"    SUCCESS: {base_name}.png generated ({size_kb:.1f} KB)")
                generated_files.append((base_name, f"{base_name}.png", size_kb))
            else:
                print(f"    WARNING: {png_path} not found after script execution!")
        except subprocess.CalledProcessError as err:
            print(f"    FAILED: {script_name} exited with code {err.returncode}")
            print(f"    STDERR:\n{err.stderr}")
            sys.exit(1)

    print("\n" + "=" * 70)
    print(f"Diagram Generation Complete: {success_count}/{len(DIAGRAM_SCRIPTS)} generated successfully.")
    print("Summary of Generated System Diagrams:")
    for name, filename, size_kb in generated_files:
        print(f"  • {name:<30} -> docs/diagrams/generated/{filename} ({size_kb:.1f} KB)")
    print("=" * 70)

if __name__ == "__main__":
    main()
