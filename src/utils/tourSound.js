// Procedural Web Audio API Sound Synthesizer (0 KB Asset Footprint)
// Tạo tiếng chuông đồng và gõ mõ thanh tao phong vị kinh kỳ xưa mà không cần tải tệp mp3

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Tiếng chuông đồng thanh ngân khi chuyển bước (Bell Chime)
 * Sóng âm Sine chuyển từ 880Hz (A5) lướt lên 1320Hz (E6) với độ ngân mềm mại
 */
export function playTourStepChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);

    // Envelope: Bắt đầu êm, đạt đỉnh 0.15 và tắt dần trong 0.55s
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.56);
  } catch {
    // Graceful fallback if user hasn't interacted or audio is blocked
  }
}

/**
 * Hợp âm kết thúc tour rộn ràng (Tri Kỷ Fanfare: C5 - E5 - G5)
 */
export function playTourCompleteFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.66);
    });
  } catch {
    // Graceful fallback
  }
}

/**
 * Tiếng chuông khen ngợi vui tươi khi hoàn thành thao tác (Praise Chime: G5 - C6 - E6)
 * Âm sắc ấm áp phong cách chuông đồng kinh kỳ mang lại cảm giác khen ngợi động viên
 */
export function playPraiseChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [783.99, 1046.5, 1318.51]; // G5, C6, E6
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.14, startTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.46);
    });
  } catch {
    // Graceful fallback
  }
}
