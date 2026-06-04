import { useState } from "react";
import type { View } from "./types.ts";
import type { WordEntry } from "./types.ts";
import wordsData from "./words.json";
import { MainMenu } from "./components/MainMenu.tsx";
import { Lesson } from "./components/Lesson.tsx";
import { Revision } from "./components/Revision.tsx";

const allWords: WordEntry[] = wordsData.words;
const categories = [...new Set(allWords.map((w) => w.category))];

export function App() {
  const [view, setView] = useState<View>("menu");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  const filteredWords = allWords.filter((w) => selectedCategories.includes(w.category));

  return (
    <div className="app">
      {view === "menu" && (
        <MainMenu
          words={allWords}
          categories={categories}
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          onStartLesson={() => setView("lesson")}
          onStartRevision={() => setView("revision")}
        />
      )}
      {view === "lesson" && <Lesson words={filteredWords} onDone={() => setView("menu")} />}
      {view === "revision" && <Revision words={filteredWords} onDone={() => setView("menu")} />}
    </div>
  );
}
