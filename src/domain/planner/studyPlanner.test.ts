/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  generateStudyPlan,
  exportStudyPlanToICal,
  StudyPlanConfig,
} from './studyPlanner.ts';

describe('Personal Study Planner Domain Logic', () => {
  it('generates a 14-day study plan with balanced syllabus weighting', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);

    const config: StudyPlanConfig = {
      examDate: futureDate.toISOString().split('T')[0]!,
      hoursPerWeek: 10,
      targetScore: 700,
      weakDomains: ['DOM-SERVICES'],
      learnerLevel: 'beginner',
    };

    const plan = generateStudyPlan(config);

    expect(plan.daysRemaining).toBe(14);
    expect(plan.hoursPerWeek).toBe(10);
    expect(plan.totalStudyHours).toBeGreaterThan(0);
    expect(plan.phases).toHaveLength(4);
    expect(plan.tasks.length).toBeGreaterThan(0);

    // Verify weak domain gets allocated hours
    const serviceDomain = plan.domainAllocations.find((d) => d.domainId === 'DOM-SERVICES');
    expect(serviceDomain).toBeDefined();
    expect(serviceDomain?.isWeakArea).toBe(true);
    expect(serviceDomain?.allocatedHours).toBeGreaterThan(0);
  });

  it('adjusts pace recommendation when exam is in 3 days (Intensive Sprint)', () => {
    const sprintDate = new Date();
    sprintDate.setDate(sprintDate.getDate() + 3);

    const plan = generateStudyPlan({
      examDate: sprintDate.toISOString().split('T')[0]!,
      hoursPerWeek: 15,
    });

    expect(plan.paceAssessment.status).toBe('INTENSIVE_SPRINT');
    expect(plan.paceAssessment.recommendation).toContain('Rapid sprint required');
  });

  it('exports valid iCalendar .ics format for external calendars', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    const plan = generateStudyPlan({
      examDate: futureDate.toISOString().split('T')[0]!,
      hoursPerWeek: 8,
    });

    const icsContent = exportStudyPlanToICal(plan);

    expect(icsContent).toContain('BEGIN:VCALENDAR');
    expect(icsContent).toContain('END:VCALENDAR');
    expect(icsContent).toContain('AZ-900 Day 1');
    expect(icsContent).toContain('AZ-900 Microsoft Azure Fundamentals Exam Day');
  });
});
