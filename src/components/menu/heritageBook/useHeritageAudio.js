import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook tạo âm thanh sột soạt lật giấy mộc cổ truyền (giấy dó)
 * Sử dụng Web Audio API tổng hợp âm tần bandpass 90ms
 * Không tải tệp ngoài, không độ trễ, tự động giải phóng bộ nhớ.
 */
export function useHeritageAudio() {
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const audioCtxRef = useRef(null);
  const isSoundEnabledRef = useRef(isSoundEnabled);
  isSoundEnabledRef.current = isSoundEnabled;

  // Clean up Web Audio API context when unmounting to prevent memory leaks
  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, []);

  const toggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => !prev);
  }, []);

  const playFlipSound = useCallback(() => {
    if (!isSoundEnabledRef.current) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const duration = 0.09; // 90ms
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      // White noise with decay envelope
      for (let i = 0; i < bufferSize; i++) {
        const decay = 1 - i / bufferSize;
        output[i] = (Math.random() * 2 - 1) * decay;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      // Bandpass filter centered around 750Hz for warm paper rustle
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      whiteNoise.start(ctx.currentTime);
      whiteNoise.stop(ctx.currentTime + duration);
    } catch {
      // Gracefully swallow any browser autoplay restrictions
    }
  }, []);

  return {
    isSoundEnabled,
    toggleSound,
    playFlipSound,
  };
}
