/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question } from '../model/Question.ts';
import { SYNTHETIC_QUESTION_BANK } from '../model/QuestionBank.ts';

export interface PresetQuiz {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly scenarioEnterprise: string;
  readonly scenarioContext: string;
  readonly domainId: 'DOM-CONCEPTS' | 'DOM-SERVICES' | 'DOM-SECURITY' | null;
  readonly domainTitle: string;
  readonly questionCount: number;
  readonly timeLimitMinutes: number;
  readonly difficulty: 'Foundational' | 'Intermediate' | 'Advanced';
  readonly keyThemes: readonly string[];
  readonly targetQuestionIds?: readonly string[];
}

/**
 * 10 Curated Scenario-Based Quizzes for AZ-900 Candidates.
 * Each quiz addresses a specific enterprise architectural challenge.
 */
export const PRESET_SCENARIO_QUIZZES: readonly PresetQuiz[] = [
  {
    id: 'quiz-preset-lift-and-shift',
    title: 'Scenario Quiz 1: Lift-and-Shift Migration Strategy',
    subtitle: 'Contoso Health Datacenter Retirement & Workload Triage',
    scenarioEnterprise: 'Contoso Health System',
    scenarioContext: 'Contoso Health must vacate their physical facility within 90 days. Help their architecture board classify legacy imaging software and line-of-business applications into IaaS vs. PaaS, evaluate Shared Responsibility obligations, and design hybrid connectivity.',
    domainId: 'DOM-CONCEPTS',
    domainTitle: 'Cloud Concepts',
    questionCount: 15,
    timeLimitMinutes: 15,
    difficulty: 'Foundational',
    keyThemes: ['IaaS vs. PaaS selection', 'Shared Responsibility', 'CapEx to OpEx transition', 'Hybrid Cloud burst'],
  },
  {
    id: 'quiz-preset-ha-dr',
    title: 'Scenario Quiz 2: High Availability & Disaster Recovery',
    subtitle: 'Fabrikam Global Logistics Resilient Multi-Zone Architecture',
    scenarioEnterprise: 'Fabrikam Global Logistics',
    scenarioContext: 'Fabrikam handles 12 million parcel tracking requests hourly. Design a zero-data-loss architecture using Availability Zones, calculate Composite SLAs, and configure automated failover across Azure Region Pairs.',
    domainId: 'DOM-SERVICES',
    domainTitle: 'Azure Architecture & Services',
    questionCount: 20,
    timeLimitMinutes: 20,
    difficulty: 'Intermediate',
    keyThemes: ['Availability Zones (99.99%)', 'Region Pairs & GRS', 'Fault Domains', 'Composite SLA math'],
  },
  {
    id: 'quiz-preset-zero-trust-identity',
    title: 'Scenario Quiz 3: Zero Trust & Entra ID Identity',
    subtitle: 'Woodgrove Financial Identity Governance & Conditional Access',
    scenarioEnterprise: 'Woodgrove Financial Services',
    scenarioContext: 'Harden authentication protocols for 8,500 distributed bank associates against credential stuffing and phishing attacks. Enforce Microsoft Entra ID modern authentication, Conditional Access risk-based MFA, and RBAC least privilege.',
    domainId: 'DOM-SECURITY',
    domainTitle: 'Security, Privacy & Compliance',
    questionCount: 20,
    timeLimitMinutes: 20,
    difficulty: 'Advanced',
    keyThemes: ['Microsoft Entra ID vs AD DS', 'Conditional Access signals', 'MFA verification factors', 'Azure RBAC scopes'],
  },
  {
    id: 'quiz-preset-cloud-economics',
    title: 'Scenario Quiz 4: Cloud Economics & TCO Optimization',
    subtitle: 'Tailspin Toys Datacenter TCO vs Azure Consumption Pricing',
    scenarioEnterprise: 'Tailspin Toys Retail',
    scenarioContext: 'Tailspin Toys is evaluating an on-prem server refresh vs. migrating to Azure. Model 5-year Total Cost of Ownership (TCO) savings, configure proactive Azure Budget alerts, and evaluate consumption-based billing benefits.',
    domainId: 'DOM-CONCEPTS',
    domainTitle: 'Cloud Concepts',
    questionCount: 15,
    timeLimitMinutes: 15,
    difficulty: 'Foundational',
    keyThemes: ['TCO Calculator vs. Pricing Calculator', 'CapEx vs. OpEx tax impact', 'Consumption elasticity', 'Azure Cost Management budgets'],
  },
  {
    id: 'quiz-preset-serverless-microservices',
    title: 'Scenario Quiz 5: Serverless & Containerized Microservices',
    subtitle: 'AdventureWorks E-Commerce Peak Elasticity Architecture',
    scenarioEnterprise: 'AdventureWorks E-Commerce',
    scenarioContext: 'AdventureWorks expects a 600% flash-sale traffic spike. Architect an event-driven order processing solution leveraging Azure Functions, Azure Container Instances (ACI), and Azure Kubernetes Service (AKS) with automated VMSS elasticity.',
    domainId: 'DOM-SERVICES',
    domainTitle: 'Azure Architecture & Services',
    questionCount: 20,
    timeLimitMinutes: 20,
    difficulty: 'Intermediate',
    keyThemes: ['Azure Functions triggers', 'ACI serverless containers', 'AKS microservices orchestration', 'VM Scale Sets autoscale'],
  },
  {
    id: 'quiz-preset-storage-lifecycle',
    title: 'Scenario Quiz 6: Storage Lifecycle & Global NoSQL',
    subtitle: 'Northwind Traders Multi-Tier Object Storage & Cosmos DB',
    scenarioEnterprise: 'Northwind Traders',
    scenarioContext: 'Northwind archives 500 terabytes of customs documentation and operates a real-time shipping ledger across three continents. Configure automated Blob Storage Lifecycle management (Hot/Cool/Archive) and deploy Azure Cosmos DB with multi-region writes.',
    domainId: 'DOM-SERVICES',
    domainTitle: 'Azure Architecture & Services',
    questionCount: 20,
    timeLimitMinutes: 20,
    difficulty: 'Intermediate',
    keyThemes: ['Blob Access Tiers (Hot/Cool/Archive)', 'Archive rehydration', 'Cosmos DB multi-master', 'Lifecycle Management rules'],
  },
  {
    id: 'quiz-preset-governance-compliance',
    title: 'Scenario Quiz 7: Sovereign Governance & Policy Enforcement',
    subtitle: 'Adatum Financial Multi-Subscription Management Hierarchy',
    scenarioEnterprise: 'Adatum Financial Group',
    scenarioContext: 'Standardize governance across 14 departmental subscriptions. Construct an enterprise Management Group hierarchy, deploy Azure Policy with "Deny" effects for unapproved regions, and lock critical resources with CanNotDelete resource locks.',
    domainId: 'DOM-SECURITY',
    domainTitle: 'Security, Privacy & Compliance',
    questionCount: 15,
    timeLimitMinutes: 15,
    difficulty: 'Intermediate',
    keyThemes: ['Management Group inheritance', 'Azure Policy vs. RBAC', 'CanNotDelete resource locks', 'Cost-center tag compliance'],
  },
  {
    id: 'quiz-preset-hybrid-networking',
    title: 'Scenario Quiz 8: Hybrid Connectivity & Enterprise Networking',
    subtitle: 'Trey Research Secure Clinical Fiber & VNet Topology',
    scenarioEnterprise: 'Trey Research Clinical Labs',
    scenarioContext: 'Connect on-prem clinical research facilities with Azure cloud virtual networks. Architect private hybrid connectivity over Azure ExpressRoute, connect cross-region VNets via Global Peering, and segment traffic using Network Security Groups (NSGs).',
    domainId: 'DOM-SERVICES',
    domainTitle: 'Azure Architecture & Services',
    questionCount: 20,
    timeLimitMinutes: 20,
    difficulty: 'Advanced',
    keyThemes: ['Azure ExpressRoute vs. VPN Gateway', 'Global VNet Peering', 'Network Security Groups (NSGs)', 'Azure Bastion secure RDP'],
  },
  {
    id: 'quiz-preset-threat-hunting-siem',
    title: 'Scenario Quiz 9: SIEM Analytics & Workload Protection',
    subtitle: 'Lucerne Publishing Enterprise Threat Hunting & CSPM',
    scenarioEnterprise: 'Lucerne Publishing',
    scenarioContext: 'Protect cloud applications from sophisticated adversaries. Implement Microsoft Sentinel for SIEM/SOAR incident triage, leverage Microsoft Defender for Cloud for Secure Score posture hardening, and eliminate code secrets via Azure Key Vault.',
    domainId: 'DOM-SECURITY',
    domainTitle: 'Security, Privacy & Compliance',
    questionCount: 20,
    timeLimitMinutes: 20,
    difficulty: 'Advanced',
    keyThemes: ['Microsoft Sentinel SIEM/SOAR', 'Defender for Cloud Secure Score', 'Azure Key Vault secrets', 'Continuous compliance audit'],
  },
  {
    id: 'quiz-preset-full-mock-exam',
    title: 'Scenario Quiz 10: Full 50-Question Comprehensive Mock Exam',
    subtitle: 'Complete Cross-Domain AZ-900 Simulation with Strict Countdown',
    scenarioEnterprise: 'Global Multi-Tenant Enterprise Solution',
    scenarioContext: 'Experience the full AZ-900 syllabus benchmark under formal exam timing conditions (45 minutes, 50 questions balanced across all 3 official domains) with instant diagnostic grading and domain readiness breakdown.',
    domainId: null,
    domainTitle: 'All 3 Official AZ-900 Domains',
    questionCount: 50,
    timeLimitMinutes: 45,
    difficulty: 'Advanced',
    keyThemes: ['Cloud Concepts (28%)', 'Architecture & Services (36%)', 'Security & Pricing (36%)', 'Full Syllabus Benchmark'],
  },
];

/**
 * Retrieve all 10 scenario-based preset quizzes.
 */
export function getPresetScenarioQuizzes(): readonly PresetQuiz[] {
  return PRESET_SCENARIO_QUIZZES;
}

/**
 * Find a preset quiz by its unique identifier.
 */
export function getPresetQuizById(id: string): PresetQuiz | undefined {
  return PRESET_SCENARIO_QUIZZES.find((p) => p.id === id);
}

/**
 * Generate questions for a given preset quiz.
 */
export function generateQuestionsForPreset(
  preset: PresetQuiz,
  options?: { shuffle?: boolean }
): readonly Question[] {
  const shouldShuffle = options?.shuffle ?? true;

  let candidates: Question[];
  if (preset.domainId) {
    candidates = SYNTHETIC_QUESTION_BANK.filter((q) => q.domainId === preset.domainId);
  } else {
    candidates = [...SYNTHETIC_QUESTION_BANK];
  }

  // Shuffle and slice to target question count
  const shuffled = shouldShuffle ? shuffleArray(candidates) : candidates;
  return shuffled.slice(0, Math.min(preset.questionCount, shuffled.length));
}

function shuffleArray<T>(array: readonly T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = temp;
  }
  return arr;
}
