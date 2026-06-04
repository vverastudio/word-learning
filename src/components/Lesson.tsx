import { useState, useEffect, useCallback, useRef } from "react";
import type { WordEntry } from "../types.ts";
import { loadProgress, recordGuess, getScore } from "../store.ts";
import { useSound } from "../hooks/useSound.ts";
import { useTTS } from "../hooks/useTTS.ts";
import { useConfetti } from "typegpu-confetti/react";

interface LessonProps {
  words: WordEntry[];
  onDone: () => void;
}

interface LessonWord extends WordEntry {
  correctlyGuessed: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickOptions(pool: WordEntry[], correct: WordEntry): WordEntry[] {
  const others = pool.filter((w) => w.word !== correct.word);
  const shuffled = shuffle(others);
  const distractors = shuffled.slice(0, 3);
  return shuffle([correct, ...distractors]);
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.49 4.49 0 0 0 2.5-3.5zM14 3.23v2.06a7.007 7.007 0 0 1 0 13.42v2.06A9.01 9.01 0 0 0 14 3.23z" />
    </svg>
  );
}

export function Lesson({ words, onDone }: LessonProps) {
  const { play } = useSound();
  const { speak } = useTTS();
  const confettiRef = useConfetti();

  const [lessonWords, setLessonWords] = useState<LessonWord[]>(() =>
    words.map((w) => ({ ...w, correctlyGuessed: false })),
  );
  const [currentBatch, setCurrentBatch] = useState<WordEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<WordEntry[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const current = currentBatch[currentIndex];
  const revealedRef = useRef(false);

  const pickBatch = useCallback(() => {
    const progress = loadProgress();
    const unscored = lessonWords.filter((w) => !w.correctlyGuessed);
    if (unscored.length === 0) {
      setIsDone(true);
      return;
    }
    const sorted = shuffle(unscored).sort(
      (a, b) => getScore(progress[a.word]) - getScore(progress[b.word]),
    );
    const batch = sorted.slice(0, 4);
    setCurrentBatch(batch);
    setCurrentIndex(0);
    setSelectedWord(null);
    setRevealed(false);
    revealedRef.current = false;
    setOptions(pickOptions(words, batch[0]));
  }, [lessonWords, words]);

  useEffect(() => {
    pickBatch();
  }, [pickBatch]);

  useEffect(() => {
    if (revealed && current && !revealedRef.current) {
      revealedRef.current = true;
      speak(current.word);
    }
  }, [revealed, current, speak]);

  function handleSelect(entry: WordEntry) {
    if (revealed) return;
    play("click");
    setSelectedWord(entry.word);
    setRevealed(true);

    if (entry.word === current.word) {
      play("success");
      confettiRef?.current?.addParticles(80);
      recordGuess(current.word, true);
      setLessonWords((prev) =>
        prev.map((w) => (w.word === current.word ? { ...w, correctlyGuessed: true } : w)),
      );
    } else {
      play("mistake");
      recordGuess(current.word, false);
    }
  }

  function handleNext() {
    if (currentIndex < currentBatch.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setSelectedWord(null);
      setRevealed(false);
      revealedRef.current = false;
      setOptions(pickOptions(words, currentBatch[nextIndex]));
    } else {
      const allDone = lessonWords.every((w) => w.correctlyGuessed);
      if (allDone) {
        setIsDone(true);
      } else {
        pickBatch();
      }
    }
  }

  function handleSpeakWord(word: string) {
    speak(word);
  }

  if (isDone) {
    return (
      <div className="lesson-done">
        <h2>Lesson Complete!</h2>
        <p>All words have been correctly identified.</p>
        <button type="button" className="btn btn-primary" onClick={onDone}>
          Back to Menu
        </button>
      </div>
    );
  }

  if (!current) return null;

  const remaining = lessonWords.filter((w) => !w.correctlyGuessed).length;

  return (
    <div className="lesson">
      <div className="lesson-header">
        <span className="lesson-progress">
          {remaining} word{remaining !== 1 ? "s" : ""} remaining
        </span>
      </div>

      <div className="card">
        <p className="card-description">{current.description}</p>
        <p className="card-hint">select the correct English word</p>
        <button
          type="button"
          className="card-sound"
          onClick={(e) => {
            e.stopPropagation();
            handleSpeakWord(current.word);
          }}
          title="Listen"
        >
          <SpeakerIcon />
        </button>
      </div>

      <div className="options">
        {options.map((entry) => {
          let cls = "option";
          if (revealed && entry.word === current.word) {
            cls += " correct";
          } else if (revealed && entry.word === selectedWord) {
            cls += " wrong";
          }

          return (
            <div className="option-cell" key={entry.word}>
              <button
                type="button"
                className={cls}
                onClick={() => handleSelect(entry)}
                disabled={revealed}
              >
                {entry.word}
              </button>
              <button
                type="button"
                className="sound-btn"
                onClick={() => handleSpeakWord(entry.word)}
                title="Listen"
              >
                <SpeakerIcon />
              </button>
            </div>
          );
        })}
      </div>

      {revealed && (
        <button type="button" className="btn btn-secondary next-btn" onClick={handleNext}>
          {currentIndex < currentBatch.length - 1 ? "Next" : "Next Batch"}
        </button>
      )}
    </div>
  );
}
