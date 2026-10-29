/**
 * LifeStack Audio & Web Notification Engine
 * Uses the Web Audio API to synthesize a crisp, pleasant chime (offline, zero audio file dependencies)
 * and the HTML5 Notification API for native desktop/mobile OS notifications.
 */

let audioCtx: AudioContext | null = null;

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
 * Plays a pleasant two-stage melodic alert chime.
 * Note sequence: D5 (587.33 Hz) -> A5 (880.00 Hz) -> D6 (1174.66 Hz)
 */
export function playNotificationChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const notes = [
      { freq: 587.33, start: now, duration: 0.25 },
      { freq: 880.0, start: now + 0.12, duration: 0.35 },
      { freq: 1174.66, start: now + 0.26, duration: 0.6 },
    ];

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      // Smooth attack and natural bell-like exponential decay
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.28, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + duration + 0.05);
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
