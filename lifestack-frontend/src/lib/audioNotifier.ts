/**
 * LifeStack Audio & Web Notification Engine
 * Uses the Web Audio API to synthesize a crisp, pleasant chime (offline, zero audio file dependencies)
 * and the HTML5 Notification API for native desktop/mobile OS notifications.
 */

/**
 * LifeStack Audio & Web Notification Engine
 * Uses the Web Audio API to synthesize a multi-stage, 3.5-second melodic alarm chime
 * (offline, zero audio file dependencies) and HTML5 Notification API for native OS notifications.
 */

let audioCtx: AudioContext | null = null;
let activeOscillators: OscillatorNode[] = [];

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Stops any currently playing alarm sound immediately.
 */
export function stopNotificationSound(): void {
  activeOscillators.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      // already stopped or disconnected
    }
  });
  activeOscillators = [];
}

/**
 * Plays a rich, pleasant ~3.5 second multi-phrase melodic alarm chime.
 * Motif: 3 melodic arpeggio phrases with dual-harmonic bell overtones:
 * - Phrase 1 (0.0s - 0.9s): A Major triad arpeggio (A4 -> C#5 -> E5)
 * - Phrase 2 (1.0s - 1.9s): Inverted higher octave (C#5 -> E5 -> A5)
 * - Phrase 3 (2.0s - 3.5s): Ascending resolution into sustained resonant bell (E5 -> A5 -> C#6 -> E6 + A6 chime)
 */
export function playNotificationChime(): void {
  try {
    // Stop any previous playing sound to avoid clashing
    stopNotificationSound();

    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Melody definition across 3.5 seconds
    const melody: Array<{
      freq: number;
      start: number;
      duration: number;
      volume?: number;
      type?: OscillatorType;
    }> = [
      // --- Phrase 1: Soft warm opening arpeggio (0.0s - 0.8s) ---
      { freq: 440.0, start: 0.0, duration: 0.32, volume: 0.22, type: 'triangle' },
      { freq: 880.0, start: 0.0, duration: 0.32, volume: 0.12, type: 'sine' },

      { freq: 554.37, start: 0.22, duration: 0.32, volume: 0.24, type: 'triangle' },
      { freq: 1108.73, start: 0.22, duration: 0.32, volume: 0.14, type: 'sine' },

      { freq: 659.25, start: 0.44, duration: 0.45, volume: 0.26, type: 'triangle' },
      { freq: 1318.51, start: 0.44, duration: 0.45, volume: 0.15, type: 'sine' },

      // --- Phrase 2: Ascending echo phrase (1.0s - 1.8s) ---
      { freq: 554.37, start: 1.0, duration: 0.32, volume: 0.24, type: 'triangle' },
      { freq: 1108.73, start: 1.0, duration: 0.32, volume: 0.14, type: 'sine' },

      { freq: 659.25, start: 1.22, duration: 0.32, volume: 0.26, type: 'triangle' },
      { freq: 1318.51, start: 1.22, duration: 0.32, volume: 0.15, type: 'sine' },

      { freq: 880.0, start: 1.44, duration: 0.48, volume: 0.28, type: 'triangle' },
      { freq: 1760.0, start: 1.44, duration: 0.48, volume: 0.16, type: 'sine' },

      // --- Phrase 3: Grand resolution & sustained bell chime (2.0s - 3.5s) ---
      { freq: 659.25, start: 2.0, duration: 0.32, volume: 0.26, type: 'triangle' },
      { freq: 880.0, start: 2.22, duration: 0.36, volume: 0.28, type: 'triangle' },
      { freq: 1108.73, start: 2.44, duration: 0.42, volume: 0.3, type: 'triangle' },

      // Sustained resonant bell chords ringing out until 3.5s
      { freq: 1318.51, start: 2.7, duration: 0.8, volume: 0.32, type: 'sine' },
      { freq: 1760.0, start: 2.7, duration: 0.8, volume: 0.24, type: 'sine' },
      { freq: 2637.02, start: 2.7, duration: 0.65, volume: 0.12, type: 'sine' },
    ];

    melody.forEach(({ freq, start, duration, volume = 0.25, type = 'sine' }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = now + start;
      const stopTime = startTime + duration;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // Acoustic envelope: rapid attack + smooth exponential decay
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, stopTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(stopTime + 0.05);

      activeOscillators.push(osc);

      osc.onended = () => {
        const idx = activeOscillators.indexOf(osc);
        if (idx !== -1) {
          activeOscillators.splice(idx, 1);
        }
      };
    });
  } catch (err) {
    console.warn('Unable to play synthesized chime:', err);
  }
}

/**
 * Request desktop OS notification permission if not already determined.
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission !== 'default') {
    return Notification.permission;
  }
  try {
    return await Notification.requestPermission();
  } catch (err) {
    console.warn('Notification permission request error:', err);
    return 'denied';
  }
}

/**
 * Send a native browser OS notification.
 */
export function sendSystemNotification(title: string, options?: NotificationOptions): Notification | null {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }
  try {
    const notification = new Notification(title, {
      icon: '/icons/pwa-192x192.png',
      badge: '/favicon.svg',
      ...options,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  } catch (err) {
    console.warn('Failed to dispatch system notification:', err);
    return null;
  }
}

