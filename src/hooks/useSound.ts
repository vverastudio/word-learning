const sounds = {
  click: "/word-learning/sfx/click.mp3",
  success: "/word-learning/sfx/succes.mp3",
  mistake: "/word-learning/sfx/mistake.mp3",
  swoosh: "/word-learning/sfx/swoosh.mp3",
  start: "/word-learning/sfx/start.mp3",
} as const;

let audioContext: AudioContext | null = null;
const bufferCache = new Map<string, AudioBuffer>();
const pendingFetches = new Map<string, Promise<AudioBuffer>>();

function getContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return audioContext;
}

function decodeAudio(src: string): Promise<AudioBuffer> {
  const cached = bufferCache.get(src);
  if (cached) return Promise.resolve(cached);

  const pending = pendingFetches.get(src);
  if (pending) return pending;

  const promise = (async () => {
    const ctx = getContext();
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    bufferCache.set(src, audioBuffer);
    pendingFetches.delete(src);
    return audioBuffer;
  })();

  pendingFetches.set(src, promise);
  return promise;
}

export function useSound() {
  function play(name: keyof typeof sounds) {
    const ctx = getContext();
    const src = sounds[name];

    void decodeAudio(src).then((buffer) => {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    });
  }

  return { play };
}
