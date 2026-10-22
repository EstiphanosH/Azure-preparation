/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  AZ900_FLASHCARD_DECK,
  getStoredFlashcardMastery,
  toggleCardMastery,
  resetFlashcardMastery,
  computeFlashcardStats,
} from './flashcardDeck.ts';

describe('AZ-900 Flashcards Domain & Mastery', () => {
  beforeEach(() => {
    resetFlashcardMastery();
  });

  it('contains at least 35 high-yield curated flashcards across all 3 AZ-900 domains', () => {
    expect(AZ900_FLASHCARD_DECK.length).toBeGreaterThanOrEqual(35);

    const domains = new Set(AZ900_FLASHCARD_DECK.map((c) => c.domainId));
    expect(domains.has('DOM-CONCEPTS')).toBe(true);
    expect(domains.has('DOM-SERVICES')).toBe(true);
    expect(domains.has('DOM-SECURITY')).toBe(true);
  });

  it('ensures all flashcard IDs are unique and non-empty', () => {
    const ids = AZ900_FLASHCARD_DECK.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);

    for (const card of AZ900_FLASHCARD_DECK) {
      expect(card.id).toBeTruthy();
      expect(card.term.trim()).not.toBe('');
      expect(card.definition.trim()).not.toBe('');
      expect(card.examTip.trim()).not.toBe('');
      expect(card.keyDetails.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('correctly toggles card mastery and persists in localStorage', () => {
    const cardId = 'FC-01';
    expect(getStoredFlashcardMastery()[cardId]).toBeFalsy();

    const isMastered = toggleCardMastery(cardId);
    expect(isMastered).toBe(true);
    expect(getStoredFlashcardMastery()[cardId]).toBe(true);

    const isUnmastered = toggleCardMastery(cardId);
    expect(isUnmastered).toBe(false);
    expect(getStoredFlashcardMastery()[cardId]).toBeFalsy();
  });

  it('computes accurate mastery statistics across domains', () => {
    const mockMastery: Record<string, boolean> = {
      'FC-01': true,
      'FC-02': true,
      'FC-14': true,
    };

    const stats = computeFlashcardStats(AZ900_FLASHCARD_DECK, mockMastery);
    expect(stats.totalCards).toBe(AZ900_FLASHCARD_DECK.length);
    expect(stats.masteredCards).toBe(3);
    expect(stats.masteredPercentage).toBe(
      Math.round((3 / AZ900_FLASHCARD_DECK.length) * 100)
    );

    const concepts = stats.domainBreakdown.find((d) => d.domainId === 'DOM-CONCEPTS');
    expect(concepts).toBeDefined();
    expect(concepts?.mastered).toBe(2);
  });

  it('resets mastery correctly', () => {
    toggleCardMastery('FC-01');
    toggleCardMastery('FC-02');
    expect(Object.keys(getStoredFlashcardMastery()).length).toBe(2);

    resetFlashcardMastery();
    expect(Object.keys(getStoredFlashcardMastery()).length).toBe(0);
  });
});
