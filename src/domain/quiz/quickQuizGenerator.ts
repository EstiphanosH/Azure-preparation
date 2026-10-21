/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Question } from '../model/Question.ts';
import { SYNTHETIC_QUESTION_BANK } from '../model/QuestionBank.ts';

export interface QuickQuizDomainStat {
  readonly domainId: string;
  readonly domainTitle: string;
  readonly correct: number;
  readonly total: number;
  readonly percentage: number;
}

export interface QuickQuizRecord {
  readonly sessionId: string;
  readonly date: string;
  readonly score: number;
  readonly correctCount: number;
  readonly totalQuestions: number;
  readonly grade: 'READY' | 'REVIEW_REQUIRED' | 'NOT_READY';
  readonly domainBreakdown: readonly QuickQuizDomainStat[];
  readonly timeTakenSeconds?: number;
}

export interface QuickQuizSummaryStats {
  readonly totalCompleted: number;
  readonly bestScore: number;
  readonly averageScore: number;
  readonly totalQuestionsAnswered: number;
  readonly domainAverages: {
    readonly domainId: string;
    readonly title: string;
    readonly icon: string;
    readonly accuracy: number;
    readonly totalAnswered: number;
  }[];
  readonly readinessStatus: 'EXAM_READY' | 'PROGRESSING' | 'NEEDS_PRACTICE';
}

const STORAGE_KEY = 'cloudfix_az900_quick_quiz_history_v1';

/**
 * Generates 50 questions (or requested count) strictly from the AZ-900 Question Bank.
 * Balances questions across Cloud Concepts, Security, and Azure Pricing & Services.
 */
export function generateQuickQuizQuestions(options?: {
  readonly count?: number;
  readonly domainFilter?: string | null;
  readonly shuffle?: boolean;
}): readonly Question[] {
  const targetCount = options?.count ?? 50;
  const domainFilter = options?.domainFilter ?? null;
  const shouldShuffle = options?.shuffle ?? true;

  let pool: Question[] = [];

  if (domainFilter) {
    pool = SYNTHETIC_QUESTION_BANK.filter((q) => q.domainId === domainFilter);
  } else {
    // Balanced allocation across core AZ-900 domains:
    // ~28% Cloud Concepts (14 Qs)
    // ~37% Architecture & Services (18 Qs)
    // ~35% Security, Governance & Azure Pricing (18 Qs)
    const concepts = SYNTHETIC_QUESTION_BANK.filter((q) => q.domainId === 'DOM-CONCEPTS');
    const services = SYNTHETIC_QUESTION_BANK.filter((q) => q.domainId === 'DOM-SERVICES');
    const security = SYNTHETIC_QUESTION_BANK.filter((q) => q.domainId === 'DOM-SECURITY');

    const conceptsCount = Math.min(concepts.length, Math.round(targetCount * 0.28));
    const servicesCount = Math.min(services.length, Math.round(targetCount * 0.36));
    const securityCount = Math.min(security.length, targetCount - (conceptsCount + servicesCount));

    const selectedConcepts = shouldShuffle ? shuffleArray([...concepts]).slice(0, conceptsCount) : concepts.slice(0, conceptsCount);
    const selectedServices = shouldShuffle ? shuffleArray([...services]).slice(0, servicesCount) : services.slice(0, servicesCount);
    const selectedSecurity = shouldShuffle ? shuffleArray([...security]).slice(0, securityCount) : security.slice(0, securityCount);

    pool = [...selectedConcepts, ...selectedServices, ...selectedSecurity];
  }

  // If pool has fewer than targetCount due to filtering, fill from remaining questions
  if (pool.length < targetCount && !domainFilter) {
    const existingIds = new Set(pool.map((q) => q.id));
    const remaining = SYNTHETIC_QUESTION_BANK.filter((q) => !existingIds.has(q.id));
    pool.push(...remaining.slice(0, targetCount - pool.length));
  }

  const finalSelection = pool.slice(0, targetCount);
  return shouldShuffle ? shuffleArray(finalSelection) : finalSelection;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = temp;
  }
  return arr;
}

/**
 * Retrieves past Quick Quiz attempt records from localStorage.
 */
export function getQuickQuizHistory(): QuickQuizRecord[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Saves a new Quick Quiz completion record to localStorage.
 */
export function saveQuickQuizRecord(record: QuickQuizRecord): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const history = getQuickQuizHistory();
    const updated = [record, ...history].slice(0, 30); // Keep last 30 sessions
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota or access errors gracefully
  }
}

/**
 * Clears all stored Quick Quiz history records.
 */
export function clearQuickQuizHistory(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Computes aggregate candidate progress metrics from Quick Quiz history.
 */
export function computeQuickQuizStats(records: readonly QuickQuizRecord[]): QuickQuizSummaryStats {
  if (!records || records.length === 0) {
    return {
      totalCompleted: 0,
      bestScore: 0,
      averageScore: 0,
      totalQuestionsAnswered: 0,
      domainAverages: [
        { domainId: 'DOM-CONCEPTS', title: 'Cloud Concepts', icon: '☁️', accuracy: 0, totalAnswered: 0 },
        { domainId: 'DOM-SECURITY', title: 'Security & Identity', icon: '🛡️', accuracy: 0, totalAnswered: 0 },
        { domainId: 'DOM-SERVICES', title: 'Azure Architecture & Services', icon: '⚡', accuracy: 0, totalAnswered: 0 },
        { domainId: 'DOM-PRICING', title: 'Azure Pricing & Governance', icon: '💰', accuracy: 0, totalAnswered: 0 },
      ],
      readinessStatus: 'NEEDS_PRACTICE',
    };
  }

  const totalCompleted = records.length;
  let maxScore = 0;
  let totalScoreSum = 0;
  let totalQuestionsAnswered = 0;

  // Domain accumulator maps
  const domainTotals: Record<string, { correct: number; total: number; title: string }> = {
    'DOM-CONCEPTS': { correct: 0, total: 0, title: 'Cloud Concepts' },
    'DOM-SECURITY': { correct: 0, total: 0, title: 'Security & Identity' },
    'DOM-SERVICES': { correct: 0, total: 0, title: 'Azure Architecture & Services' },
  };

  for (const rec of records) {
    if (rec.score > maxScore) maxScore = rec.score;
    totalScoreSum += rec.score;
    totalQuestionsAnswered += rec.totalQuestions;

    if (rec.domainBreakdown) {
      for (const d of rec.domainBreakdown) {
        if (!domainTotals[d.domainId]) {
          domainTotals[d.domainId] = { correct: 0, total: 0, title: d.domainTitle };
        }
        domainTotals[d.domainId].correct += d.correct;
        domainTotals[d.domainId].total += d.total;
      }
    }
  }

  const averageScore = Math.round(totalScoreSum / totalCompleted);

  const domainAverages = [
    {
      domainId: 'DOM-CONCEPTS',
      title: 'Cloud Concepts',
      icon: '☁️',
      accuracy: domainTotals['DOM-CONCEPTS'] && domainTotals['DOM-CONCEPTS'].total > 0
        ? Math.round((domainTotals['DOM-CONCEPTS'].correct / domainTotals['DOM-CONCEPTS'].total) * 100)
        : 0,
      totalAnswered: domainTotals['DOM-CONCEPTS'] ? domainTotals['DOM-CONCEPTS'].total : 0,
    },
    {
      domainId: 'DOM-SECURITY',
      title: 'Security, Identity & Governance',
      icon: '🛡️',
      accuracy: domainTotals['DOM-SECURITY'] && domainTotals['DOM-SECURITY'].total > 0
        ? Math.round((domainTotals['DOM-SECURITY'].correct / domainTotals['DOM-SECURITY'].total) * 100)
        : 0,
      totalAnswered: domainTotals['DOM-SECURITY'] ? domainTotals['DOM-SECURITY'].total : 0,
    },
    {
      domainId: 'DOM-SERVICES',
      title: 'Azure Architecture & Services',
      icon: '⚡',
      accuracy: domainTotals['DOM-SERVICES'] && domainTotals['DOM-SERVICES'].total > 0
        ? Math.round((domainTotals['DOM-SERVICES'].correct / domainTotals['DOM-SERVICES'].total) * 100)
        : 0,
      totalAnswered: domainTotals['DOM-SERVICES'] ? domainTotals['DOM-SERVICES'].total : 0,
    },
  ];

  let readinessStatus: 'EXAM_READY' | 'PROGRESSING' | 'NEEDS_PRACTICE' = 'NEEDS_PRACTICE';
  if (averageScore >= 70 && domainAverages.every((d) => d.accuracy >= 60 || d.totalAnswered === 0)) {
    readinessStatus = 'EXAM_READY';
  } else if (averageScore >= 50) {
    readinessStatus = 'PROGRESSING';
  }

  return {
    totalCompleted,
    bestScore: maxScore,
    averageScore,
    totalQuestionsAnswered,
    domainAverages,
    readinessStatus,
  };
}
