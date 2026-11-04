"use client";

/**
 * Optional sound, off by default and never autoplayed. Everything is
 * synthesised with Web Audio (no files to download): a 50 Hz mains hum (India's
 * grid frequency), a peg click, a cable twang, a lamp buzz and a spark.
 */
import { sound as soundConfig } from "@/lib/site-config";

type Name = "peg" | "twang" | "flicker" | "spark" | "add" | "tear";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private hum: { stop: () => void } | null = null;
  private noise: AudioBuffer | null = null;
  enabled = false;
  private last: Record<string, number> = {};

  private ensure() {
    if (this.ctx) return this.ctx;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = soundConfig.masterVolume;
    this.master.connect(this.ctx.destination);
    const len = this.ctx.sampleRate * 1;
    this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return this.ctx;
  }

  /** Must be called from a user gesture. */
  async enable() {
    const ctx = this.ensure();
    if (!ctx) return;
    await ctx.resume();
    this.enabled = true;
    this.startHum();
  }

  disable() {
    this.enabled = false;
    this.hum?.stop();
    this.hum = null;
    void this.ctx?.suspend();
  }

  private startHum() {
    const ctx = this.ctx!;
    const out = ctx.createGain();
    out.gain.value = 0;
    out.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 1.2);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 420;
    const oscs = [50, 100, 150].map((f, i) => {
      const o = ctx.createOscillator();
      o.type = i === 0 ? "sawtooth" : "sine";
      o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = [0.35, 0.5, 0.18][i];
      o.connect(g).connect(lp);
      o.start();
      return o;
    });
    // Slow wobble so it breathes.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.21;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.012;
    lfo.connect(lfoGain).connect(out.gain);
    lfo.start();
    lp.connect(out).connect(this.master!);
    this.hum = {
      stop: () => {
        out.gain.cancelScheduledValues(ctx.currentTime);
        out.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
        window.setTimeout(() => {
          oscs.forEach((o) => o.stop());
          lfo.stop();
        }, 800);
      },
    };
  }

  private burst(dur: number, type: BiquadFilterType, freq: number, gain: number, q = 1) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    const t = ctx.currentTime;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(this.master!);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  private tone(freq: number, dur: number, gain: number, type: OscillatorType = "sine", endFreq?: number) {
    const ctx = this.ctx!;
    const o = ctx.createOscillator();
    o.type = type;
    const t = ctx.currentTime;
    o.frequency.setValueAtTime(freq, t);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master!);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  play(name: Name) {
    if (!this.enabled || !this.ctx || this.ctx.state !== "running") return;
    const now = performance.now();
    if (now - (this.last[name] ?? 0) < 70) return;
    this.last[name] = now;
    switch (name) {
      case "peg":
        this.burst(0.03, "bandpass", 3200, 0.5, 2);
        this.tone(900, 0.05, 0.18, "triangle", 500);
        break;
      case "add":
        this.burst(0.025, "bandpass", 3600, 0.6, 2);
        window.setTimeout(() => this.burst(0.03, "bandpass", 2400, 0.5, 2), 70);
        break;
      case "twang":
        this.tone(118, 0.9, 0.22, "triangle", 74);
        this.tone(118 * 2.76, 0.5, 0.06, "sine", 74 * 2.76);
        break;
      case "flicker": {
        const ctx = this.ctx;
        const o = ctx.createOscillator();
        o.type = "square";
        o.frequency.value = 100;
        const g = ctx.createGain();
        const t = ctx.currentTime;
        g.gain.setValueAtTime(0, t);
        [0, 0.06, 0.15, 0.19].forEach((dt, i) => g.gain.setValueAtTime(i % 2 ? 0 : 0.05, t + dt));
        g.gain.setValueAtTime(0, t + 0.24);
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 900;
        o.connect(lp).connect(g).connect(this.master!);
        o.start(t);
        o.stop(t + 0.3);
        break;
      }
      case "spark":
        for (let i = 0; i < 6; i++) window.setTimeout(() => this.burst(0.02 + Math.random() * 0.04, "highpass", 2500 + Math.random() * 3000, 0.5), i * (30 + Math.random() * 50));
        break;
      case "tear":
        this.burst(0.18, "bandpass", 1800, 0.35, 0.7);
        break;
    }
  }
}

export const sound = new SoundEngine();
