import type { GuessRecord, WordProgress } from "./types.ts";

const STORAGE_KEY = "word-learning-progress";

export function loadProgress(): WordProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProgress(progress: WordProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function recordGuess(word: string, correct: boolean): WordProgress {
  const progress = loadProgress();
  const record = progress[word] ?? { guesses: [] };
  record.guesses.push(correct);
  progress[word] = record;
  saveProgress(progress);
  return progress;
}

const WINDOW_SIZE = 5;

export function getScore(record: GuessRecord | undefined): number {
  if (!record) return 0;
  if (record.guesses.length < WINDOW_SIZE) return 0;
  const recent = record.guesses.slice(-WINDOW_SIZE);
  return recent.filter(Boolean).length / recent.length;
}

export function isKnown(record: GuessRecord | undefined): boolean {
  return getScore(record) >= 0.8;
}

export function hasBeenSeen(record: GuessRecord | undefined): boolean {
  return (record?.guesses.length ?? 0) > 0;
}
