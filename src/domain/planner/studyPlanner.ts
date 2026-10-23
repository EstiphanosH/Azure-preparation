/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StudyPlanConfig {
  readonly examDate: string; // YYYY-MM-DD
  readonly hoursPerWeek: number; // e.g. 5, 10, 15, 20
  readonly targetScore?: number; // default 700 / 1000
  readonly weakDomains?: readonly string[]; // ['DOM-CONCEPTS', 'DOM-SERVICES', 'DOM-SECURITY']
  readonly learnerLevel?: 'beginner' | 'intermediate' | 'experienced';
}

export interface DailyStudyTask {
  readonly id: string;
  readonly dayNumber: number;
  readonly dateString: string;
  readonly phaseId: string;
  readonly domainId: string;
  readonly domainTitle: string;
  readonly topicTitle: string;
  readonly estimatedMinutes: number;
  readonly taskType: 'concept_reading' | 'flashcards' | 'quiz_sprint' | 'benchmark_exam' | 'african_analogy_review';
  readonly description: string;
  readonly flashcardIds?: readonly string[];
  readonly recommendedQuizCount?: number;
  readonly completed?: boolean;
}

export interface StudyPhase {
  readonly id: string;
  readonly title: string;
  readonly weekNumber: number;
  readonly focusDomain: string;
  readonly weightPercentage: number;
  readonly description: string;
  readonly targetOutcomes: readonly string[];
}

export interface GeneratedStudyPlan {
  readonly id: string;
  readonly createdAt: string;
  readonly examDate: string;
  readonly daysRemaining: number;
  readonly totalStudyHours: number;
  readonly hoursPerWeek: number;
  readonly learnerLevel: 'beginner' | 'intermediate' | 'experienced';
  readonly paceAssessment: {
    readonly status: 'OPTIMAL' | 'ACCELERATED' | 'INTENSIVE_SPRINT' | 'RELAXED';
    readonly recommendation: string;
    readonly dailyMinutes: number;
  };
  readonly phases: readonly StudyPhase[];
  readonly tasks: readonly DailyStudyTask[];
  readonly domainAllocations: readonly {
    readonly domainId: string;
    readonly domainTitle: string;
    readonly syllabusWeightPct: number;
    readonly allocatedHours: number;
    readonly isWeakArea: boolean;
  }[];
}

const STORAGE_KEY = 'cloudfix_az900_study_plan_v1';

export const DOMAIN_METADATA = {
  'DOM-CONCEPTS': {
    id: 'DOM-CONCEPTS',
    title: 'Cloud Concepts',
    syllabusWeight: 28,
    keyTopics: [
      'Cloud Computing Models (IaaS, PaaS, SaaS)',
      'Cloud Deployment Models (Public, Private, Hybrid)',
      'Cloud Economics (CapEx vs OpEx, Consumption Model)',
      'High Availability, Scalability, Elasticity, Agility, Disaster Recovery',
    ],
  },
  'DOM-SERVICES': {
    id: 'DOM-SERVICES',
    title: 'Azure Architecture & Services',
    syllabusWeight: 37,
    keyTopics: [
      'Azure Core Components (Geographies, Regions, Availability Zones, Datacenters)',
      'Azure Compute (Virtual Machines, App Services, Container Instances, AKS, Functions)',
      'Azure Networking (VNets, Subnets, VPN Gateway, ExpressRoute, DNS)',
      'Azure Storage (Blob Storage Tiers, Disk Storage, Files, Migration)',
    ],
  },
  'DOM-SECURITY': {
    id: 'DOM-SECURITY',
    title: 'Azure Management & Governance',
    syllabusWeight: 35,
    keyTopics: [
      'Identity & Access (Microsoft Entra ID, Multi-Factor Authentication, Conditional Access, RBAC)',
      'Security & Defense (Defense in Depth, Network Security Groups, Azure Firewall)',
      'Cost Management (TCO Calculator, Pricing Calculator, Cost Alerts, Budgets)',
      'Governance & Compliance (Resource Groups, Resource Locks, Azure Policy, Blueprints)',
    ],
  },
} as const;

/**
 * Generates an intelligent, syllabus-weighted AZ-900 study plan tailored to the learner's schedule and weak areas.
 */
export function generateStudyPlan(config: StudyPlanConfig): GeneratedStudyPlan {
  const now = new Date();
  const exam = new Date(config.examDate);
  const diffTime = exam.getTime() - now.getTime();
  const rawDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(1, isNaN(rawDays) ? 14 : rawDays);

  const hoursPerWeek = Math.max(2, Math.min(40, config.hoursPerWeek || 10));
  const totalWeeks = Math.max(0.5, daysRemaining / 7);
  const totalStudyHours = Math.round(totalWeeks * hoursPerWeek);
  const learnerLevel = config.learnerLevel || 'beginner';
  const weakDomains = new Set(config.weakDomains || []);

  // Determine pacing assessment
  const dailyMinutes = Math.round((hoursPerWeek * 60) / 7);
  let paceStatus: GeneratedStudyPlan['paceAssessment']['status'] = 'OPTIMAL';
  let paceRecommendation = 'Balanced study pace. You have sufficient time to cover all core concepts and complete multiple diagnostic exams.';

  if (daysRemaining <= 5) {
    paceStatus = 'INTENSIVE_SPRINT';
    paceRecommendation = 'Rapid sprint required. Prioritize high-yield flashcards, weak domain revision, and 50-question mock exams.';
  } else if (daysRemaining <= 10) {
    paceStatus = 'ACCELERATED';
    paceRecommendation = 'Accelerated roadmap. Allocate 1-2 hours daily to cover syllabus domains and active recall tests.';
  } else if (daysRemaining > 45) {
    paceStatus = 'RELAXED';
    paceRecommendation = 'Spacious timeframe. Deep-dive into architectural trade-offs, scenario case studies, and progressive spaced repetition.';
  }

  // Domain hours allocation with priority boost for identified weak areas
  const domainAllocations = Object.values(DOMAIN_METADATA).map((dom) => {
    const isWeak = weakDomains.has(dom.id);
    const weightBoost = isWeak ? 1.3 : 1.0;
    const baseWeight = dom.syllabusWeight * weightBoost;
    return {
      domainId: dom.id,
      domainTitle: dom.title,
      syllabusWeightPct: dom.syllabusWeight,
      weightFactor: baseWeight,
      isWeakArea: isWeak,
    };
  });

  const totalWeightFactor = domainAllocations.reduce((sum, d) => sum + d.weightFactor, 0);

  const finalAllocations = domainAllocations.map((d) => {
    const allocated = Math.max(2, Math.round((d.weightFactor / totalWeightFactor) * totalStudyHours));
    return {
      domainId: d.domainId,
      domainTitle: d.domainTitle,
      syllabusWeightPct: d.syllabusWeightPct,
      allocatedHours: allocated,
      isWeakArea: d.isWeakArea,
    };
  });

  // Construct structured study phases
  const phases: StudyPhase[] = [
    {
      id: 'PHASE-1',
      title: 'Phase 1: Cloud Concepts & Economics',
      weekNumber: 1,
      focusDomain: 'DOM-CONCEPTS',
      weightPercentage: 28,
      description: 'Master core cloud computing models (IaaS/PaaS/SaaS), shared responsibility, and CapEx vs OpEx consumption economics.',
      targetOutcomes: [
        'Differentiate between IaaS, PaaS, and SaaS responsibilities',
        'Calculate cloud financial benefits and cost savings over on-premises infrastructure',
        'Achieve ≥ 75% on Cloud Concepts flashcard recall',
      ],
    },
    {
      id: 'PHASE-2',
      title: 'Phase 2: Azure Core Architecture & Services',
      weekNumber: Math.max(1, Math.round(totalWeeks * 0.35)),
      focusDomain: 'DOM-SERVICES',
      weightPercentage: 37,
      description: 'Explore physical infrastructure, datacenters, regions, compute, virtual networking, and multi-tier storage accounts.',
      targetOutcomes: [
        'Map out Azure regions, paired regions, and Availability Zones',
        'Select optimal compute (VMs vs App Service vs Functions vs AKS)',
        'Configure Azure Storage tiers (Hot, Cool, Cold, Archive)',
      ],
    },
    {
      id: 'PHASE-3',
      title: 'Phase 3: Azure Governance, Privacy & Security',
      weekNumber: Math.max(1, Math.round(totalWeeks * 0.7)),
      focusDomain: 'DOM-SECURITY',
      weightPercentage: 35,
      description: 'Deep dive into Microsoft Entra ID authentication, RBAC, Defense in Depth, Azure Policy, and Cost Management budgets.',
      targetOutcomes: [
        'Enforce least-privilege access using Role-Based Access Control (RBAC)',
        'Apply Azure Policies and Resource Locks to prevent configuration drift',
        'Forecast spending with Pricing Calculator and set budget thresholds',
      ],
    },
    {
      id: 'PHASE-4',
      title: 'Phase 4: Final Readiness Sprint & Mock Benchmark',
      weekNumber: Math.max(1, Math.ceil(totalWeeks)),
      focusDomain: 'ALL-DOMAINS',
      weightPercentage: 100,
      description: 'Timed full-length 50-question mock exams, spaced-repetition flashcard drills, and targeted remediation on weak areas.',
      targetOutcomes: [
        'Score ≥ 700/1000 consistently on 50-question benchmark exams',
        'Maintain pacing under 50 seconds per question',
        'Review African real-life analogies for abstract edge cases',
      ],
    },
  ];

  // Generate daily tasks
  const tasks: DailyStudyTask[] = [];
  const taskCount = Math.min(daysRemaining, 30); // Max 30 daily tasks in detailed checklist

  for (let i = 1; i <= taskCount; i++) {
    const taskDate = new Date(now.getTime() + (i - 1) * 24 * 60 * 60 * 1000);
    const dateString = taskDate.toISOString().split('T')[0]!;
    const progressRatio = i / taskCount;

    let assignedPhase = phases[0]!;
    let domainId = 'DOM-CONCEPTS';
    let topicTitle = 'Cloud Computing Foundations';
    let taskType: DailyStudyTask['taskType'] = 'concept_reading';
    let description = 'Read Cloud Concepts overview and practice shared responsibility model.';
    let flashcardIds: string[] = ['FC-01', 'FC-02', 'FC-03'];
    let recommendedQuizCount = 15;

    if (progressRatio <= 0.3) {
      assignedPhase = phases[0]!;
      domainId = 'DOM-CONCEPTS';
      if (i % 2 === 1) {
        topicTitle = 'IaaS vs PaaS vs SaaS & Cloud Models';
        taskType = 'flashcards';
        description = 'Review Flashcard Coach for Cloud Models and test memory on Lift-and-Shift vs Managed Services.';
        flashcardIds = ['FC-01', 'FC-02', 'FC-03', 'FC-04'];
      } else {
        topicTitle = 'CapEx vs OpEx & Shared Responsibility';
        taskType = 'quiz_sprint';
        description = 'Launch a 15-question diagnostic sprint on Cloud Concepts and check instant answer feedback.';
        recommendedQuizCount = 15;
      }
    } else if (progressRatio <= 0.65) {
      assignedPhase = phases[1]!;
      domainId = 'DOM-SERVICES';
      if (i % 2 === 1) {
        topicTitle = 'Regions, Availability Zones & Core Compute';
        taskType = 'african_analogy_review';
        description = 'Use AI Study Buddy Rafiki to understand Availability Zones using marketplace stall analogies.';
        flashcardIds = ['FC-07', 'FC-08', 'FC-09'];
      } else {
        topicTitle = 'Virtual Networks & Storage Tiers';
        taskType = 'quiz_sprint';
        description = 'Practice Scenario Quizzes: Contoso and Woodgrove storage architectures.';
        recommendedQuizCount = 20;
      }
    } else if (progressRatio <= 0.85) {
      assignedPhase = phases[2]!;
      domainId = 'DOM-SECURITY';
      if (i % 2 === 1) {
        topicTitle = 'Entra ID, RBAC & Defense in Depth';
        taskType = 'flashcards';
        description = 'Active recall drill on Authentication vs Authorization and Zero Trust principles.';
        flashcardIds = ['FC-14', 'FC-15', 'FC-16', 'FC-17'];
      } else {
        topicTitle = 'Azure Policy, Resource Locks & Cost Management';
        taskType = 'quiz_sprint';
        description = 'Launch 25-question sprint on Governance, Policies, and Pricing budgets.';
        recommendedQuizCount = 25;
      }
    } else {
      assignedPhase = phases[3]!;
      domainId = 'ALL-DOMAINS';
      if (i === taskCount) {
        topicTitle = 'Final 50-Question Benchmark Exam & Readiness Sign-off';
        taskType = 'benchmark_exam';
        description = 'Simulate the full 50-question AZ-900 timed exam. Confirm overall readiness score is ≥ 700/1000.';
        recommendedQuizCount = 50;
      } else {
        topicTitle = 'Spaced Repetition & High-Yield Weak Area Review';
        taskType = 'flashcards';
        description = 'Review all flagged flashcards and study weak concepts using African real-life analogies.';
        flashcardIds = ['FC-01', 'FC-04', 'FC-08', 'FC-14', 'FC-20'];
      }
    }

    const domainMeta = DOMAIN_METADATA[domainId as keyof typeof DOMAIN_METADATA];

    tasks.push({
      id: `TASK-${i.toString().padStart(2, '0')}`,
      dayNumber: i,
      dateString,
      phaseId: assignedPhase.id,
      domainId,
      domainTitle: domainMeta ? domainMeta.title : 'Comprehensive Review',
      topicTitle,
      estimatedMinutes: dailyMinutes,
      taskType,
      description,
      flashcardIds,
      recommendedQuizCount,
      completed: false,
    });
  }

  return {
    id: `plan-${Date.now().toString(36)}`,
    createdAt: now.toISOString(),
    examDate: config.examDate,
    daysRemaining,
    totalStudyHours,
    hoursPerWeek,
    learnerLevel,
    paceAssessment: {
      status: paceStatus,
      recommendation: paceRecommendation,
      dailyMinutes,
    },
    phases,
    tasks,
    domainAllocations: finalAllocations,
  };
}

/**
 * Save study plan to localStorage
 */
export function saveStoredStudyPlan(plan: GeneratedStudyPlan | null): void {
  try {
    if (!plan) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    }
  } catch {
    // Ignore storage quota
  }
}

/**
 * Retrieve stored study plan from localStorage
 */
export function getStoredStudyPlan(): GeneratedStudyPlan | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Generate standard iCalendar (.ics) export for calendar integration
 */
export function exportStudyPlanToICal(plan: GeneratedStudyPlan): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CloudFix//AZ-900 Personal Study Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:AZ-900 Exam Prep Schedule',
    'X-WR-TIMEZONE:UTC',
  ];

  for (const task of plan.tasks) {
    const cleanDate = task.dateString.replace(/-/g, '');
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${task.id}-${plan.id}@cloudfix.edu`);
    lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    lines.push(`DTSTART;VALUE=DATE:${cleanDate}`);
    lines.push(`SUMMARY:AZ-900 Day ${task.dayNumber}: ${task.topicTitle}`);
    lines.push(`DESCRIPTION:${task.description} (${task.estimatedMinutes} mins)`);
    lines.push(`CATEGORIES:AZ-900,Certification,CloudFix`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  }

  // Exam Day Event
  const examCleanDate = plan.examDate.replace(/-/g, '');
  lines.push('BEGIN:VEVENT');
  lines.push(`UID:exam-day-${plan.id}@cloudfix.edu`);
  lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
  lines.push(`DTSTART;VALUE=DATE:${examCleanDate}`);
  lines.push('SUMMARY:🎯 AZ-900 Microsoft Azure Fundamentals Exam Day!');
  lines.push('DESCRIPTION:Official exam appointment. Review final key flashcards and pass with confidence (Passing Cutoff: 700/1000).');
  lines.push('PRIORITY:1');
  lines.push('END:VEVENT');

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
