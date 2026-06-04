import { useState } from "react";
import type { WordEntry } from "../types.ts";
import { useTTS } from "../hooks/useTTS.ts";
import { useSound } from "../hooks/useSound.ts";

interface RevisionProps {
  words: WordEntry[];
  onDone: () => void;
}

interface RevisionResult {
  word: WordEntry;
  answer: string;
  grade: number;
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.49 4.49 0 0 0 2.5-3.5zM14 3.23v2.06a7.007 7.007 0 0 1 0 13.42v2.06A9.01 9.01 0 0 0 14 3.23z" />
    </svg>
  );
}

function gradeAnswer(answer: string, correct: string): number {
  const a = answer.trim().toLowerCase();
  const c = correct.trim().toLowerCase();
  if (a === c) return 1;

  const la = a.split(/\s+/);
  const lc = c.split(/\s+/);
  if (la.length !== lc.length) {
    const maxLen = Math.max(la.length, lc.length);
    let matches = 0;
    for (let i = 0; i < Math.min(la.length, lc.length); i++) {
      if (la[i] === lc[i]) matches++;
    }
    const overlap = la.filter((w) => lc.includes(w)).length;
    const maxOverlap = Math.max(la.length, lc.length);
    return Math.max(matches / maxLen, overlap / maxOverlap);
  }

  let matches = 0;
  for (let i = 0; i < la.length; i++) {
    if (la[i] === lc[i]) matches++;
  }
  return matches / lc.length;
}

export function Revision({ words, onDone }: RevisionProps) {
  const { speak } = useTTS();
  const { play } = useSound();

  const [queue] = useState<WordEntry[]>(() => [...words].sort(() => Math.random() - 0.5));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<RevisionResult[]>([]);

  const current = queue[currentIndex];

  function handleSubmit() {
    if (input.trim() === "") return;
    play("click");
    const grade = gradeAnswer(input, current.word);
    if (grade >= 0.9) {
      play("success");
    } else if (grade > 0) {
      play("mistake");
    }
    setResults((prev) => [...prev, { word: current, answer: input, grade }]);
    setSubmitted(true);
  }

  function handleNext() {
    play("swoosh");
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((i) => i + 1);
      setInput("");
      setSubmitted(false);
    } else {
      setSubmitted(false);
      setInput("");
      setCurrentIndex((i) => i + 1);
    }
  }

  function handleSpeakWord(word: string) {
    speak(word);
  }

  if (results.length === words.length) {
    const totalGrade = results.reduce((s, r) => s + r.grade, 0) / results.length;
    const percent = Math.round(totalGrade * 100);
    return (
      <div className="revision-done">
        <h2>Revision Complete!</h2>
        <p className="grade">
          Grade: <strong>{percent}%</strong>
        </p>
        <div className="revision-results">
          {results.map((r) => (
            <div className="revision-row" key={r.word.word}>
              <span className="rev-word">{r.word.word}</span>
              <span className="rev-answer">{r.answer}</span>
              <span className="rev-grade">{r.word.description}</span>
              <span
                className={`rev-score ${r.grade === 1 ? "perfect" : r.grade >= 0.5 ? "partial" : "poor"}`}
              >
                {Math.round(r.grade * 100)}%
              </span>
            </div>
          ))}
        </div>
        <button type="button" className="btn btn-primary" onClick={onDone}>
          Back to Menu
        </button>
      </div>
    );
  }

  if (!current) return null;

  const progress = results.length;

  return (
    <div className="revision">
      <div className="revision-header">
        <span className="revision-progress">
          {progress + 1} / {words.length}
        </span>
      </div>

      <div className="card">
        <p className="card-description">{current.description}</p>
        <p className="card-hint">type the English word</p>
        <button
          type="button"
          className="card-sound"
          onClick={() => handleSpeakWord(current.word)}
          title="Listen"
        >
          <SpeakerIcon />
        </button>
      </div>

      <form
        className="revision-input-area"
        onSubmit={(e) => {
          e.preventDefault();
          if (!submitted) handleSubmit();
        }}
      >
        <input
          type="text"
          className="revision-input"
          value={input}
          onChange={(e) => setInput((e.target as HTMLInputElement).value)}
          placeholder="Type the English word..."
          disabled={submitted}
          autoFocus
        />
        {!submitted && (
          <button type="submit" className="btn btn-primary" disabled={input.trim() === ""}>
            Check
          </button>
        )}
      </form>

      {submitted && (
        <div className="revision-feedback">
          <p>
            Correct: <strong>{current.word}</strong>{" "}
            <button
              type="button"
              className="sound-btn"
              onClick={() => handleSpeakWord(current.word)}
              title="Listen"
            >
              <SpeakerIcon />
            </button>
          </p>
          <p>
            Your answer:{" "}
            <span className={gradeAnswer(input, current.word) >= 0.5 ? "text-ok" : "text-ko"}>
              "{input}"
            </span>
          </p>
          <button type="button" className="btn btn-secondary" onClick={handleNext}>
            {currentIndex < queue.length - 1 ? "Next" : "See Results"}
          </button>
        </div>
      )}
    </div>
  );
}
