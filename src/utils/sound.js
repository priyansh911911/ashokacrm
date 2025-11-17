/**
 * Sound utility for playing notification sounds
 */

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.isEnabled = true;
  }

  // Initialize audio context
  init() {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.warn('Audio context not supported:', error);
      }
    }
  }

  // Play buzzer sound using Web Audio API
  playBuzzer(frequency = 800, duration = 500, volume = 0.3) {
    if (!this.isEnabled) return;
    
    this.init();
    if (!this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Error playing buzzer sound:', error);
    }
  }

  // Play notification sound for new KOT
  playNewKOTSound() {
    // Play a double beep pattern
    this.playBuzzer(800, 200, 0.3);
    setTimeout(() => this.playBuzzer(1000, 200, 0.3), 300);
  }

  // Enable/disable sounds
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  // Check if sounds are enabled
  isAudioEnabled() {
    return this.isEnabled;
  }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;