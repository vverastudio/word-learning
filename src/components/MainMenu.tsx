import type { WordEntry } from "../types.ts";
import { loadProgress, hasBeenSeen, isKnown } from "../store.ts";

interface MainMenuProps {
  words: WordEntry[];
  categories: string[];
  selectedCategories: string[];
  onToggleCategory: (cat: string) => void;
  onStartLesson: () => void;
  onStartRevision: () => void;
}

export function MainMenu({
  words,
  categories,
  selectedCategories,
  onToggleCategory,
  onStartLesson,
  onStartRevision,
}: MainMenuProps) {
  const progress = loadProgress();
  const total = words.length;
  const seenCount = words.filter((w) => hasBeenSeen(progress[w.word])).length;
  const knownCount = words.filter((w) => isKnown(progress[w.word])).length;

  return (
    <div className="main-menu">
      <h1>Word Learning</h1>

      <div className="stats">
        <div className="stat">
          <span className="stat-value">
            {seenCount}/{total}
          </span>
          <span className="stat-label">seen</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {knownCount}/{total}
          </span>
          <span className="stat-label">known</span>
        </div>
      </div>

      <section className="category-section">
        <h2>Categories</h2>
        <div className="category-list">
          {categories.map((cat) => (
            <button
              type="button"
              className={`category-pill ${selectedCategories.includes(cat) ? "selected" : ""}`}
              onClick={() => onToggleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <div className="action-buttons">
        <button
          type="button"
          className="btn btn-primary"
          disabled={selectedCategories.length === 0}
          onClick={onStartLesson}
        >
          Start Lesson
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={selectedCategories.length === 0}
          onClick={onStartRevision}
        >
          Start Revision
        </button>
      </div>
    </div>
  );
}
