/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AZ900_FLASHCARD_DECK,
  Flashcard,
  getStoredFlashcardMastery,
  toggleCardMastery,
  resetFlashcardMastery,
  computeFlashcardStats,
} from '../../../domain/flashcards/flashcardDeck.ts';
import { Card } from '../../components/Card.tsx';
import { Button } from '../../components/Button.tsx';
import { Badge } from '../../components/Badge.tsx';
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle2,
  Bookmark,
  Sparkles,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  RotateCcw,
  Layers,
  BookOpen,
  Briefcase,
} from 'lucide-react';

export interface FlashcardViewerProps {
  readonly onStartQuizWithDomain?: (domainId: string | null) => void;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
  onStartQuizWithDomain,
}) => {
  const [mastery, setMastery] = useState<Record<string, boolean>>({});
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'unmastered'>('all');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [deck, setDeck] = useState<readonly Flashcard[]>(AZ900_FLASHCARD_DECK);

  // Initialize mastery from localStorage
  useEffect(() => {
    setMastery(getStoredFlashcardMastery());
  }, []);

  // Filtered cards based on domain and mastery filter
  const filteredCards = useMemo(() => {
    return deck.filter((card) => {
      if (selectedDomain && card.domainId !== selectedDomain) {
        return false;
      }
      if (filterMode === 'unmastered' && mastery[card.id]) {
        return false;
      }
      return true;
    });
  }, [deck, selectedDomain, filterMode, mastery]);

  // Ensure currentIndex stays within bounds when filters change
  useEffect(() => {
    if (currentIndex >= filteredCards.length) {
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [filteredCards.length, currentIndex]);

  const currentCard: Flashcard | undefined = filteredCards[currentIndex];
  const isCurrentMastered = currentCard ? !!mastery[currentCard.id] : false;

  const stats = useMemo(() => {
    return computeFlashcardStats(AZ900_FLASHCARD_DECK, mastery);
  }, [mastery]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  }, [filteredCards.length]);

  const handlePrevious = useCallback(() => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  }, [filteredCards.length]);

  const handleToggleMastery = useCallback(() => {
    if (!currentCard) return;
    const newStatus = toggleCardMastery(currentCard.id);
    setMastery((prev) => {
      const next = { ...prev };
      if (newStatus) {
        next[currentCard.id] = true;
      } else {
        delete next[currentCard.id];
      }
      return next;
    });
  }, [currentCard]);

  const handleShuffle = () => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = temp;
    }
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleResetMastery = () => {
    if (window.confirm('Reset mastery progress for all 40 flashcards?')) {
      resetFlashcardMastery();
      setMastery({});
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        handleToggleMastery();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrevious, handleToggleMastery]);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Deck Header & Stats Banner */}
      <Card className="border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-600 text-white rounded-xl shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  AZ-900 High-Yield Flashcards
                </h2>
                <Badge variant="info">40 CORE CONCEPTS</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Master critical definitions, architectural trade-offs, and exam traps with active recall.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Button
              size="sm"
              variant="outline"
              onClick={handleShuffle}
              className="flex items-center gap-1.5 text-xs py-1.5"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle Deck</span>
            </Button>
            {stats.masteredCards > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleResetMastery}
                className="flex items-center gap-1.5 text-xs py-1.5 text-slate-500 hover:text-rose-500"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mastery Progress Bar */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span
              data-testid="mastery-progress-label"
              className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>
                Mastery: <span className="font-mono tabular-nums">{stats.masteredCards}</span> / <span className="font-mono tabular-nums">{stats.totalCards}</span> cards (<span className="font-mono tabular-nums">{stats.masteredPercentage}%</span>)
              </span>
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-mono tabular-nums">{stats.totalCards - stats.masteredCards} still learning</span>
              {onStartQuizWithDomain && (
                <button
                  type="button"
                  onClick={() => onStartQuizWithDomain(selectedDomain)}
                  className="text-sky-700 dark:text-sky-300 hover:underline font-semibold"
                >
                  Test in Quiz →
                </button>
              )}
            </div>
          </div>

          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${stats.masteredPercentage}%` }}
              className="h-full bg-sky-600 transition-all duration-500"
            />
          </div>
        </div>

        {/* Filter Controls (Domain + Study Mode) */}
        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Domain Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setSelectedDomain(null)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                selectedDomain === null
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm font-semibold'
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              All Domains (40)
            </button>
            <button
              type="button"
              onClick={() => setSelectedDomain('DOM-CONCEPTS')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                selectedDomain === 'DOM-CONCEPTS'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm font-semibold'
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              Cloud Concepts (13)
            </button>
            <button
              type="button"
              onClick={() => setSelectedDomain('DOM-SERVICES')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                selectedDomain === 'DOM-SERVICES'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm font-semibold'
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              Azure Architecture (14)
            </button>
            <button
              type="button"
              onClick={() => setSelectedDomain('DOM-SECURITY')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                selectedDomain === 'DOM-SECURITY'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm font-semibold'
                  : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              Security & Pricing (13)
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Cards
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('unmastered')}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                filterMode === 'unmastered'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Review Unmastered Only
            </button>
          </div>
        </div>
      </Card>

      {/* Main Flashcard Stage */}
      {filteredCards.length === 0 ? (
        <Card className="text-center py-12 space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            All cards in this category are mastered!
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            You have marked all cards in this view as mastered. Switch to "All Cards" or select another domain to continue reviewing.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFilterMode('all')}
            className="mt-2"
          >
            Show All Cards
          </Button>
        </Card>
      ) : currentCard ? (
        <div className="space-y-4">
          {/* Card Meta & Mastery Status Bar */}
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                Card {currentIndex + 1} of {filteredCards.length}
              </span>
              <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
              <span className="text-[11px] text-sky-700 dark:text-sky-300 font-semibold">
                {currentCard.domainTitle}
              </span>
              <span className="text-slate-300 dark:text-slate-700 hidden sm:inline" aria-hidden="true">·</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                {currentCard.category}
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleMastery}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
                isCurrentMastered
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrentMastered ? 'fill-current text-emerald-500' : ''}`} />
              <span>{isCurrentMastered ? 'Mastered' : 'Mark as Mastered (M)'}</span>
            </button>
          </div>

          {/* Interactive Flip Card (3D perspective container) */}
          <div
            data-testid="flip-card-container"
            role="button"
            tabIndex={0}
            onClick={handleFlip}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleFlip();
              }
            }}
            aria-label={`${isFlipped ? 'Card back: ' + currentCard.definition : 'Card front: ' + currentCard.term}. Click or press space to flip.`}
            className="w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-2xl transition-transform active:scale-[0.99]"
            style={{ perspective: '1200px' }}
          >
            <div
              className="relative w-full rounded-2xl border border-slate-200/90 dark:border-slate-800/90 transition-all duration-500 shadow-md min-h-[340px] sm:min-h-[320px] flex flex-col justify-between overflow-hidden"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* ================= CARD FRONT ================= */}
              <div
                className={`p-6 sm:p-8 flex flex-col justify-between bg-white dark:bg-slate-900 transition-colors ${
                  isFlipped ? 'hidden' : 'block'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 uppercase tracking-widest">
                      {currentCard.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {currentCard.id}
                    </span>
                  </div>

                  <div className="pt-4 pb-2">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {currentCard.term}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                      Can you articulate the core definition, key architectural differentiators, and typical AZ-900 exam traps for this concept?
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 font-semibold">
                    <RotateCw className="w-4 h-4 animate-spin-slow" />
                    <span>Click to reveal definition & exam takeaways</span>
                  </span>
                  <span className="text-[11px] hidden sm:inline text-slate-400">
                    Shortcut: [Space] to flip
                  </span>
                </div>
              </div>

              {/* ================= CARD BACK ================= */}
              <div
                className={`p-6 sm:p-8 flex flex-col justify-between bg-slate-50 dark:bg-slate-950 transition-colors ${
                  isFlipped ? 'block' : 'hidden'
                }`}
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                    <div>
                      <h4 className="font-display text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        {currentCard.term}
                      </h4>
                      <span className="text-[10px] text-sky-700 dark:text-sky-300 uppercase tracking-wider font-semibold">
                        {currentCard.domainTitle} · {currentCard.category}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFlip();
                      }}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      title="Flip back to front"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Core Definition */}
                  <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                    {currentCard.definition}
                  </div>

                  {/* Key Architecture Details */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                      Key Architectural Differentiators:
                    </span>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                      {currentCard.keyDetails.map((detail, idx) => (
                        <li key={idx} className="leading-snug">
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Real-World Architectural Scenario Note */}
                  {currentCard.scenarioNote && (
                    <div className="p-3 bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800/60 rounded-xl space-y-1 text-xs text-sky-950 dark:text-sky-200">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] text-sky-800 dark:text-sky-300">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>SCENARIO NOTE</span>
                      </div>
                      <p className="leading-relaxed">{currentCard.scenarioNote}</p>
                    </div>
                  )}

                  {/* High Yield Exam Tip */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1 text-xs text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-700 dark:text-amber-400">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>EXAM TIP</span>
                    </div>
                    <p className="leading-relaxed">{currentCard.examTip}</p>
                  </div>

                  {/* Common Trap / Pitfall */}
                  {currentCard.commonPitfall && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1 text-xs text-rose-900 dark:text-rose-200">
                      <div className="flex items-center gap-1.5 font-bold text-[11px] text-rose-700 dark:text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>COMMON PITFALL</span>
                      </div>
                      <p className="leading-relaxed">{currentCard.commonPitfall}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="text-[11px]">Click anywhere to flip front</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMastery();
                      }}
                      className="text-xs text-sky-700 dark:text-sky-300 hover:underline font-semibold"
                    >
                      {isCurrentMastered ? 'Mark Unmastered' : 'Mark Mastered (M)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls Bar */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              className="flex items-center gap-1.5 text-xs px-4"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous (←)</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                data-testid="flip-action-btn"
                variant="outline"
                size="sm"
                onClick={handleFlip}
                className="flex items-center gap-1.5 text-xs px-4"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>{isFlipped ? 'View Term (Space)' : 'View Answer (Space)'}</span>
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              className="flex items-center gap-1.5 text-xs px-4"
            >
              <span>Next (→)</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Keyboard Navigation Shortcuts Bar */}
          <div className="pt-2 text-center text-[11px] text-slate-400 dark:text-slate-500 flex flex-wrap items-center justify-center gap-4">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">Space</kbd> Flip
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">←</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">→</kbd> Prev / Next
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">M</kbd> Toggle Mastered
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};
