
class AudioService {
  private ctx: AudioContext | null = null;
  private volumeNode: GainNode | null = null;
  private isUnlocked = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.volumeNode = this.ctx.createGain();
      this.volumeNode.connect(this.ctx.destination);
    } catch (e) {
      console.error("AudioContext initialization failed", e);
    }
  }

  public async unlock() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.isUnlocked = true;
  }

  public setVolume(volume: number) {
    if (this.volumeNode) {
      this.volumeNode.gain.setValueAtTime(volume, this.ctx?.currentTime || 0);
    }
  }

  public playRolling() {
    if (!this.ctx || !this.volumeNode || !this.isUnlocked) return null;
    
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    
    // 機械式點擊聲
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.05);
    
    g.gain.setValueAtTime(0.1, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    
    osc.connect(g);
    g.connect(this.volumeNode);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
    return osc;
  }

  public playStop() {
    if (!this.ctx || !this.volumeNode || !this.isUnlocked) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.3);
    
    g.gain.setValueAtTime(0.4, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    
    osc.connect(g);
    g.connect(this.volumeNode);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  public playWin() {
    if (!this.ctx || !this.volumeNode || !this.isUnlocked) return;
    const now = this.ctx.currentTime;

    const playNote = (freq: number, start: number, duration: number, vol = 0.2, type: OscillatorType = 'sawtooth') => {
      const osc = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator(); // 雙振盪器增加厚度
      const g = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      
      osc2.type = type;
      osc2.frequency.setValueAtTime(freq * 1.005, start); // 微調失真增加質感

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3000, start);
      filter.frequency.exponentialRampToValueAtTime(800, start + duration);

      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(vol, start + 0.05);
      g.gain.exponentialRampToValueAtTime(0.01, start + duration);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(g);
      g.connect(this.volumeNode!);

      osc.start(start);
      osc2.start(start);
      osc.stop(start + duration);
      osc2.stop(start + duration);
    };

    // 華麗開場小號旋律 (C5, E5, G5, C6)
    playNote(523.25, now, 0.2); // C5
    playNote(659.25, now + 0.15, 0.2); // E5
    playNote(783.99, now + 0.3, 0.2); // G5
    
    // 最終大和弦 (C5 + G5 + C6)
    const chordTime = now + 0.45;
    playNote(523.25, chordTime, 2.0, 0.15);
    playNote(783.99, chordTime, 2.0, 0.15);
    playNote(1046.50, chordTime, 2.5, 0.2);
  }
}

export const audioService = new AudioService();
