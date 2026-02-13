import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SoundService {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  playNotificationSound(type: 'check-in' | 'check-out' | 'lunch' | 'timesheet'): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;

    const frequencies: Record<string, number[]> = {
      'check-in': [523, 659, 784],       // C-E-G rising (cheerful morning)
      'check-out': [784, 659, 523],       // G-E-C descending (winding down)
      'lunch': [587, 740, 880],           // D-F#-A bright (lunch bell)
      'timesheet': [440, 554, 659, 880],  // A-C#-E-A urgent
    };

    const freqs = frequencies[type] ?? [440, 554, 659];

    freqs.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.value = freq;

      const startTime = now + i * 0.2;
      gainNode.gain.setValueAtTime(0.3, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      oscillator.start(startTime);
      oscillator.stop(startTime + 0.35);
    });
  }
}
