/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import {
  PRESET_SCENARIO_QUIZZES,
  getPresetScenarioQuizzes,
  getPresetQuizById,
  generateQuestionsForPreset,
} from './presetQuizzes.ts';

describe('Preset Scenario Quizzes Domain Model', () => {
  it('provides at least 10 distinct scenario-based preset quizzes', () => {
    const quizzes = getPresetScenarioQuizzes();
    expect(quizzes.length).toBeGreaterThanOrEqual(10);
    expect(quizzes.length).toBe(10);
  });

  it('verifies that each quiz has complete scenario metadata and valid questions', () => {
    const quizzes = getPresetScenarioQuizzes();

    quizzes.forEach((quiz) => {
      expect(quiz.id).toBeDefined();
      expect(quiz.id.length).toBeGreaterThan(0);
      expect(quiz.title).toBeDefined();
      expect(quiz.subtitle).toBeDefined();
      expect(quiz.scenarioEnterprise).toBeDefined();
      expect(quiz.scenarioContext.length).toBeGreaterThan(20);
      expect(quiz.questionCount).toBeGreaterThanOrEqual(15);
      expect(quiz.timeLimitMinutes).toBeGreaterThanOrEqual(15);
      expect(['Foundational', 'Intermediate', 'Advanced']).toContain(quiz.difficulty);
      expect(quiz.keyThemes.length).toBeGreaterThanOrEqual(3);

      const generatedQuestions = generateQuestionsForPreset(quiz, { shuffle: false });
      expect(generatedQuestions.length).toBe(quiz.questionCount);

      if (quiz.domainId) {
        generatedQuestions.forEach((q) => {
          expect(q.domainId).toBe(quiz.domainId);
        });
      }
    });
  });

  it('retrieves a specific quiz by ID', () => {
    const haDrQuiz = getPresetQuizById('quiz-preset-ha-dr');
    expect(haDrQuiz).toBeDefined();
    expect(haDrQuiz?.scenarioEnterprise).toBe('Fabrikam Global Logistics');
    expect(haDrQuiz?.questionCount).toBe(20);
    expect(haDrQuiz?.timeLimitMinutes).toBe(20);

    const nonExistent = getPresetQuizById('quiz-unknown-999');
    expect(nonExistent).toBeUndefined();
  });

  it('verifies full mock exam covers all 50 questions balanced across domains', () => {
    const mockExam = getPresetQuizById('quiz-preset-full-mock-exam');
    expect(mockExam).toBeDefined();
    expect(mockExam?.questionCount).toBe(50);
    expect(mockExam?.timeLimitMinutes).toBe(45);
    expect(mockExam?.domainId).toBeNull();

    const questions = generateQuestionsForPreset(mockExam!);
    expect(questions.length).toBe(50);
  });
});
