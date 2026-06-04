const sounds = {
  click: "/word-learning/sfx/click.mp3",
  success: "/word-learning/sfx/succes.mp3",
  mistake: "/word-learning/sfx/mistake.mp3",
  swoosh: "/word-learning/sfx/swoosh.mp3",
  start: "/word-learning/sfx/start.mp3",
} as const;

const audioCache = new Map<string, HTMLAudioElement>();

function getAudio(src: string): HTMLAudioElement {
  let audio = audioCache.get(src);
  if (!audio) {
    audio = new Audio(src);
    audioCache.set(src, audio);
  }
  return audio;
}

export function useSound() {
  function play(name: keyof typeof sounds) {
    const src = sounds[name];
    const audio = getAudio(src);
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  return { play };
}
