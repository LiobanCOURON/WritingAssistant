// Sound effects using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Click sound - short, crisp
  click() {
    this.playTone(800, 0.05, 'square', 0.05);
  }

  // Hover sound - gentle, high pitch
  hover() {
    this.playTone(1200, 0.03, 'sine', 0.02);
  }

  // Success sound - ascending tones
  success() {
    this.playTone(523, 0.1, 'sine', 0.1); // C5
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.1), 100); // E5
    setTimeout(() => this.playTone(784, 0.15, 'sine', 0.1), 200); // G5
  }

  // Error sound - descending tones
  error() {
    this.playTone(400, 0.1, 'sawtooth', 0.08);
    setTimeout(() => this.playTone(300, 0.15, 'sawtooth', 0.08), 100);
  }

  // Notification sound - bell-like
  notification() {
    this.playTone(880, 0.2, 'sine', 0.08);
    setTimeout(() => this.playTone(1100, 0.3, 'sine', 0.06), 100);
  }

  // Typing sound - very subtle
  typing() {
    this.playTone(600 + Math.random() * 200, 0.02, 'square', 0.01);
  }

  // Whoosh sound - for transitions
  whoosh() {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  // Pop sound - for appearing elements
  pop() {
    this.playTone(600, 0.08, 'sine', 0.08);
    setTimeout(() => this.playTone(900, 0.05, 'sine', 0.06), 50);
  }

  // Drop sound - for drag and drop
  drop() {
    this.playTone(400, 0.1, 'triangle', 0.08);
    setTimeout(() => this.playTone(500, 0.08, 'triangle', 0.06), 80);
  }

  // Celebration sound - for major achievements
  celebration() {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.2, 'sine', 0.1), i * 100);
    });
  }
}

export const soundManager = new SoundManager();
