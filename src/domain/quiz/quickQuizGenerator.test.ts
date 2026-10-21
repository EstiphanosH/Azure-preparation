/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateQuickQuizQuestions,
  getQuickQuizHistory,
  saveQuickQuizRecord,
  clearQuickQuizHistory,
  computeQuickQuizStats,
  QuickQuizRecord,
} from './quickQuizGenerator.ts';

describe('Quick Quiz Generator & Progress Tracker', () => {
  beforeEach(() => {
    clearQuickQuizHistory();
  });

  describe('generateQuickQuizQuestions', () => {
    it('generates exactly 50 multiple-choice questions by default', () => {
      const questions = generateQuickQuizQuestions({ count: 50 });
      expect(questions.length).toBe(50);
    });

    it('generates questions covering all core AZ-900 domains: Cloud Concepts, Security, and Architecture', () => {
      const questions = generateQuickQuizQuestions({ count: 50, shuffle: false });
      const domains = new Set(questions.map((q) => q.domainId));

      expect(domains.has('DOM-CONCEPTS' as any)).toBe(true);
      expect(domains.has('DOM-SECURITY' as any)).toBe(true);
      expect(domains.has('DOM-SERVICES' as any)).toBe(true);

      const conceptsCount = questions.filter((q) => q.domainId === 'DOM-CONCEPTS').length;
      const securityCount = questions.filter((q) => q.domainId === 'DOM-SECURITY').length;
      const servicesCount = questions.filter((q) => q.domainId === 'DOM-SERVICES').length;

      expect(conceptsCount).toBeGreaterThanOrEqual(10);
      expect(securityCount).toBeGreaterThanOrEqual(10);
      expect(servicesCount).toBeGreaterThanOrEqual(10);
      expect(conceptsCount + securityCount + servicesCount).toBe(50);
    });

    it('supports domain-specific focused Quick Quizzes', () => {
      const conceptsOnly = generateQuickQuizQuestions({ count: 15, domainFilter: 'DOM-CONCEPTS' });
      expect(conceptsOnly.length).toBe(15);
      expect(conceptsOnly.every((q) => q.domainId === 'DOM-CONCEPTS')).toBe(true);

      const securityOnly = generateQuickQuizQuestions({ count: 15, domainFilter: 'DOM-SECURITY' });
      expect(securityOnly.length).toBe(15);
      expect(securityOnly.every((q) => q.domainId === 'DOM-SECURITY')).toBe(true);
    });

    it('ensures every generated question has 4 valid options, an explanation, and source theme', () => {
      const questions = generateQuickQuizQuestions({ count: 50 });
      for (const q of questions) {
        expect(q.options.length).toBe(4);
        expect(q.prompt.length).toBeGreaterThan(15);
        expect(q.explanation.length).toBeGreaterThan(15);
        expect([0, 1, 2, 3]).toContain(q.correctAnswerIndex);
      }
    });
  });

  describe('Quick Quiz Progress Tracking & Stats', () => {
    it('returns empty stats baseline when no history exists', () => {
      const stats = computeQuickQuizStats([]);
      expect(stats.totalCompleted).toBe(0);
      expect(stats.bestScore).toBe(0);
      expect(stats.averageScore).toBe(0);
      expect(stats.readinessStatus).toBe('NEEDS_PRACTICE');
    });

    it('records and computes accurate scores, averages, and readiness status across sessions', () => {
      const mockRecord1: QuickQuizRecord = {
        sessionId: 'sess-q1',
        date: 'Oct 21, 10:00 AM',
        score: 82,
        correctCount: 41,
        totalQuestions: 50,
        grade: 'READY',
        domainBreakdown: [
          { domainId: 'DOM-CONCEPTS', domainTitle: 'Cloud Concepts', correct: 13, total: 15, percentage: 86.7 },
          { domainId: 'DOM-SECURITY', domainTitle: 'Security & Pricing', correct: 14, total: 17, percentage: 82.4 },
          { domainId: 'DOM-SERVICES', domainTitle: 'Azure Architecture', correct: 14, total: 18, percentage: 77.8 },
        ],
      };

      const mockRecord2: QuickQuizRecord = {
        sessionId: 'sess-q2',
        date: 'Oct 21, 11:00 AM',
        score: 74,
        correctCount: 37,
        totalQuestions: 50,
        grade: 'READY',
        domainBreakdown: [
          { domainId: 'DOM-CONCEPTS', domainTitle: 'Cloud Concepts', correct: 12, total: 15, percentage: 80.0 },
          { domainId: 'DOM-SECURITY', domainTitle: 'Security & Pricing', correct: 12, total: 17, percentage: 70.6 },
          { domainId: 'DOM-SERVICES', domainTitle: 'Azure Architecture', correct: 13, total: 18, percentage: 72.2 },
        ],
      };

      saveQuickQuizRecord(mockRecord1);
      saveQuickQuizRecord(mockRecord2);

      const history = getQuickQuizHistory();
      expect(history.length).toBe(2);

      const stats = computeQuickQuizStats(history);
      expect(stats.totalCompleted).toBe(2);
      expect(stats.bestScore).toBe(82);
      expect(stats.averageScore).toBe(78); // (82 + 74) / 2
      expect(stats.totalQuestionsAnswered).toBe(100);
      expect(stats.readinessStatus).toBe('EXAM_READY');

      const conceptsStat = stats.domainAverages.find((d) => d.domainId === 'DOM-CONCEPTS');
      expect(conceptsStat).toBeDefined();
      expect(conceptsStat?.accuracy).toBeGreaterThan(80);
    });

    it('clears history properly on request', () => {
      const mockRecord: QuickQuizRecord = {
        sessionId: 'sess-temp',
        date: 'Today',
        score: 90,
        correctCount: 45,
        totalQuestions: 50,
        grade: 'READY',
        domainBreakdown: [],
      };
      saveQuickQuizRecord(mockRecord);
      expect(getQuickQuizHistory().length).toBe(1);

      clearQuickQuizHistory();
      expect(getQuickQuizHistory().length).toBe(0);
    });
  });
});
