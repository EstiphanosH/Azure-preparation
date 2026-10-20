# Feature Flags Configuration

## Compliance Disclaimer
All features described herein operate purely in a synthetic, simulated browser environment. No proprietary third-party services or trademarked vendor products are connected.

---

## Flag Registry

| flag_name | default | owner_role | kill_switch_behavior | module_gated |
| :--- | :--- | :--- | :--- | :--- |
| `ff_progressive_hint_ladder` | `true` | Product Owner | Disables hint trigger button, hides hint drawer, and locks maximum score calculation to 100 with 0 deductions permitted. | `src/components/HintLadder.tsx` |
| `ff_export_audit_log` | `true` | Security Proctor | Replaces download button with disabled state badge reading `Audit Export Disabled by Proctor Policy`. | `src/components/AuditExportModal.tsx` |
| `ff_interactive_node_drag` | `false` | Frontend Lead | Pins all SVG topology nodes to static mathematical grid coordinates, preventing mouse coordinate updates during rendering stutter. | `src/components/TopologyCanvas.tsx` |
| `ff_strict_timer_enforcement` | `true` | Exam Proctor | Automatically fails the scenario session when elapsed time exceeds 600 seconds, setting score to 0 and locking patch inputs. | `src/components/DiagnosticTimer.tsx` |
| `ff_reference_patch_shortcut` | `true` | Demo Lead | Hides `Ctrl+Shift+D` fast-remediate keyboard listener and debug button, preventing accidental solution injection during judge hands-on review. | `src/components/ScenarioWorkspace.tsx` |
| `ff_edge_packet_animation` | `true` | UI Designer | Halts CSS SVG stroke-dashoffset packet animations, reducing GPU render load to zero on low-spec client machines. | `src/components/TopologyCanvas.tsx` |
