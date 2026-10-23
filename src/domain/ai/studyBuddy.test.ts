/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  askStudyBuddy,
  CURATED_AFRICAN_ANALOGIES,
  SUPPORTED_LANGUAGES,
  RAFIKI_SYSTEM_PROMPT,
} from './studyBuddy.ts';

describe('AI Study Buddy (Rafiki) Domain Logic & Prompt Engineering', () => {
  it('includes high-yield curated African analogies covering all 3 AZ-900 domains', () => {
    expect(CURATED_AFRICAN_ANALOGIES.length).toBeGreaterThanOrEqual(8);

    const domains = new Set(CURATED_AFRICAN_ANALOGIES.map((a) => a.domainId));
    expect(domains.has('DOM-CONCEPTS')).toBe(true);
    expect(domains.has('DOM-SERVICES')).toBe(true);
    expect(domains.has('DOM-SECURITY')).toBe(true);
  });

  it('delivers African analogy for IaaS vs PaaS vs SaaS without requiring network API key', async () => {
    const res = await askStudyBuddy({
      topicOrQuestion: 'IaaS vs PaaS vs SaaS',
      language: 'en',
    });

    expect(res.answer).toContain('Farmland');
    expect(res.answer).toMatch(/kitchen/i);
    expect(res.answer).toContain('Key Exam Takeaway');
    expect(res.suggestedFollowUps.length).toBeGreaterThan(0);
  });

  it('delivers Nigerian Pidgin localized response when requested', async () => {
    const res = await askStudyBuddy({
      topicOrQuestion: 'CapEx vs OpEx',
      language: 'pcm',
    });

    expect(res.answer).toContain('Cloud Padi');
    expect(res.answer).toContain('Generator');
    expect(res.language).toBe('pcm');
  });

  it('supports major African languages and dialects', () => {
    const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
    expect(codes).toContain('sw'); // Swahili
    expect(codes).toContain('pcm'); // Pidgin
    expect(codes).toContain('yo'); // Yoruba
    expect(codes).toContain('am'); // Amharic
    expect(codes).toContain('zu'); // Zulu
    expect(codes).toContain('fr'); // French
  });

  it('enforces culturally grounded prompt engineering instructions in system prompt', () => {
    expect(RAFIKI_SYSTEM_PROMPT).toContain('M-Pesa');
    expect(RAFIKI_SYSTEM_PROMPT).toContain('Everyday African Analogy');
    expect(RAFIKI_SYSTEM_PROMPT).toContain('Key Exam Takeaway for AZ-900');
    expect(RAFIKI_SYSTEM_PROMPT).toContain('Common Pitfall');
  });
});
