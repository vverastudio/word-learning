export interface WordEntry {
  word: string;
  description: string;
  category: string;
}

export interface GuessRecord {
  guesses: boolean[];
}

export interface WordProgress {
  [word: string]: GuessRecord | undefined;
}

export type View = "menu" | "lesson" | "revision";
