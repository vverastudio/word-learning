const sounds = {
  click: "/sfx/click.mp3",
  success: "/sfx/succes.mp3",
  mistake: "/sfx/mistake.mp3",
  swoosh: "/sfx/swoosh.mp3",
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
